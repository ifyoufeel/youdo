-- M7 scaffold, Phase 1: row-level security for every table, plus real
-- server-side address hiding for quests.address_line (PRD §4.3 / the
-- ROADMAP's own M7 checklist naming this specifically). Never run
-- against a live project — see this migration's sibling files' header
-- comments and docs/DECISIONS.md's new ADR (Phase 9) for the "scaffold
-- only" scope this was built under.
--
-- Design, in one paragraph: every *mutation* with real guard logic
-- (accept an offer, confirm done, submit a review, ...) goes through a
-- SECURITY DEFINER RPC function (Phase 2 onward), never a direct table
-- write from the client — so base tables grant SELECT only to
-- `authenticated` (never `anon`; PRD/ADR-007 has no unauthenticated
-- browsing) and grant no INSERT/UPDATE/DELETE at all, except the small
-- set of mutations with no cross-row guard logic to enforce (saved
-- quests, blocking, marking a thread read), which get a plain RLS
-- policy instead of RPC ceremony. This mirrors the memory adapter's own
-- shape almost exactly: guarded mutations live in one function per
-- action (src/data/adapters/memory/{offers,quests,ledger,...}.ts),
-- unguarded ones are a bare Map/Set write (savedQuestIds.add,
-- blockedUserIds.add, threadReadAt.set).

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
alter table profiles enable row level security;
revoke all on profiles from anon, authenticated;

create policy profiles_select on profiles
  for select to authenticated
  using (true);

-- Column-scoped: rating/quests_completed/verified/cancel_rate/bank/
-- joined are never client-writable (bank isn't even in UpdateProfileInput
-- — src/data/ports/users.ts — and the rest are trust/history fields the
-- adapter itself derives or seed-authors, never the user). No guard logic
-- beyond "your own row", so a plain RLS policy is enough — no RPC needed,
-- matching updateProfile's own real implementation (a bare merge, no
-- validation) in src/data/adapters/memory/users.ts.
grant update (name, bio, area, home_x, home_y, phone, email) on profiles to authenticated;

create policy profiles_update_own on profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- No INSERT policy: a new profiles row is created by handle_new_user()
-- (Phase 8), a trigger on auth.users, not by the client directly.

-- ---------------------------------------------------------------------
-- categories / areas — small, effectively static, seeded once by Phase
-- 9's seed script (run with the service role, which bypasses RLS
-- entirely) — no client write path exists in any *Port, so no
-- INSERT/UPDATE/DELETE policy is granted here at all.
-- ---------------------------------------------------------------------
alter table categories enable row level security;
revoke all on categories from anon, authenticated;
grant select on categories to authenticated;
create policy categories_select on categories for select to authenticated using (true);

alter table areas enable row level security;
revoke all on areas from anon, authenticated;
grant select on areas to authenticated;
create policy areas_select on areas for select to authenticated using (true);

-- ---------------------------------------------------------------------
-- quests — every non-address column is readable by any authenticated
-- user regardless of role or status, matching getQuest's real behavior
-- in the memory adapter today (an unconditional lookup by id — no
-- viewer-scoping exists there either). address_line is the one field
-- that genuinely needs hiding, and RLS alone can't do that (it filters
-- rows, not columns) — so it's handled by revoking column-level SELECT
-- on address_line entirely and exposing it only through
-- quest_address_line(), a SECURITY DEFINER function that ports
-- addressVisibleTo() (src/data/domain/lifecycle.ts) server-side. Every
-- read goes through the quests_with_address view below, which calls that
-- function — the adapter never queries the base table directly for a
-- quest's address.
-- ---------------------------------------------------------------------
alter table quests enable row level security;
revoke all on quests from anon, authenticated;

grant select (
  id, poster_id, title, payout_minor, payout_unit, category_id,
  point_x, point_y, location, estimated_minutes, duration_label,
  scheduled_for, expires_at, created_at, status, accepted_offer_id,
  area, details, requirements, started_at, completed_at, paid_at,
  cancelled_at, cancelled_by, cancel_reason, disputed_at, dispute_reason
) on quests to authenticated;
-- address_line deliberately excluded from this grant.

create policy quests_select on quests
  for select to authenticated
  using (true);

