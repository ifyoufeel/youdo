-- M8: push notification device-token registration. Code-only slice,
-- same "real scaffold, never run against a live project" posture as M7
-- — see docs/DECISIONS.md's ADR-017.
--
-- push_token is deliberately excluded from the SELECT grant below, the
-- same column-exclusion move ADR-015 already used for
-- quests.address_line: profiles_select (Phase 1) is `using (true)` —
-- every authenticated user can read every profile row — and a push
-- token readable by anyone would let any user push arbitrary content
-- straight to another user's phone through Expo's send endpoint, which
-- needs no credential beyond the token itself. It's never part of
-- src/data/contracts/user.ts's User either, matching the memory
-- adapter's own private pushTokens Map (src/data/adapters/memory/
-- store.ts) — adapter-internal state, not a port-level read.
alter table profiles add column push_token text;

-- A pre-existing gap this column addition surfaced while touching the
-- same grant: Phase 1's migration (20260930000100_rls.sql) revokes all
-- privileges on profiles and a policy alone doesn't restore any —
-- every other table in that migration either re-grants SELECT directly
-- (categories, areas, offers, threads, messages, ledger_entries,
-- payments, reviews, notifications) or exposes a view
-- (quests_with_address); profiles did neither, so getUser/listUsers
-- would fail outright against a real instance. Fixed here, in the same
-- statement shape as Phase 1's own column-scoped UPDATE grant, since
-- this migration is already editing the same table's privileges.
grant select (
  id, name, rating, quests_completed, verified, area, home_x, home_y,
  cancel_rate, bio, phone, email, bank, joined
) on profiles to authenticated;

-- Column-scoped UPDATE, additive to Phase 1's own grant on the same
-- table. profiles_update_own (Phase 1) already restricts rows to
-- `id = auth.uid()` with no further guard logic, so this needs no RPC
-- either — same reasoning Phase 1's own comment gives for updateProfile.
grant update (push_token) on profiles to authenticated;
