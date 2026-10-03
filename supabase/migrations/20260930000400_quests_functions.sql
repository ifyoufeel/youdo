-- M7 scaffold, Phase 3: listQuests' PostGIS radius search, getQuest (via
-- Phase 1's quests_with_address view — no new SQL needed for it), real
-- postQuest, and listMyQuests. Lifecycle mutations (startQuest through
-- disputeQuest) are Phase 4, alongside offers.
alter table quests add column idempotency_key text unique;

-- ---------------------------------------------------------------------
-- list_quests — the open marketplace feed. Ports quests.ts's real
-- listQuests filter set exactly (status='open' always, then every
-- ListQuestsParams field), replacing the in-memory distanceBetween()
-- radius check with a real ST_DWithin against the location column
-- (Phase 0's generated geography, itself derived from the flat grid via
-- taipei_grid_to_geog). count(*) over() gives the pre-limit total in the
-- same query, so the adapter can compute nextCursor without a second
-- round trip — offset-based, same convention
-- src/data/adapters/memory/pagination.ts's own header comment documents
-- as "an implementation detail of this adapter, never parsed by a
-- caller."
--
-- todayOnly compares against the real server clock (now()), not a
-- seed-anchored one — the memory adapter's own ADR-013 already flagged
-- this exact gap: "M7's Supabase swap must source time from the server
-- or device instead, not carry this forward." There is no
-- device-local-time concept available inside a stateless SQL function
-- either, so this compares UTC calendar dates — a documented scaffold
-- simplification, not a parity claim with the memory adapter's
-- device-local isToday().
create or replace function list_quests(
  p_center_x double precision,
  p_center_y double precision,
  p_radius_m double precision,
  p_category_id text default null,
  p_min_pay_minor bigint default null,
  p_verified_posters_only boolean default false,
  p_today_only boolean default false,
  p_search text default null,
  p_sort text default 'closest',
  p_viewer_id uuid default null,
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid, poster_id uuid, title text, payout_minor bigint, payout_unit text,
  category_id text, point_x double precision, point_y double precision,
  estimated_minutes int, duration_label text, scheduled_for timestamptz,
  expires_at timestamptz, created_at timestamptz, status quest_status,
  accepted_offer_id uuid, address_line text, area text, details text,
  requirements text[], started_at timestamptz, completed_at timestamptz,
  paid_at timestamptz, cancelled_at timestamptz, cancelled_by uuid,
  cancel_reason text, disputed_at timestamptz, dispute_reason text,
  total_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_center geography := taipei_grid_to_geog(p_center_x, p_center_y);
begin
  return query
  select
    q.id, q.poster_id, q.title, q.payout_minor, q.payout_unit, q.category_id,
    q.point_x, q.point_y, q.estimated_minutes, q.duration_label, q.scheduled_for,
    q.expires_at, q.created_at, q.status, q.accepted_offer_id,
    quest_address_line(q.id), q.area, q.details, q.requirements,
    q.started_at, q.completed_at, q.paid_at, q.cancelled_at, q.cancelled_by,
    q.cancel_reason, q.disputed_at, q.dispute_reason,
    count(*) over()
  from quests q
  where q.status = 'open'
    and ST_DWithin(q.location, v_center, p_radius_m)
    and (p_category_id is null or q.category_id = p_category_id)
    and (p_min_pay_minor is null or q.payout_minor >= p_min_pay_minor)
    and (
      not p_verified_posters_only
      or exists (select 1 from profiles pr where pr.id = q.poster_id and pr.verified)
    )
    and (not p_today_only or (q.scheduled_for at time zone 'utc')::date = (now() at time zone 'utc')::date)
    and (
      p_search is null or p_search = ''
      or q.title ilike '%' || p_search || '%'
      or q.details ilike '%' || p_search || '%'
    )
    and (
      p_viewer_id is null
      or not exists (select 1 from blocked_users b where b.user_id = p_viewer_id and b.blocked_id = q.poster_id)
    )
  order by
    case when p_sort = 'pay' then q.payout_minor end desc,
    case when p_sort = 'ending' then q.expires_at end asc,
    case when p_sort = 'newest' then q.created_at end desc,
    case when p_sort = 'closest' or p_sort is null then ST_Distance(q.location, v_center) end asc
  limit p_limit offset p_offset;
end;
$$;

revoke all on function list_quests(double precision, double precision, double precision, text, bigint, boolean, boolean, text, text, uuid, int, int) from public;
grant execute on function list_quests(double precision, double precision, double precision, text, bigint, boolean, boolean, text, text, uuid, int, int) to authenticated;

-- ---------------------------------------------------------------------
-- post_quest — trusts the caller's input is already valid, same division
-- of labor as the memory adapter's postQuest (validation lives in the
-- wizard, not here). poster_id is always auth.uid(), never the client's
-- own claim, unlike PostQuestInput.posterId which this RPC ignores.
-- Returns the raw row (address_line included, unhidden) — safe because
-- the poster always sees their own quest's real address regardless of
-- status (addressVisibleTo's own first rule).
-- ---------------------------------------------------------------------
create or replace function post_quest(
  p_title text,
  p_details text,
  p_category_id text,
  p_payout_minor bigint,
  p_estimated_minutes int,
  p_duration_label text,
  p_address_line text,
  p_area text,
  p_point_x double precision,
  p_point_y double precision,
  p_scheduled_for timestamptz,
  p_expires_at timestamptz,
  p_requirements text[],
  p_idempotency_key text
)
returns quests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quest quests;
begin
  insert into quests (
    poster_id, title, details, category_id, payout_minor, estimated_minutes,
    duration_label, address_line, area, point_x, point_y, scheduled_for,
    expires_at, requirements, idempotency_key
  ) values (
    auth.uid(), p_title, p_details, p_category_id, p_payout_minor, p_estimated_minutes,
    p_duration_label, p_address_line, p_area, p_point_x, p_point_y, p_scheduled_for,
    p_expires_at, coalesce(p_requirements, '{}'), p_idempotency_key
  )
  on conflict (idempotency_key) do nothing
  returning * into v_quest;

  if v_quest.id is null then
    select * into v_quest from quests where idempotency_key = p_idempotency_key;
  end if;

  return v_quest;
end;
$$;

revoke all on function post_quest(text, text, text, bigint, int, text, text, text, double precision, double precision, timestamptz, timestamptz, text[], text) from public;
grant execute on function post_quest(text, text, text, bigint, int, text, text, text, double precision, double precision, timestamptz, timestamptz, text[], text) to authenticated;

-- ---------------------------------------------------------------------
-- list_my_quests — "every quest I'm engaged with, whichever side, any
-- status" (QuestsPort's own header comment). Always auth.uid(), the
-- port's userId parameter is never trusted as an identity claim — same
-- posture as delete_account/quest_address_line. Per-row address hiding
-- via quest_address_line() matters here too: an applicant who was never
-- accepted must not see the address just because the quest shows up in
-- their own "my quests" list.
-- ---------------------------------------------------------------------
create or replace function list_my_quests()
returns table (
  id uuid, poster_id uuid, title text, payout_minor bigint, payout_unit text,
  category_id text, point_x double precision, point_y double precision,
  estimated_minutes int, duration_label text, scheduled_for timestamptz,
  expires_at timestamptz, created_at timestamptz, status quest_status,
  accepted_offer_id uuid, address_line text, area text, details text,
  requirements text[], started_at timestamptz, completed_at timestamptz,
  paid_at timestamptz, cancelled_at timestamptz, cancelled_by uuid,
  cancel_reason text, disputed_at timestamptz, dispute_reason text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    q.id, q.poster_id, q.title, q.payout_minor, q.payout_unit, q.category_id,
    q.point_x, q.point_y, q.estimated_minutes, q.duration_label, q.scheduled_for,
    q.expires_at, q.created_at, q.status, q.accepted_offer_id,
    quest_address_line(q.id), q.area, q.details, q.requirements,
    q.started_at, q.completed_at, q.paid_at, q.cancelled_at, q.cancelled_by,
    q.cancel_reason, q.disputed_at, q.dispute_reason
  from quests q
  where q.poster_id = auth.uid()
     or exists (select 1 from offers o where o.quest_id = q.id and o.doer_id = auth.uid())
  order by q.created_at desc;
end;
$$;

revoke all on function list_my_quests() from public;
grant execute on function list_my_quests() to authenticated;