-- No INSERT/UPDATE policy: postQuest and every lifecycle transition
-- (startQuest/markDone/confirmDone/cancelQuest/disputeQuest) are RPCs
-- (post_quest, start_quest, mark_done, confirm_done, cancel_quest,
-- dispute_quest — Phase 3/4), each porting src/data/domain/lifecycle.ts's
-- TRANSITIONS table and guard() helper exactly.

create or replace function quest_address_line(p_quest_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_poster_id uuid;
  v_status quest_status;
  v_accepted_doer_id uuid;
begin
  select poster_id, status into v_poster_id, v_status from quests where id = p_quest_id;
  if v_poster_id is null then
    return null; -- no such quest
  end if;
  if v_poster_id = auth.uid() then
    return (select address_line from quests where id = p_quest_id);
  end if;

  select o.doer_id into v_accepted_doer_id
  from quests q join offers o on o.id = q.accepted_offer_id
  where q.id = p_quest_id;

  if v_accepted_doer_id = auth.uid() and v_status <> 'open' then
    return (select address_line from quests where id = p_quest_id);
  end if;

  return ''; -- matches Quest.addressLine's non-nullable `string` shape
end;
$$;

revoke all on function quest_address_line(uuid) from public;
grant execute on function quest_address_line(uuid) to authenticated;

-- security_invoker so the view's own row visibility follows the calling
-- user's RLS (quests_select above), while quest_address_line() still runs
-- with its own definer privilege regardless — the two are independent.
-- Explicit column list (never `q.*`) so address_line can never leak in
-- through this view by omission.
create view quests_with_address
  with (security_invoker = true)
  as
  select
    q.id, q.poster_id, q.title, q.payout_minor, q.payout_unit, q.category_id,
    q.point_x, q.point_y, q.estimated_minutes, q.duration_label,
    q.scheduled_for, q.expires_at, q.created_at, q.status, q.accepted_offer_id,
    q.area, q.details, q.requirements, q.started_at, q.completed_at, q.paid_at,
    q.cancelled_at, q.cancelled_by, q.cancel_reason, q.disputed_at, q.dispute_reason,
    quest_address_line(q.id) as address_line
  from quests q;

grant select on quests_with_address to authenticated;

-- ---------------------------------------------------------------------
-- offers — poster of the quest sees every offer on it; a doer sees only
-- their own. No client INSERT/UPDATE: send_offer/withdraw_offer/
-- decline_offer/accept_offer are all RPCs (Phase 4), each porting
-- offers.ts's exact guards (own-quest rejection, one-active-offer-per-
-- doer, funds check on accept, auto-decline-the-rest).
-- ---------------------------------------------------------------------
alter table offers enable row level security;
revoke all on offers from anon, authenticated;
grant select on offers to authenticated;

create policy offers_select on offers
  for select to authenticated
  using (
    doer_id = auth.uid()
    or exists (select 1 from quests q where q.id = offers.quest_id and q.poster_id = auth.uid())
  );

-- ---------------------------------------------------------------------
-- threads / messages — thread membership only (poster or doer), exactly
-- ThreadsPort's own scoping. No client INSERT: send_offer's
-- find-or-create (Phase 4) and send_message (Phase 6) are both RPCs.
-- ---------------------------------------------------------------------
alter table threads enable row level security;
revoke all on threads from anon, authenticated;
grant select on threads to authenticated;

create policy threads_select on threads
  for select to authenticated
  using (poster_id = auth.uid() or doer_id = auth.uid());

alter table messages enable row level security;
revoke all on messages from anon, authenticated;
grant select on messages to authenticated;

create policy messages_select on messages
  for select to authenticated
  using (
    exists (
      select 1 from threads t
      where t.id = messages.thread_id and (t.poster_id = auth.uid() or t.doer_id = auth.uid())
    )
  );

-- thread_read_at has no guard logic beyond "your own row, on a thread
-- you're actually a member of" — a plain RLS-protected upsert, same
-- reasoning profiles_update_own gives for skipping an RPC.
alter table thread_read_at enable row level security;
revoke all on thread_read_at from anon, authenticated;
grant select, insert, update on thread_read_at to authenticated;

create policy thread_read_at_own on thread_read_at
  for all to authenticated
  using (
    user_id = auth.uid()
    and exists (select 1 from threads t where t.id = thread_read_at.thread_id and (t.poster_id = auth.uid() or t.doer_id = auth.uid()))
  )
  with check (
    user_id = auth.uid()
    and exists (select 1 from threads t where t.id = thread_read_at.thread_id and (t.poster_id = auth.uid() or t.doer_id = auth.uid()))
  );

