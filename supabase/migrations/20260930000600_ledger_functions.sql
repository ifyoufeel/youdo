-- M7 scaffold, Phase 5: deposit/cash_out — the only two LedgerPort
-- mutations (ports/ledger.ts's own header comment: hold/release/refund,
-- built in Phase 4, are ledger-internal side effects of a lifecycle
-- transition, never routed through here). listEntriesForUser/balanceOf/
-- listPaymentsForUser need no new SQL at all — Phase 1's ledger_entries_own/
-- payments_own RLS policies already scope reads to the owner; the TS
-- adapter (ledger.ts) queries the tables directly.
--
-- Settlement has no live project to run a real webhook/cron against
-- (M7's "scaffold only" scope) — the memory adapter's own
-- payment-settlement.ts drives it with a jittered client-side timer
-- calling straight into local state; this scaffold does the same thing
-- but through settle_payment(), a real RPC the client calls after that
-- same delay. That is a genuine trust-boundary simplification worth
-- naming plainly: a real deployment would settle server-side, not on
-- the client's say-so. It's safe here only because settle_payment
-- re-validates everything itself (ownership, still-pending, and for a
-- cash-out, the balance again at settlement time, not just at
-- initiation) before writing a single ledger entry — a client that
-- never calls it just leaves a payment pending forever, it can never
-- corrupt the ledger. Phase 9's docs record this as the piece a real
-- provisioning pass should replace with a server-side job.
create or replace function deposit(p_amount_minor bigint, p_idempotency_key text)
returns payments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment payments;
  v_cached jsonb;
begin
  if p_amount_minor is null or p_amount_minor <= 0 then
    raise exception 'Add an amount above zero';
  end if;

  if not idempotency_claim('deposit', p_idempotency_key) then
    v_cached := idempotency_result('deposit', p_idempotency_key);
    if v_cached is not null then
      return jsonb_populate_record(null::payments, v_cached);
    end if;
  end if;

  insert into payments (txn_id, kind, user_id, amount_minor, state, provider_id)
  values ('tx-topup-' || gen_random_uuid()::text, 'deposit', auth.uid(), p_amount_minor, 'pending', 'sim-' || gen_random_uuid()::text)
  returning * into v_payment;

  perform idempotency_store_result('deposit', p_idempotency_key, to_jsonb(v_payment));
  return v_payment;
end;
$$;

create or replace function cash_out(p_amount_minor bigint, p_idempotency_key text)
returns payments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment payments;
  v_cached jsonb;
begin
  if p_amount_minor is null or p_amount_minor <= 0 then
    raise exception 'Cash out an amount you have available';
  end if;

  if not idempotency_claim('cash_out', p_idempotency_key) then
    v_cached := idempotency_result('cash_out', p_idempotency_key);
    if v_cached is not null then
      return jsonb_populate_record(null::payments, v_cached);
    end if;
  end if;

  if p_amount_minor > spendable_of(auth.uid()) then
    raise exception 'Cash out an amount you have available';
  end if;

  insert into payments (txn_id, kind, user_id, amount_minor, state, provider_id)
  values ('tx-cash-' || gen_random_uuid()::text, 'cashout', auth.uid(), p_amount_minor, 'pending', 'sim-' || gen_random_uuid()::text)
  returning * into v_payment;

  perform idempotency_store_result('cash_out', p_idempotency_key, to_jsonb(v_payment));
  return v_payment;
end;
$$;

-- Re-checks at settlement time, not just at initiation — the available
-- balance can move between the two (another payout settling first, an
-- offer accepted in between) — matches the memory adapter's own
-- settlement callback exactly.
create or replace function settle_payment(p_payment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment payments;
  v_bank text;
begin
  select * into v_payment from payments where id = p_payment_id;
  if v_payment.id is null or v_payment.state <> 'pending' then
    return;
  end if;
  if v_payment.user_id <> auth.uid() then
    raise exception 'Not your payment';
  end if;

  select bank into v_bank from profiles where id = v_payment.user_id;
  v_bank := coalesce(v_bank, 'bank');

  if v_payment.kind = 'cashout' and balance_of(v_payment.user_id, 'user_available') < v_payment.amount_minor then
    update payments set state = 'failed', settled_at = now() where id = p_payment_id;
    perform notify_user(v_payment.user_id, 'payment', null, 'A cash-out didn''t go through — nothing moved');
    return;
  end if;

  if v_payment.kind = 'deposit' then
    perform post_txn(v_payment.txn_id, jsonb_build_array(
      jsonb_build_object('account', 'external_bank', 'user_id', v_payment.user_id, 'quest_id', null, 'amount_minor', -v_payment.amount_minor, 'memo', 'Added from ' || v_bank),
      jsonb_build_object('account', 'user_available', 'user_id', v_payment.user_id, 'quest_id', null, 'amount_minor', v_payment.amount_minor, 'memo', 'Added from ' || v_bank)
    ));
    update payments set state = 'succeeded', settled_at = now() where id = p_payment_id;
    perform notify_user(v_payment.user_id, 'payment', null, format_money_twd(v_payment.amount_minor) || ' added to your wallet');
  else
    perform post_txn(v_payment.txn_id, jsonb_build_array(
      jsonb_build_object('account', 'user_available', 'user_id', v_payment.user_id, 'quest_id', null, 'amount_minor', -v_payment.amount_minor, 'memo', 'Cash out to ' || v_bank),
      jsonb_build_object('account', 'external_bank', 'user_id', v_payment.user_id, 'quest_id', null, 'amount_minor', v_payment.amount_minor, 'memo', 'Cash out to ' || v_bank)
    ));
    update payments set state = 'succeeded', settled_at = now() where id = p_payment_id;
    perform notify_user(v_payment.user_id, 'payment', null, format_money_twd(v_payment.amount_minor) || ' is on its way to your bank');
  end if;
end;
$$;

revoke all on function deposit(bigint, text) from public;
grant execute on function deposit(bigint, text) to authenticated;

revoke all on function cash_out(bigint, text) from public;
grant execute on function cash_out(bigint, text) to authenticated;

revoke all on function settle_payment(uuid) from public;
grant execute on function settle_payment(uuid) to authenticated;
