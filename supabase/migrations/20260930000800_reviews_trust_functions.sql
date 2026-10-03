-- M7 scaffold, Phase 7: submit_review()/report_user() RPCs, plus a real
-- fix to Phase 1's reviews_visible policy discovered while wiring up
-- ReviewsPort.myReviewOnQuest for real.
--
-- Phase 1's reviews_visible predicate applies uniformly to every viewer
-- with no auth.uid() check at all — correct for listReviewsForUser (the
-- mutual blind really is unconditional there, M6's own fix made it real
-- for the ratee too, not just third parties) but wrong for
-- myReviewOnQuest: that method's whole job is letting the *rater* check
-- "have I already reviewed this quest" — src/data/adapters/memory/
-- reviews.ts's real myReviewOnQuest never filters through reviewVisible
-- at all, it looks the review up unconditionally by (questId, raterId).
-- A rater obviously already knows what they wrote; the blind is about
-- outsiders (including the ratee) reading it early, never about the
-- author reading their own words back. Migrations are append-only
-- history here, so this is a correcting policy replacement, not an edit
-- to the original file.
drop policy reviews_visible on reviews;

create policy reviews_visible on reviews
  for select to authenticated
  using (
    rater_id = auth.uid()
    or exists (
      select 1 from reviews back
      where back.quest_id = reviews.quest_id
        and back.rater_id = reviews.ratee_id
        and back.ratee_id = reviews.rater_id
    )
    or now() - reviews.at >= interval '14 days'
  );

-- Ports reviews.ts's submitReview guards in the same priority order the
-- memory adapter checks them (status, then role, then already-rated,
-- then counterpart, then rating range) — canRate() there bundles the
-- first three into one boolean, but the real error message depends on
-- which one actually failed, so this preserves that same order rather
-- than collapsing it.
create or replace function submit_review(p_quest_id uuid, p_ratee_id uuid, p_rating int, p_comment text, p_idempotency_key text)
returns reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quest quests;
  v_accepted_doer_id uuid;
  v_role text;
  v_counterpart_id uuid;
  v_existing reviews;
  v_review reviews;
begin
  select * into v_quest from quests where id = p_quest_id;
  if v_quest.id is null then
    raise exception 'submitReview: no such quest';
  end if;
  select doer_id into v_accepted_doer_id from offers where id = v_quest.accepted_offer_id;

  if v_quest.poster_id = auth.uid() then
    v_role := 'poster';
    v_counterpart_id := v_accepted_doer_id;
  elsif v_accepted_doer_id = auth.uid() then
    v_role := 'doer';
    v_counterpart_id := v_quest.poster_id;
  else
    v_role := 'other';
  end if;

  select * into v_existing from reviews where quest_id = p_quest_id and rater_id = auth.uid();

  if not idempotency_claim('submit_review', p_idempotency_key) then
    if v_existing.id is not null then
      return v_existing;
    end if;
  end if;

  if v_quest.status <> 'paid' then
    raise exception 'Ratings open once the quest is paid';
  end if;
  if v_role not in ('poster', 'doer') then
    raise exception 'Only the two people on a quest can rate it';
  end if;
  if v_existing.id is not null then
    raise exception 'You''ve already rated this one';
  end if;
  if v_counterpart_id is null or v_counterpart_id <> p_ratee_id then
    raise exception 'submitReview: rateeId doesn''t match the other side of this quest';
  end if;
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'Pick a star rating from 1 to 5';
  end if;

  insert into reviews (quest_id, rater_id, ratee_id, rating, comment)
  values (p_quest_id, auth.uid(), p_ratee_id, p_rating, trim(coalesce(p_comment, '')))
  returning * into v_review;

  return v_review;
end;
$$;

revoke all on function submit_review(uuid, uuid, int, text, text) from public;
grant execute on function submit_review(uuid, uuid, int, text, text) to authenticated;

-- report_user needs the dedicated idempotency-key cache (no natural
-- lookup — a person can legitimately report the same target twice for
-- different reasons, matching reports' own no-uniqueness shape).
-- blockUser/listBlockedUserIds need no RPC at all: Phase 1's
-- blocked_users_insert_own policy plus the no-self-block check
-- constraint already cover them directly, no guard logic an RPC would
-- add.
create or replace function report_user(p_target_user_id uuid, p_reason text, p_idempotency_key text)
returns reports
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report reports;
  v_cached jsonb;
  v_reason text := trim(coalesce(p_reason, ''));
begin
  if not idempotency_claim('report_user', p_idempotency_key) then
    v_cached := idempotency_result('report_user', p_idempotency_key);
    if v_cached is not null then
      return jsonb_populate_record(null::reports, v_cached);
    end if;
  end if;

  if p_target_user_id = auth.uid() then
    raise exception 'You can''t report yourself';
  end if;
  if v_reason = '' then
    raise exception 'Say what happened, so we can look into it';
  end if;

  insert into reports (reporter_id, target_user_id, reason) values (auth.uid(), p_target_user_id, v_reason)
  returning * into v_report;

  perform idempotency_store_result('report_user', p_idempotency_key, to_jsonb(v_report));
  return v_report;
end;
$$;

revoke all on function report_user(uuid, text, text) from public;
grant execute on function report_user(uuid, text, text) to authenticated;
