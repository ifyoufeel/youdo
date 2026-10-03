-- M7 scaffold, Phase 4: offers (send/withdraw/decline/accept) and the
-- full quest lifecycle (start/mark-done/confirm-done/cancel/dispute), as
-- SECURITY DEFINER RPCs porting src/data/adapters/memory/{offers,
-- quests}.ts's exact guard logic, plus the ledger-internal escrow
-- helpers (hold/release/refund) accept_offer/confirm_done/cancel_quest
-- call as side effects — never through a public LedgerPort method, same
-- boundary ports/ledger.ts's own header comment draws.
--
-- One deliberate departure from the memory adapter: withdraw_offer/
-- decline_offer/accept_offer/start_quest/mark_done/confirm_done/
-- cancel_quest/dispute_quest all check the caller actually owns the
-- role they're acting as (offer's doer, quest's poster/accepted doer).
-- ports/offers.ts's own header comment notes withdrawOffer/
-- declineOffer/acceptOffer take no actorId in the real port — a
-- single-process mock has no other user who could call them with a
-- forged id, but a real multi-tenant database does, so this scaffold
-- adds the check the memory adapter never needed. Same posture as Phase
-- 1's address-hiding: tightening a gap the memory adapter's trust model
-- papered over, not a behavior change for a legitimate caller.
--
-- A second departure, recorded honestly rather than silently dropped:
-- TRANSITIONS' `completed -> paid` row also lists `system` as a legal
-- actor (src/data/domain/lifecycle.ts) — the 72-hour auto-release the
-- memory adapter's clock sweep performs (advance-clock.ts). No such
-- sweep exists here: it would need a real scheduler (pg_cron or an Edge
-- Function on a timer) to run against, and there is no live project to
-- schedule one against yet. confirm_done below is reachable by the
-- poster only. Phase 9's docs record this as an open gap, not a
-- silent omission.

-- ---------------------------------------------------------------------
-- Ledger internals — post_txn is the one place every write goes
-- through (mirrors post-txn.ts's own role), asserting the zero-sum
-- invariant domain/ledger.ts's stampTxn enforces in the memory adapter.
-- fee_on ports domain/fees.ts's feeOn (FEE_BPS=1000, floor rounding)
-- verbatim. None of these are granted to authenticated/anon — every
-- caller is another SECURITY DEFINER function owned by the same role,
-- which needs no separate grant to call a function its own owner
-- already has implicit EXECUTE on.
-- ---------------------------------------------------------------------
create or replace function fee_on(p_minor bigint)
returns bigint
language sql
immutable
as $$
  select floor(p_minor * 1000 / 10000.0)::bigint;
$$;

-- Deliberately simplified vs. money.ts's formatMoney (no thousands
-- grouping, no "drop trailing .00" rule) — used only inside a
-- notification body's plain text, not a UI amount, and duplicating
-- formatMoney's exact display-formatting algorithm in SQL for that one
-- use isn't worth it. formatMoney itself stays the only real formatting
-- boundary, per money.ts's own header comment.
create or replace function format_money_twd(p_minor bigint)
returns text
language sql
immutable
as $$
  select (case when p_minor < 0 then '-' else '' end) || 'NT$' || (abs(p_minor) / 100);
$$;

create or replace function balance_of(p_user_id uuid, p_account ledger_account)
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(sum(amount_minor), 0) from ledger_entries where user_id = p_user_id and account = p_account;
$$;

create or replace function held_for_quest(p_poster_id uuid, p_quest_id uuid)
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(sum(amount_minor), 0) from ledger_entries
  where account = 'user_held' and user_id = p_poster_id and quest_id = p_quest_id;
$$;

-- Available minus any cash-out still in flight (Phase 5 builds the
-- payments-table writer; this reads it defensively now — the table
-- exists since Phase 0 and is simply always empty of cashout rows until
-- then, which is a correct zero, not a bug).
create or replace function spendable_of(p_user_id uuid)
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select balance_of(p_user_id, 'user_available')
    - coalesce(
        (select sum(amount_minor) from payments where user_id = p_user_id and kind = 'cashout' and state = 'pending'),
        0
      );
