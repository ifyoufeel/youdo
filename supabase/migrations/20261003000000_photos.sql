-- Photo upload (profile avatars + quest photos). Code-only slice, same
-- "real scaffold, never run against a live project" posture as M7 — see
-- docs/DECISIONS.md's ADR-018.
--
-- avatar_url is public on purpose, the opposite call from
-- 20261002000000_push_tokens.sql's push_token: anyone can already see
-- any profile's name/bio/rating (profiles_select, Phase 1, `using
-- (true)`), and a profile photo is exactly as public as those fields —
-- there's nothing here one user could weaponize against another the
-- way a readable push token could be.
alter table profiles add column avatar_url text;
grant select (avatar_url) on profiles to authenticated;
grant update (avatar_url) on profiles to authenticated;

-- Account deletion (Phase 2, 20260930000300_users_functions.sql)
-- anonymizes every other PII field on the row; avatar_url joins that
-- list for the same reason a photo is identifying too. Signature
-- (input and output) is unchanged, so a plain create-or-replace is
-- enough — no drop needed, unlike the functions below whose output
-- shape is changing.
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
  set name = 'Deleted user', bio = '', phone = '', email = '', bank = '', avatar_url = null
  where id = auth.uid();
end;
$$;

-- quests.photos — PRD §9's `photos[]`. Never a requirement to post
-- (ADR-018), so it defaults to '{}' like requirements, never null.
alter table quests add column photos text[] not null default '{}';

-- quests_with_address (Phase 1) has an explicit column list; Postgres
-- allows CREATE OR REPLACE VIEW to append columns at the end without a
-- drop, as long as nothing already there is removed or reordered.
create or replace view quests_with_address
  with (security_invoker = true)
  as
  select
    q.id, q.poster_id, q.title, q.payout_minor, q.payout_unit, q.category_id,
    q.point_x, q.point_y, q.estimated_minutes, q.duration_label,
    q.scheduled_for, q.expires_at, q.created_at, q.status, q.accepted_offer_id,
    q.area, q.details, q.requirements, q.started_at, q.completed_at, q.paid_at,
    q.cancelled_at, q.cancelled_by, q.cancel_reason, q.disputed_at, q.dispute_reason,
    quest_address_line(q.id) as address_line,
    q.photos
  from quests q;

-- list_quests and list_my_quests both declare an explicit `returns
-- table (...)` — Postgres's CREATE OR REPLACE FUNCTION refuses to
-- change a function's return type, so each needs an explicit DROP
-- (exact signature, copied from its own REVOKE/GRANT lines below)
-- before being recreated with `photos` added to both the output list
-- and the SELECT. post_quest's signature is changing too (one new
-- input param), which GRANT doesn't accept as a replace either — same
-- drop-first treatment, even though its `returns quests` output is
-- untouched (quests the composite type already reflects the new
-- column automatically).
drop function list_quests(double precision, double precision, double precision, text, bigint, boolean, boolean, text, text, uuid, int, int);

create function list_quests(
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
  requirements text[], photos text[], started_at timestamptz, completed_at timestamptz,
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
    quest_address_line(q.id), q.area, q.details, q.requirements, q.photos,
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

drop function list_my_quests();

create function list_my_quests()
returns table (
  id uuid, poster_id uuid, title text, payout_minor bigint, payout_unit text,
  category_id text, point_x double precision, point_y double precision,
  estimated_minutes int, duration_label text, scheduled_for timestamptz,
  expires_at timestamptz, created_at timestamptz, status quest_status,
  accepted_offer_id uuid, address_line text, area text, details text,
  requirements text[], photos text[], started_at timestamptz, completed_at timestamptz,
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
    quest_address_line(q.id), q.area, q.details, q.requirements, q.photos,
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

drop function post_quest(text, text, text, bigint, int, text, text, text, double precision, double precision, timestamptz, timestamptz, text[], text);

create function post_quest(
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
  p_idempotency_key text,
  p_photos text[] default '{}'
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
    expires_at, requirements, photos, idempotency_key
  ) values (
    auth.uid(), p_title, p_details, p_category_id, p_payout_minor, p_estimated_minutes,
    p_duration_label, p_address_line, p_area, p_point_x, p_point_y, p_scheduled_for,
    p_expires_at, coalesce(p_requirements, '{}'), coalesce(p_photos, '{}'), p_idempotency_key
  )
  on conflict (idempotency_key) do nothing
  returning * into v_quest;

  if v_quest.id is null then
    select * into v_quest from quests where idempotency_key = p_idempotency_key;
  end if;

  return v_quest;
end;
$$;

revoke all on function post_quest(text, text, text, bigint, int, text, text, text, double precision, double precision, timestamptz, timestamptz, text[], text, text[]) from public;
grant execute on function post_quest(text, text, text, bigint, int, text, text, text, double precision, double precision, timestamptz, timestamptz, text[], text, text[]) to authenticated;

-- ---------------------------------------------------------------------
-- Storage: avatars + quest-photos buckets, both public (an avatar or a
-- quest photo is exactly as public as the row it's attached to — see
-- this migration's own header comment on avatar_url). Public here means
-- objects are servable by URL with no auth check on read; the real
-- guard is the write path, scoped to each uploader's own folder
-- (`{auth.uid()}/...`), matching every other table's "your own row
-- only" RLS posture in this scaffold.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('quest-photos', 'quest-photos', true)
on conflict (id) do nothing;

create policy avatars_write_own on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy avatars_update_own on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy avatars_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy quest_photos_write_own on storage.objects
  for insert to authenticated
  with check (bucket_id = 'quest-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy quest_photos_update_own on storage.objects
  for update to authenticated
  using (bucket_id = 'quest-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy quest_photos_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'quest-photos' and (storage.foldername(name))[1] = auth.uid()::text);
