-- M7 scaffold, Phase 2: the generic idempotency primitive every mutating
-- RPC (Phase 3 onward) calls first, porting src/data/adapters/memory/
-- idempotency.ts's isFirstUse(method, key) exactly — same two-argument
-- shape, same "true the first time, false on every replay" contract,
-- just backed by a real unique constraint instead of an in-process Map.
--
-- Not exposed to PostgREST/clients at all (no grant to authenticated) —
-- these three functions are only ever called from inside other
-- SECURITY DEFINER RPCs, which run as their own owner and so need no
-- separate EXECUTE grant to call them, the same way one plpgsql function
-- can always call another owned by the same role.
create table idempotency_keys (
  method text not null,
  key text not null,
  -- Only populated by the handful of mutations with no natural post-hoc
  -- lookup a replay can fall back on (post_quest, send_message, deposit,
  -- cash_out, report_user — postedByKey's own reasoning in
  -- src/data/adapters/memory/quests.ts, ported here as a jsonb cache
  -- instead of a second in-process Map). Every other mutating RPC calls
  -- idempotency_claim() alone and, on replay, re-derives its return value
  -- from the row's current state — exactly like withdrawOffer/
  -- declineOffer/acceptOffer do in the memory adapter today.
  result jsonb,
  created_at timestamptz not null default now(),
  primary key (method, key)
);

alter table idempotency_keys enable row level security;
revoke all on idempotency_keys from anon, authenticated;
-- No policies at all — every access goes through the three functions
-- below, called from inside other definer functions.

create or replace function idempotency_claim(p_method text, p_key text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into idempotency_keys(method, key) values (p_method, p_key);
  return true;
exception when unique_violation then
  return false;
end;
$$;

create or replace function idempotency_store_result(p_method text, p_key text, p_result jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  update idempotency_keys set result = p_result where method = p_method and key = p_key;
$$;

create or replace function idempotency_result(p_method text, p_key text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select result from idempotency_keys where method = p_method and key = p_key;
$$;