-- ---------------------------------------------------------------------
-- saved_quests — identity-only guard (no cross-row invariant), same
-- reasoning as thread_read_at: a plain RLS policy, no RPC.
-- ---------------------------------------------------------------------
alter table saved_quests enable row level security;
revoke all on saved_quests from anon, authenticated;
grant select, insert, delete on saved_quests to authenticated;

create policy saved_quests_own on saved_quests
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- ledger_entries / payments — ADR-005's append-only ledger. Read-only to
-- the owning user; every write goes through a SECURITY DEFINER RPC
-- (escrow hold/release/refund as side effects of the Phase 4 lifecycle
-- RPCs; deposit/cash_out and their settlement in Phase 5) — no client
-- INSERT/UPDATE/DELETE policy exists on either table, on purpose.
-- ---------------------------------------------------------------------
alter table ledger_entries enable row level security;
revoke all on ledger_entries from anon, authenticated;
grant select on ledger_entries to authenticated;

create policy ledger_entries_own on ledger_entries
  for select to authenticated
  using (user_id = auth.uid());

alter table payments enable row level security;
revoke all on payments from anon, authenticated;
grant select on payments to authenticated;

create policy payments_own on payments
  for select to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- reviews — PRD §7.8's mutual-blind reveal rule, ported directly as the
-- SELECT policy's predicate (src/data/domain/reviews.ts's reviewVisible):
-- visible once the ratee has rated the rater back on the same quest, or
-- 14 days have passed — whichever first. Deliberately not scoped by
-- auth.uid() at all beyond requiring authentication: M6's own fix
-- (src/data/adapters/memory/reviews.ts's header comment) made the blind
-- real for the ratee too, not just third parties, so there's no
-- "you can always see reviews about yourself" carve-out to encode here.
-- No client INSERT: submit_review is an RPC (Phase 7) porting
-- reviews.ts's canRate/counterpart guards exactly.
-- ---------------------------------------------------------------------
alter table reviews enable row level security;
revoke all on reviews from anon, authenticated;
grant select on reviews to authenticated;

create policy reviews_visible on reviews
  for select to authenticated
  using (
    exists (
      select 1 from reviews back
      where back.quest_id = reviews.quest_id
        and back.rater_id = reviews.ratee_id
        and back.ratee_id = reviews.rater_id
    )
    or now() - reviews.at >= interval '14 days'
  );

-- ---------------------------------------------------------------------
-- reports — no admin queue reads these back anywhere in the product
-- (contracts/report.ts's own header comment), so — matching that
-- "frozen, unreachable-by-UI record" shape exactly — no SELECT policy is
-- granted at all, to anyone, including the reporter. report_user is an
-- RPC (Phase 7); nothing ever reads this table back through the API.
-- ---------------------------------------------------------------------
alter table reports enable row level security;
revoke all on reports from anon, authenticated;
-- (no policies — the table is write-only, from the RPC, forever.)

-- ---------------------------------------------------------------------
-- blocked_users — identity-only guard plus one real constraint (can't
-- block yourself, matching trust.ts's own guard) — a plain RLS policy,
-- no RPC. No DELETE policy/method: TrustPort has no unblockUser
-- (ports/trust.ts's own header comment — no caller exists for one yet).
-- ---------------------------------------------------------------------
alter table blocked_users add constraint blocked_users_no_self_block check (user_id <> blocked_id);

alter table blocked_users enable row level security;
revoke all on blocked_users from anon, authenticated;
grant select, insert on blocked_users to authenticated;

create policy blocked_users_own on blocked_users
  for select to authenticated
  using (user_id = auth.uid());

create policy blocked_users_insert_own on blocked_users
  for insert to authenticated
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- notifications — read-only to the owning user; every write (create on
-- a lifecycle event, mark-all-read) is server-side — the former a side
-- effect of the RPCs above, the latter its own RPC (Phase 6's
-- mark_all_read, porting notifications.ts's idempotent bulk update).
-- ---------------------------------------------------------------------
alter table notifications enable row level security;
revoke all on notifications from anon, authenticated;
grant select on notifications to authenticated;

create policy notifications_own on notifications
  for select to authenticated
  using (user_id = auth.uid());
