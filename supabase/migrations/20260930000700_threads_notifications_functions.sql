-- M7 scaffold, Phase 6: send_message/mark_all_read RPCs, and enabling
-- realtime replication for the tables subscribeToQuest/subscribeToThread/
-- subscribeToUser watch. listThreadsForUser/getThread/listMessages/
-- unreadCountForThread/markThreadRead and notifications' listForUser need
-- no new SQL — Phase 1's RLS already scopes every read, and
-- markThreadRead/saved-style writes go straight to thread_read_at (also
-- Phase 1), no RPC needed.
alter table messages add column idempotency_key text unique;

-- Ports threads.ts's sendMessage guards exactly: the thread's quest must
-- not be closed, the body must be non-empty. No natural post-hoc lookup
-- a replay could fall back on (a sender could legitimately send two
-- identical-looking messages), so — like post_quest — this uses the
-- idempotency_key column's own unique constraint plus an ON CONFLICT
-- fallback select, not idempotency_claim().
create or replace function send_message(p_thread_id uuid, p_body text, p_idempotency_key text)
returns messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_thread threads;
  v_quest_status quest_status;
  v_message messages;
begin
  select * into v_thread from threads where id = p_thread_id;
  if v_thread.id is null then
    raise exception 'sendMessage: no such thread';
  end if;
  if v_thread.poster_id <> auth.uid() and v_thread.doer_id <> auth.uid() then
    raise exception 'Not your thread';
  end if;

  select status into v_quest_status from quests where id = v_thread.quest_id;
  if v_quest_status in ('paid', 'cancelled', 'expired') then
    raise exception 'This quest is closed, so the thread is read-only';
  end if;
  if trim(coalesce(p_body, '')) = '' then
    raise exception 'Say something first';
  end if;

  insert into messages (thread_id, sender_id, body, idempotency_key)
  values (p_thread_id, auth.uid(), p_body, p_idempotency_key)
  on conflict (idempotency_key) do nothing
  returning * into v_message;

  if v_message.id is null then
    select * into v_message from messages where idempotency_key = p_idempotency_key;
    return v_message;
  end if;

  update threads set last_message_at = v_message.at where id = p_thread_id;

  perform notify_user(
    case when v_thread.poster_id = auth.uid() then v_thread.doer_id else v_thread.poster_id end,
    'message', v_thread.quest_id, p_body
  );

  return v_message;
end;
$$;

revoke all on function send_message(uuid, text, text) from public;
grant execute on function send_message(uuid, text, text) to authenticated;

-- Bulk update needs elevated privilege (Phase 1 grants notifications
-- SELECT only) — naturally idempotent (a second call just finds nothing
-- left to mark), same as the memory adapter's own markAllRead, but
-- idempotency_claim() still guards it for parity with every other
-- mutating RPC here.
create or replace function mark_all_read(p_idempotency_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not idempotency_claim('mark_all_read', p_idempotency_key) then
    return;
  end if;
  update notifications set read_at = now() where user_id = auth.uid() and read_at is null;
end;
$$;

revoke all on function mark_all_read(text) from public;
grant execute on function mark_all_read(text) to authenticated;

-- ---------------------------------------------------------------------
-- Realtime — adds the three tables subscribeToQuest/subscribeToThread/
-- subscribeToUser watch to the default `supabase_realtime` publication.
-- A real caveat, not glossed over: postgres_changes' WAL-based decoding
-- happens below the SQL privilege layer, so Phase 1's address_line
-- column-grant restriction has no guarantee of applying to a raw
-- realtime payload the way it does to a PostgREST select or an RPC
-- return value. src/data/adapters/supabase/quests.ts's subscribeToQuest
-- deliberately never trusts the realtime payload for that reason — it
-- refetches via the already-address-safe getQuest() on every change
-- instead of reading the pushed row directly. subscribeToThread/
-- subscribeToUser have no hidden columns, so they map the pushed row
-- directly.
alter publication supabase_realtime add table quests, messages, notifications;
