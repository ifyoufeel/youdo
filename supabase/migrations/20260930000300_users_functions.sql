-- M7 scaffold, Phase 2: the one users.ts mutation that can't be a plain
-- RLS-protected column update (Phase 1's profiles_update_own policy
-- already covers updateProfile for real) — deleteAccount touches `bank`,
-- which is deliberately outside UpdateProfileInput's client-writable
-- surface (src/data/ports/users.ts), so it needs elevated privilege.
-- Ports src/data/adapters/memory/users.ts's deleteAccount exactly: same
-- five fields anonymized, same "naturally idempotent, no result to
-- replay" shape (the port doc comment on deleteAccount says so
-- explicitly) — idempotency_claim alone, no idempotency_store_result.
create or replace function delete_account(p_idempotency_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not idempotency_claim('delete_account', p_idempotency_key) then
    return;
  end if;
  update profiles
  set name = 'Deleted user', bio = '', phone = '', email = '', bank = ''
  where id = auth.uid();
end;
$$;

revoke all on function delete_account(text) from public;
grant execute on function delete_account(text) to authenticated;
