/* M7 scaffold, Phase 9: seeds a real Supabase project with the exact
   same fixture the memory adapter parses (src/data/adapters/memory/
   seed.ts) — "so previews stay identical" (docs/ROADMAP.md's own M7
   checklist wording) once EXPO_PUBLIC_DATA_ADAPTER flips to "supabase".

   Never run — there is no live project (M7's explicit "scaffold only"
   scope). This script is exactly as unverified as every SQL migration
   and adapter file in this milestone: carefully matched to the schema,
   never executed against it.

   Uses the service role key, which bypasses RLS entirely — the only
   way to freely insert into every table (ledger_entries, notifications,
   ...) that no client role is ever granted INSERT on. Never ship this
   key to a client; it only belongs in a one-off provisioning script run
   from a trusted machine.

   Run with: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-supabase.ts */
import { createClient } from "@supabase/supabase-js";
import { seed } from "../src/data/adapters/memory/seed";
import type { Quest } from "../src/data/contracts";

// Quest fixtures with different optional fields present (startedAt,
// cancelledBy, ...) get distinct literal types under `as const` — a
// quest missing a field has no property at all, not `field: undefined`
// — so TS can't see `.startedAt` as valid across the whole union. Cast
// once to the real Quest shape, which already declares every one of
// these fields optional.
const quests = seed.quests as unknown as Quest[];

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (Project Settings -> API -> service_role) first.");
}

const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

function must<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`seed-supabase: missing ${what}`);
  return value;
}