$$;

create or replace function notify_user(p_user_id uuid, p_type notification_type, p_quest_id uuid, p_body text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into notifications(user_id, type, quest_id, body) values (p_user_id, p_type, p_quest_id, p_body);
$$;

-- Entries as jsonb, asserted to sum to zero before a single row is
-- written — the one real fix over the prototype's own postTxn that the
-- memory adapter's domain/ledger.ts already made (raise, don't
-- console.error-and-drop).
create or replace function post_txn(p_txn_id text, p_entries jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sum bigint;
begin
  select coalesce(sum((e->>'amount_minor')::bigint), 0) into v_sum from jsonb_array_elements(p_entries) e;
  if v_sum <> 0 then
    raise exception 'Ledger transaction "%" does not sum to zero (got %)', p_txn_id, v_sum;
  end if;

  insert into ledger_entries (txn_id, account, user_id, quest_id, amount_minor, memo)
  select
    p_txn_id,
    (e->>'account')::ledger_account,
    nullif(e->>'user_id', '')::uuid,
    nullif(e->>'quest_id', '')::uuid,
    (e->>'amount_minor')::bigint,
    e->>'memo'
  from jsonb_array_elements(p_entries) e;
end;
$$;

create or replace function hold_escrow(p_quest_id uuid, p_poster_id uuid, p_amount_minor bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform post_txn(
    'tx-hold-' || gen_random_uuid()::text,
    jsonb_build_array(
      jsonb_build_object('account', 'user_available', 'user_id', p_poster_id, 'quest_id', p_quest_id, 'amount_minor', -p_amount_minor, 'memo', 'Held for a quest'),
      jsonb_build_object('account', 'user_held', 'user_id', p_poster_id, 'quest_id', p_quest_id, 'amount_minor', p_amount_minor, 'memo', 'Held for a quest')
    )
  );
end;
$$;

-- txn_prefix distinguishes a poster-initiated confirm ("tx-release")
-- from a future auto-release sweep ("tx-auto", not built here — see this
-- file's header comment) — otherwise byte-identical entries, same
-- reasoning escrow.ts's own releaseEscrow gives.
create or replace function release_escrow(p_quest_id uuid, p_poster_id uuid, p_doer_id uuid, p_gross bigint, p_txn_prefix text)
returns table (fee bigint, net bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_held bigint := held_for_quest(p_poster_id, p_quest_id);
  v_fee bigint := fee_on(p_gross);
  v_net bigint := p_gross - v_fee;
begin
  if v_held <> p_gross then
    raise exception 'Ledger invariant: quest % has % minor units held for %, expected %', p_quest_id, v_held, p_poster_id, p_gross;
  end if;
  perform post_txn(
    p_txn_prefix || '-' || gen_random_uuid()::text,
    jsonb_build_array(
      jsonb_build_object('account', 'user_held', 'user_id', p_poster_id, 'quest_id', p_quest_id, 'amount_minor', -p_gross, 'memo', 'Released to the doer'),
      jsonb_build_object('account', 'user_available', 'user_id', p_doer_id, 'quest_id', p_quest_id, 'amount_minor', v_net, 'memo', 'Quest paid'),
      jsonb_build_object('account', 'platform_fee', 'user_id', null, 'quest_id', p_quest_id, 'amount_minor', v_fee, 'memo', 'Platform fee')
    )
  );
  return query select v_fee, v_net;
end;
$$;

create or replace function refund_escrow(p_quest_id uuid, p_poster_id uuid, p_amount_minor bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_held bigint := held_for_quest(p_poster_id, p_quest_id);
begin
  if v_held <> p_amount_minor then
    raise exception 'Ledger invariant: quest % has % minor units held for %, expected %', p_quest_id, v_held, p_poster_id, p_amount_minor;
  end if;
  perform post_txn(
    'tx-refund-' || gen_random_uuid()::text,
    jsonb_build_array(
      jsonb_build_object('account', 'user_held', 'user_id', p_poster_id, 'quest_id', p_quest_id, 'amount_minor', -p_amount_minor, 'memo', 'Refunded after cancellation'),
      jsonb_build_object('account', 'user_available', 'user_id', p_poster_id, 'quest_id', p_quest_id, 'amount_minor', p_amount_minor, 'memo', 'Refunded after cancellation')
    )
  );
end;
$$;

-- ---------------------------------------------------------------------
-- Offers
-- ---------------------------------------------------------------------
create or replace function send_offer(p_quest_id uuid, p_amount_minor bigint, p_note text, p_idempotency_key text)
returns offers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quest quests;
  v_offer offers;
  v_doer_name text;
begin
  select * into v_quest from quests where id = p_quest_id;
  if v_quest.id is null then
    raise exception 'sendOffer: no such quest';
  end if;
  if v_quest.poster_id = auth.uid() then
    raise exception 'This is your own quest — you can''t offer on it';
  end if;
  if v_quest.status <> 'open' then
    raise exception 'This quest isn''t taking offers any more';
  end if;
  if p_amount_minor <= 0 then
    raise exception 'Name a price above zero';
  end if;

  -- Checked before "already has an offer" — a replay must find the
  -- offer the first attempt created, not be rejected by the guard it
  -- already satisfied (same ordering as the memory adapter's own
  -- sendOffer, whose comment explains why).
  if not idempotency_claim('send_offer', p_idempotency_key) then
    select * into v_offer from offers
      where quest_id = p_quest_id and doer_id = auth.uid() and status in ('pending', 'accepted')
      limit 1;
    if v_offer.id is not null then
      return v_offer;
    end if;
  end if;

  if exists (
    select 1 from offers where quest_id = p_quest_id and doer_id = auth.uid() and status in ('pending', 'accepted')
  ) then
    raise exception 'You already have an offer on this quest';
  end if;

  insert into offers (quest_id, doer_id, amount_minor, note)
  values (p_quest_id, auth.uid(), p_amount_minor, coalesce(p_note, ''))
  returning * into v_offer;

  insert into threads (quest_id, poster_id, doer_id)
  values (p_quest_id, v_quest.poster_id, auth.uid())
  on conflict (quest_id, doer_id) do nothing;

  select name into v_doer_name from profiles where id = auth.uid();
  perform notify_user(
    v_quest.poster_id, 'offer_received', p_quest_id,
    coalesce(v_doer_name, 'Someone') || ' offered ' || format_money_twd(p_amount_minor) || ' on "' || v_quest.title || '"'
  );

  return v_offer;
end;
$$;

create or replace function withdraw_offer(p_offer_id uuid, p_idempotency_key text)
returns offers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offer offers;
begin
  select * into v_offer from offers where id = p_offer_id;
  if v_offer.id is null then
    raise exception 'withdrawOffer: no such offer';
  end if;
  if v_offer.doer_id <> auth.uid() then
    raise exception 'Not your offer';
  end if;
  if not idempotency_claim('withdraw_offer', p_idempotency_key) then
    return v_offer;
  end if;
  if v_offer.status <> 'pending' then
    raise exception 'That offer can''t be withdrawn';
  end if;
  update offers set status = 'withdrawn', responded_at = now() where id = p_offer_id returning * into v_offer;
  return v_offer;
end;
$$;

create or replace function decline_offer(p_offer_id uuid, p_idempotency_key text)
returns offers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offer offers;
  v_quest quests;
begin
  select * into v_offer from offers where id = p_offer_id;
  if v_offer.id is null then
    raise exception 'declineOffer: no such offer';
  end if;
  select * into v_quest from quests where id = v_offer.quest_id;
  if v_quest.poster_id <> auth.uid() then
    raise exception 'Not your quest';
  end if;
  if not idempotency_claim('decline_offer', p_idempotency_key) then
    return v_offer;
  end if;
  if v_offer.status <> 'pending' then
    raise exception 'That offer can''t be declined';
  end if;
  update offers set status = 'declined', responded_at = now() where id = p_offer_id returning * into v_offer;
  perform notify_user(v_offer.doer_id, 'offer_declined', v_offer.quest_id, '"' || v_quest.title || '" wasn''t taken this time');
  return v_offer;
end;
$$;

create or replace function accept_offer(p_offer_id uuid, p_idempotency_key text)
returns table (offer offers, quest quests)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offer offers;
  v_quest quests;
  v_spendable bigint;
  v_short bigint;
  v_other offers;
begin
  select * into v_offer from offers where id = p_offer_id;
  if v_offer.id is null then
    raise exception 'acceptOffer: no such offer';
  end if;
  select * into v_quest from quests where id = v_offer.quest_id;
  if v_quest.id is null then
    raise exception 'acceptOffer: no such quest';
  end if;
  if v_quest.poster_id <> auth.uid() then
    raise exception 'Not your quest';
  end if;

  -- Replay via the natural post-hoc lookup — quest.accepted_offer_id is
  -- already this offer's id once the first call succeeded — same as the
  -- memory adapter's own acceptOffer.
  if not idempotency_claim('accept_offer', p_idempotency_key) then
    if v_quest.accepted_offer_id = v_offer.id then
      return query select v_offer, v_quest;
      return;
    end if;
  end if;

  if v_quest.status <> 'open' then
    raise exception 'This quest isn''t taking offers any more';
  end if;
  if v_offer.status <> 'pending' then
    raise exception 'That offer can''t be accepted';
  end if;

  v_spendable := spendable_of(v_quest.poster_id);
  if v_spendable < v_offer.amount_minor then
    v_short := v_offer.amount_minor - v_spendable;
    raise exception 'You need % more in your wallet to hold this', format_money_twd(v_short);
  end if;

  perform hold_escrow(v_quest.id, v_quest.poster_id, v_offer.amount_minor);

  update offers set status = 'accepted', responded_at = now() where id = v_offer.id returning * into v_offer;
  update quests set status = 'assigned', accepted_offer_id = v_offer.id where id = v_quest.id returning * into v_quest;

  perform notify_user(v_offer.doer_id, 'offer_accepted', v_quest.id, 'Your offer on "' || v_quest.title || '" was accepted');

  for v_other in
    select * from offers where quest_id = v_quest.id and status = 'pending' and id <> v_offer.id
  loop
    update offers set status = 'declined', responded_at = now() where id = v_other.id;
    perform notify_user(v_other.doer_id, 'offer_declined', v_quest.id, '"' || v_quest.title || '" went to someone else');
  end loop;

  return query select v_offer, v_quest;
end;
$$;

-- ---------------------------------------------------------------------
-- Quest lifecycle. Each hardcodes its own single transition's actor
-- check directly (poster/accepted-doer id comparison) rather than
-- porting src/data/domain/lifecycle.ts's fully generic TRANSITIONS
-- table + roleOn machinery into SQL — there are exactly five
-- transitions reachable here, each with one fixed actor set, so a
-- generic table would be ceremony without real benefit in a scaffold.
-- ---------------------------------------------------------------------
create or replace function start_quest(p_quest_id uuid, p_idempotency_key text)
returns quests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quest quests;
  v_doer_id uuid;
  v_doer_name text;
begin
  select * into v_quest from quests where id = p_quest_id;
  if v_quest.id is null then
    raise exception 'startQuest: no such quest';
  end if;
  select doer_id into v_doer_id from offers where id = v_quest.accepted_offer_id;
  if v_doer_id is distinct from auth.uid() then
    raise exception 'You''re not on this quest';
  end if;

  if not idempotency_claim('start_quest', p_idempotency_key) then
    return v_quest;
  end if;
  if v_quest.status <> 'assigned' then
    raise exception 'A doer can''t move this from %', v_quest.status;
  end if;

  update quests set status = 'in_progress', started_at = now() where id = p_quest_id returning * into v_quest;

  select name into v_doer_name from profiles where id = auth.uid();
  perform notify_user(v_quest.poster_id, 'quest_started', v_quest.id, coalesce(v_doer_name, 'The doer') || ' started "' || v_quest.title || '"');
  return v_quest;
end;
$$;

create or replace function mark_done(p_quest_id uuid, p_idempotency_key text)
returns quests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quest quests;
  v_doer_id uuid;
  v_doer_name text;
begin
  select * into v_quest from quests where id = p_quest_id;
  if v_quest.id is null then
    raise exception 'markDone: no such quest';
  end if;
  select doer_id into v_doer_id from offers where id = v_quest.accepted_offer_id;
  if v_doer_id is distinct from auth.uid() then
    raise exception 'You''re not on this quest';
  end if;

  if not idempotency_claim('mark_done', p_idempotency_key) then
    return v_quest;
  end if;
  if v_quest.status <> 'in_progress' then
    raise exception 'A doer can''t move this from %', v_quest.status;
  end if;

  update quests set status = 'completed', completed_at = now() where id = p_quest_id returning * into v_quest;

  select name into v_doer_name from profiles where id = auth.uid();
  perform notify_user(v_quest.poster_id, 'quest_done', v_quest.id, coalesce(v_doer_name, 'The doer') || ' marked "' || v_quest.title || '" as done');
  return v_quest;
end;
$$;

-- completed -> paid, poster-initiated only — see this file's header
-- comment for why the `system` auto-release actor isn't reachable here.
create or replace function confirm_done(p_quest_id uuid, p_idempotency_key text)
returns quests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quest quests;
  v_offer offers;
  v_fee bigint;
  v_net bigint;
begin
  select * into v_quest from quests where id = p_quest_id;
  if v_quest.id is null then
    raise exception 'confirmDone: no such quest';
  end if;
  if v_quest.poster_id <> auth.uid() then
    raise exception 'You''re not on this quest';
  end if;

  if not idempotency_claim('confirm_done', p_idempotency_key) then
    return v_quest;
  end if;
  if v_quest.status <> 'completed' then
    raise exception 'A poster can''t move this from %', v_quest.status;
  end if;

  select * into v_offer from offers where id = v_quest.accepted_offer_id;
  if v_offer.id is null then
    raise exception 'This quest has no accepted offer to pay';
  end if;

  select fee, net into v_fee, v_net from release_escrow(v_quest.id, v_quest.poster_id, v_offer.doer_id, v_offer.amount_minor, 'tx-release');

  update quests set status = 'paid', paid_at = now() where id = p_quest_id returning * into v_quest;

  perform notify_user(v_offer.doer_id, 'payment', v_quest.id, format_money_twd(v_net) || ' released to your wallet for "' || v_quest.title || '"');
  return v_quest;
end;
$$;

create or replace function cancel_quest(p_quest_id uuid, p_reason text, p_idempotency_key text)
returns quests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quest quests;
  v_offer offers;
  v_role text;
  v_reason text := trim(coalesce(p_reason, ''));
  v_counterpart_id uuid;
begin
  select * into v_quest from quests where id = p_quest_id;
  if v_quest.id is null then
    raise exception 'cancelQuest: no such quest';
  end if;
  select * into v_offer from offers where id = v_quest.accepted_offer_id;

  if v_quest.poster_id = auth.uid() then
    v_role := 'poster';
  elsif v_offer.doer_id = auth.uid() then
    v_role := 'doer';
  else
    raise exception 'You''re not on this quest';
  end if;

  if not idempotency_claim('cancel_quest', p_idempotency_key) then
    return v_quest;
  end if;

  if v_quest.status = 'open' then
    if v_role <> 'poster' then
      raise exception 'A % can''t move this from open', v_role;
    end if;
  elsif v_quest.status in ('assigned', 'in_progress') then
    if v_reason = '' then
      raise exception 'Say why, so the other side knows what happened';
    end if;
  else
    raise exception 'A % can''t move this from %', v_role, v_quest.status;
  end if;

  if v_offer.id is not null and v_offer.status = 'accepted' then
    perform refund_escrow(v_quest.id, v_quest.poster_id, v_offer.amount_minor);
  else
    update offers set status = 'withdrawn', responded_at = now()
      where quest_id = v_quest.id and status = 'pending';
  end if;

  update quests
    set status = 'cancelled', cancelled_at = now(), cancelled_by = auth.uid(), cancel_reason = nullif(v_reason, '')
    where id = p_quest_id
    returning * into v_quest;

  v_counterpart_id := case when v_role = 'poster' then v_offer.doer_id else v_quest.poster_id end;
  if v_counterpart_id is not null then
    perform notify_user(
      v_counterpart_id, 'quest_cancelled', v_quest.id,
      case when v_reason <> '' then '"' || v_quest.title || '" was cancelled: ' || v_reason
           else '"' || v_quest.title || '" was cancelled' end
    );
  end if;

  return v_quest;
end;
$$;

create or replace function dispute_quest(p_quest_id uuid, p_reason text, p_idempotency_key text)
returns quests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quest quests;
  v_offer offers;
  v_reason text := trim(coalesce(p_reason, ''));
begin
  select * into v_quest from quests where id = p_quest_id;
  if v_quest.id is null then
    raise exception 'disputeQuest: no such quest';
  end if;
  if v_quest.poster_id <> auth.uid() then
    raise exception 'You''re not on this quest';
  end if;

  if not idempotency_claim('dispute_quest', p_idempotency_key) then
    return v_quest;
  end if;
  if v_quest.status <> 'completed' then
    raise exception 'A poster can''t move this from %', v_quest.status;
  end if;
  if v_reason = '' then
    raise exception 'Say what happened, so we can look into it';
  end if;
  if v_quest.completed_at is not null and now() > v_quest.completed_at + interval '72 hours' then
    raise exception 'The confirm window has already closed';
  end if;

  update quests set status = 'disputed', disputed_at = now(), dispute_reason = v_reason
    where id = p_quest_id returning * into v_quest;

  select * into v_offer from offers where id = v_quest.accepted_offer_id;
  if v_offer.id is not null then
    perform notify_user(v_offer.doer_id, 'quest_disputed', v_quest.id, '"' || v_quest.title || '" was disputed: ' || v_reason);
  end if;

  return v_quest;
end;
$$;

-- ---------------------------------------------------------------------
-- Grants — every one of the nine mutating RPCs above, and nothing else
-- (the ledger/notify internals stay ungranted, per this file's header
-- comment).
-- ---------------------------------------------------------------------
revoke all on function send_offer(uuid, bigint, text, text) from public;
grant execute on function send_offer(uuid, bigint, text, text) to authenticated;

revoke all on function withdraw_offer(uuid, text) from public;
grant execute on function withdraw_offer(uuid, text) to authenticated;

revoke all on function decline_offer(uuid, text) from public;
grant execute on function decline_offer(uuid, text) to authenticated;

revoke all on function accept_offer(uuid, text) from public;
grant execute on function accept_offer(uuid, text) to authenticated;

revoke all on function start_quest(uuid, text) from public;
grant execute on function start_quest(uuid, text) to authenticated;

revoke all on function mark_done(uuid, text) from public;
grant execute on function mark_done(uuid, text) to authenticated;

revoke all on function confirm_done(uuid, text) from public;
grant execute on function confirm_done(uuid, text) to authenticated;

revoke all on function cancel_quest(uuid, text, text) from public;
grant execute on function cancel_quest(uuid, text, text) to authenticated;

revoke all on function dispute_quest(uuid, text, text) from public;
grant execute on function dispute_quest(uuid, text, text) to authenticated;