async function main() {
  console.log(`Seeding against ${url} …`);

  // ---- categories / areas — natural keys, no id mapping needed. ----
  const { error: categoriesError } = await supabase.from("categories").upsert(seed.categories);
  if (categoriesError) throw categoriesError;

  const areaRows = Object.entries(seed.areas).map(([name, point]) => ({ name, point_x: point.x, point_y: point.y }));
  const { error: areasError } = await supabase.from("areas").upsert(areaRows);
  if (areasError) throw areasError;

  // ---- users — one real auth.users row per seed user (no password:
  // ADR-007's product has none; these accounts sign in only via OTP/
  // Google once a real one exists). handle_new_user's trigger
  // (supabase/migrations/..._auth.sql) inserts a minimal profiles row
  // the moment each one is created; this then overwrites it with the
  // fixture's full trust/history fields the trigger can't know. ----
  const userIdMap = new Map<string, string>();
  for (const [seedId, user] of Object.entries(seed.users)) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      email_confirm: true,
      user_metadata: { full_name: user.name },
    });
    if (error) throw error;
    const realId = must(data.user?.id, `auth user id for ${seedId}`);
    userIdMap.set(seedId, realId);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        name: user.name,
        rating: user.rating,
        quests_completed: user.questsCompleted,
        verified: user.verified,
        area: user.area,
        home_x: user.home.x,
        home_y: user.home.y,
        cancel_rate: user.cancelRate,
        bio: user.bio,
        phone: user.phone,
        bank: user.bank,
        joined: user.joined,
      })
      .eq("id", realId);
    if (profileError) throw profileError;
  }

  // ---- quests — accepted_offer_id is backfilled after offers exist
  // below (it references a row that doesn't exist yet). ----
  const questIdMap = new Map<string, string>();
  for (const quest of quests) {
    const { data, error } = await supabase
      .from("quests")
      .insert({
        poster_id: must(userIdMap.get(quest.posterId), `poster ${quest.posterId} for ${quest.id}`),
        title: quest.title,
        payout_minor: quest.payoutMinor,
        category_id: quest.categoryId,
        point_x: quest.point.x,
        point_y: quest.point.y,
        estimated_minutes: quest.estimatedMinutes,
        duration_label: quest.durationLabel,
        scheduled_for: quest.scheduledFor,
        expires_at: quest.expiresAt,
        created_at: quest.createdAt,
        status: quest.status,
        address_line: quest.addressLine,
        area: quest.area,
        details: quest.details,
        requirements: quest.requirements,
        started_at: quest.startedAt ?? null,
        completed_at: quest.completedAt ?? null,
        paid_at: quest.paidAt ?? null,
        cancelled_at: quest.cancelledAt ?? null,
        cancelled_by: quest.cancelledBy ? userIdMap.get(quest.cancelledBy) : null,
        cancel_reason: quest.cancelReason ?? null,
        disputed_at: quest.disputedAt ?? null,
        dispute_reason: quest.disputeReason ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    questIdMap.set(quest.id, must(data?.id, `inserted id for quest ${quest.id}`));
  }

  // ---- offers ----
  const offerIdMap = new Map<string, string>();
  for (const offer of seed.offers) {
    const { data, error } = await supabase
      .from("offers")
      .insert({
        quest_id: must(questIdMap.get(offer.questId), `quest ${offer.questId} for offer ${offer.id}`),
        doer_id: must(userIdMap.get(offer.doerId), `doer ${offer.doerId} for offer ${offer.id}`),
        amount_minor: offer.amountMinor,
        status: offer.status,
        note: offer.note,
        created_at: offer.createdAt,
        responded_at: offer.respondedAt,
      })
      .select("id")
      .single();
    if (error) throw error;
    offerIdMap.set(offer.id, must(data?.id, `inserted id for offer ${offer.id}`));
  }

  // Backfill quests.accepted_offer_id now that offers exist.
  for (const quest of quests) {
    if (!quest.acceptedOfferId) continue;
    const { error } = await supabase
      .from("quests")
      .update({ accepted_offer_id: must(offerIdMap.get(quest.acceptedOfferId), `offer ${quest.acceptedOfferId}`) })
      .eq("id", must(questIdMap.get(quest.id), quest.id));
    if (error) throw error;
  }

  // ---- threads + messages ----
  const threadIdMap = new Map<string, string>();
  for (const thread of seed.threads) {
    const { data, error } = await supabase
      .from("threads")
      .insert({
        quest_id: must(questIdMap.get(thread.questId), `quest ${thread.questId} for thread ${thread.id}`),
        poster_id: must(userIdMap.get(thread.posterId), `poster ${thread.posterId} for thread ${thread.id}`),
        doer_id: must(userIdMap.get(thread.doerId), `doer ${thread.doerId} for thread ${thread.id}`),
        last_message_at: thread.lastMessageAt,
      })
      .select("id")
      .single();
    if (error) throw error;
    threadIdMap.set(thread.id, must(data?.id, `inserted id for thread ${thread.id}`));
  }

  for (const [threadSeedId, messages] of Object.entries(seed.messagesByThread)) {
    const threadId = must(threadIdMap.get(threadSeedId), `thread ${threadSeedId}`);
    const rows = messages.map((m) => ({
      thread_id: threadId,
      sender_id: must(userIdMap.get(m.senderId), `sender ${m.senderId} in ${threadSeedId}`),
      body: m.body,
      at: m.at,
    }));
    const { error } = await supabase.from("messages").insert(rows);
    if (error) throw error;
  }

  // ---- thread_read_at — flat "userId:threadId" keys, same shape the
  // memory adapter's own store.ts parses this fixture into. ----
  const threadReadAtRows = Object.entries(seed.threadReadAt).map(([key, readAt]) => {
    const [userSeedId, threadSeedId] = key.split(":");
    return {
      user_id: must(userIdMap.get(userSeedId), `user ${userSeedId} in threadReadAt`),
      thread_id: must(threadIdMap.get(threadSeedId), `thread ${threadSeedId} in threadReadAt`),
      read_at: readAt,
    };
  });
  if (threadReadAtRows.length > 0) {
    const { error } = await supabase.from("thread_read_at").insert(threadReadAtRows);
    if (error) throw error;
  }

  // ---- saved_quests ----
  const savedRows = Object.entries(seed.savedByUser).flatMap(([userSeedId, questSeedIds]) =>
    questSeedIds.map((questSeedId) => ({
      user_id: must(userIdMap.get(userSeedId), `user ${userSeedId} in savedByUser`),
      quest_id: must(questIdMap.get(questSeedId), `quest ${questSeedId} in savedByUser`),
    }))
  );
  if (savedRows.length > 0) {
    const { error } = await supabase.from("saved_quests").insert(savedRows);
    if (error) throw error;
  }

  // ---- ledger_entries — inserted directly (never through post_txn's
  // zero-sum check, which asserts per-call, not across a whole seeded
  // history) — the fixture's own zero-sum invariant is covered by
  // src/data/contracts/__tests__/fixture.test.ts already. ----
  const ledgerRows = seed.ledger.map((entry) => ({
    txn_id: entry.txnId,
    account: entry.account,
    user_id: entry.userId ? must(userIdMap.get(entry.userId), `user ${entry.userId} in ledger ${entry.id}`) : null,
    quest_id: entry.questId ? must(questIdMap.get(entry.questId), `quest ${entry.questId} in ledger ${entry.id}`) : null,
    amount_minor: entry.amountMinor,
    at: entry.at,
    memo: entry.memo,
  }));
  const { error: ledgerError } = await supabase.from("ledger_entries").insert(ledgerRows);
  if (ledgerError) throw ledgerError;

  // ---- reviews ----
  const reviewRows = seed.reviews.map((review) => ({
    quest_id: must(questIdMap.get(review.questId), `quest ${review.questId} for review ${review.id}`),
    rater_id: must(userIdMap.get(review.raterId), `rater ${review.raterId} for review ${review.id}`),
    ratee_id: must(userIdMap.get(review.rateeId), `ratee ${review.rateeId} for review ${review.id}`),
    rating: review.rating,
    comment: review.comment,
    at: review.at,
  }));
  if (reviewRows.length > 0) {
    const { error } = await supabase.from("reviews").insert(reviewRows);
    if (error) throw error;
  }

  // ---- notifications ----
  const notificationRows = seed.notifications.map((n) => ({
    user_id: must(userIdMap.get(n.userId), `user ${n.userId} for notification ${n.id}`),
    type: n.type,
    quest_id: n.questId ? must(questIdMap.get(n.questId), `quest ${n.questId} for notification ${n.id}`) : null,
    body: n.body,
    at: n.at,
    read_at: n.readAt,
  }));
  if (notificationRows.length > 0) {
    const { error } = await supabase.from("notifications").insert(notificationRows);
    if (error) throw error;
  }

  // reports/blocked_users/payments: the fixture seeds none of these
  // (store.ts's own header comments say so explicitly — nobody in the
  // fixture has reported, blocked, or made a real deposit/cash-out),
  // so there's nothing to insert.

  console.log(`Seeded ${quests.length} quests, ${Object.keys(seed.users).length} users — done.`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
