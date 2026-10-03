-- M7 scaffold, Phase 0: extensions, enums, and every table the real
-- ports (src/data/ports/*.ts) need, matching PRD §9's data model plus
-- M6's reports/blocked_users (not in the original PRD) and areas (real
-- port surface, no PRD table). Written against no live project (per the
-- user's explicit "scaffold only" scope for M7) — carefully matched to
-- the memory adapter's own field-for-field shape (src/data/adapters/
-- memory/store.ts), but never run against a real Postgres instance.
--
-- id columns default to `uuid`/gen_random_uuid() rather than the memory
-- adapter's own "prefix-timestamp-random" text ids (next-id.ts) — a real
-- primary key doesn't need a human-readable prefix, and `profiles.id`
-- has to be a uuid anyway to reference auth.users(id). Every *Port
-- method still returns/accepts plain `string` ids, so nothing above the
-- adapter layer needs to know the difference.
create extension if not exists "pgcrypto";
create extension if not exists "postgis";

-- ---------------------------------------------------------------------
-- Enums — one enum literal per zod enum in src/data/contracts/*.ts,
-- same members, same order.
-- ---------------------------------------------------------------------
create type quest_status as enum (
  'draft', 'open', 'assigned', 'in_progress', 'completed', 'paid',
  'cancelled', 'expired', 'disputed'
);

create type offer_status as enum (
  'pending', 'accepted', 'declined', 'withdrawn', 'expired'
);

create type ledger_account as enum (
  'user_available', 'user_held', 'platform_escrow', 'platform_fee', 'external_bank'
);

create type payment_kind as enum ('deposit', 'cashout');
create type payment_state as enum ('pending', 'succeeded', 'failed');

create type notification_type as enum (
  'offer_received', 'offer_accepted', 'offer_declined', 'quest_started',
  'quest_done', 'quest_cancelled', 'quest_disputed', 'quest_expired',
  'payment', 'message'
);

-- ---------------------------------------------------------------------
-- src/data/contracts/geo.ts's flat metre grid, centred on Taipei Main
-- Station (real coords 25.0478N 121.5170E) — converted to a real
-- geography point via a plain equirectangular approximation, accurate
-- enough at the city scale this app operates at (a few kilometres either
-- side of the station). This is the one genuinely new architecture
-- decision M7 makes that M0-M6 left open (geo.ts's own header comment:
-- "a real lat/lng + PostGIS geography point is M7 work") — recorded in
-- docs/DECISIONS.md's new ADR once this milestone's docs phase lands.
-- IMMUTABLE (not just STABLE) so it can back a generated column below.
create or replace function taipei_grid_to_geog(x double precision, y double precision)
returns geography
language sql
immutable
parallel safe
as $$
  select st_setsrid(
    st_makepoint(
      121.5170 + x / (111320 * cos(radians(25.0478))),
      25.0478 + y / 111320
    ),
    4326
  )::geography
$$;

-- ---------------------------------------------------------------------
-- profiles — src/data/contracts/user.ts's User, id-linked to Supabase's
-- own auth.users (Phase 8's real auth wires the row that creates this).
-- ---------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  rating numeric(3, 2) not null default 0 check (rating >= 0 and rating <= 5),
  quests_completed integer not null default 0 check (quests_completed >= 0),
  verified boolean not null default false,
  area text not null,
  home_x double precision not null,
  home_y double precision not null,
  cancel_rate numeric(4, 3) not null default 0 check (cancel_rate >= 0 and cancel_rate <= 1),
  bio text not null default '',
  phone text not null default '',
  email text not null default '',
  bank text not null default '',
  joined timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- categories / areas — src/data/ports/categories.ts / areas.ts. Small,
-- effectively static (both ports' own header comments say so), seeded
-- once by Phase 9's seed script, never written by a real mutation.
-- ---------------------------------------------------------------------
create table categories (
  id text primary key,
  label text not null
);

create table areas (
  name text primary key,
  point_x double precision not null,
  point_y double precision not null
);

alter table profiles add constraint profiles_area_fkey foreign key (area) references areas(name);

-- ---------------------------------------------------------------------
-- quests — src/data/contracts/quest.ts's Quest.
-- ---------------------------------------------------------------------
create table quests (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid not null references profiles(id),
  title text not null,
  payout_minor bigint not null check (payout_minor > 0),
  payout_unit text not null default 'fixed' check (payout_unit = 'fixed'),
  category_id text not null references categories(id),
  point_x double precision not null,
  point_y double precision not null,
  -- Generated, not written directly — always derived from point_x/point_y,
  -- the same "never a stored fact that can drift from its source" rule
  -- ADR-005 applies to ledger balances.
  location geography(Point, 4326) generated always as (taipei_grid_to_geog(point_x, point_y)) stored,
  estimated_minutes integer not null check (estimated_minutes > 0),
  duration_label text,
  scheduled_for timestamptz not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  status quest_status not null default 'open',
  -- FK to offers(id) added below, once that table exists (offers itself
  -- references quests(id) — the cycle has to be broken with a deferred
  -- ALTER TABLE, same as any two mutually-referencing tables).
  accepted_offer_id uuid,
  address_line text not null,
  area text not null references areas(name),
  details text not null default '',
  requirements text[] not null default '{}',
  started_at timestamptz,
  completed_at timestamptz,
  paid_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by uuid references profiles(id),
  cancel_reason text,
  disputed_at timestamptz,
  dispute_reason text
);

create index quests_status_idx on quests(status);
create index quests_poster_id_idx on quests(poster_id);
create index quests_location_idx on quests using gist(location);

-- ---------------------------------------------------------------------
-- offers — src/data/contracts/offer.ts's Offer.
-- ---------------------------------------------------------------------
create table offers (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references quests(id) on delete cascade,
  doer_id uuid not null references profiles(id),
  amount_minor bigint not null check (amount_minor > 0),
  status offer_status not null default 'pending',
  note text not null default '',
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create index offers_quest_id_idx on offers(quest_id);
create index offers_doer_id_idx on offers(doer_id);

-- PRD §7.3's "one active offer per doer per quest" — a partial unique
-- index (not a plain constraint) since a doer *can* have more than one
-- offer on the same quest over time, just never more than one that's
-- still pending/accepted at once. Ports the memory adapter's own
-- myOfferOn() guard (src/data/domain/lifecycle.ts) into a real
-- constraint, so the invariant holds even against a caller that skips
-- the RPC layer entirely.
create unique index offers_one_active_per_doer_idx
  on offers(quest_id, doer_id)
  where status in ('pending', 'accepted');

alter table quests add constraint quests_accepted_offer_id_fkey
  foreign key (accepted_offer_id) references offers(id);

-- ---------------------------------------------------------------------
-- threads / messages — src/data/contracts/thread.ts's Thread/Message.
-- One thread per (quest, doer) pair (PRD §7.5) — the unique index is the
-- real backing for findOrCreateThread's in-memory find-or-create.
-- ---------------------------------------------------------------------
create table threads (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references quests(id) on delete cascade,
  poster_id uuid not null references profiles(id),
  doer_id uuid not null references profiles(id),
  last_message_at timestamptz not null default now(),
  unique (quest_id, doer_id)
);

create index threads_poster_id_idx on threads(poster_id);
create index threads_doer_id_idx on threads(doer_id);

create table messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references threads(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  body text not null,
  at timestamptz not null default now()
);

create index messages_thread_id_idx on messages(thread_id, at);

-- Per-(user, thread) last-read timestamp — ThreadsPort.unreadCountForThread
-- needs this server-side (its own header comment: a client can't compute
-- this without every other participant's raw timestamp). No natural home
-- on Thread itself since it's per-viewer, not per-thread.
create table thread_read_at (
  user_id uuid not null references profiles(id) on delete cascade,
  thread_id uuid not null references threads(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (user_id, thread_id)
);

-- ---------------------------------------------------------------------
-- saved_quests — PRD §7.2's saved list (QuestsPort.listSavedQuestIds/
-- saveQuest/unsaveQuest). A join row, not a Set<string> the way the
-- memory adapter models it in-process.
-- ---------------------------------------------------------------------
create table saved_quests (
  user_id uuid not null references profiles(id) on delete cascade,
  quest_id uuid not null references quests(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, quest_id)
);

-- ---------------------------------------------------------------------
-- ledger_entries — src/data/contracts/ledger-entry.ts's LedgerEntry.
-- Append-only (ADR-005) — no update/delete policy is ever granted in
-- Phase 1's RLS, on purpose.
-- ---------------------------------------------------------------------
create table ledger_entries (
  id uuid primary key default gen_random_uuid(),
  txn_id text not null,
  account ledger_account not null,
  user_id uuid references profiles(id),
  quest_id uuid references quests(id),
  amount_minor bigint not null,
  at timestamptz not null default now(),
  memo text not null default ''
);

create index ledger_entries_txn_id_idx on ledger_entries(txn_id);
create index ledger_entries_user_account_idx on ledger_entries(user_id, account);
create index ledger_entries_quest_id_idx on ledger_entries(quest_id);

-- ---------------------------------------------------------------------
-- payments — src/data/contracts/payment.ts's Payment. Only deposit/
-- cashOut ever create one (ADR-005/ADR-013 — see ports/ledger.ts's own
-- header comment for why hold/release/refund never do).
-- ---------------------------------------------------------------------
create table payments (
  id uuid primary key default gen_random_uuid(),
  txn_id text not null unique,
  kind payment_kind not null,
  user_id uuid not null references profiles(id),
  amount_minor bigint not null check (amount_minor > 0),
  state payment_state not null default 'pending',
  provider text not null default 'simulated',
  provider_id text not null,
  created_at timestamptz not null default now(),
  settled_at timestamptz
);

create index payments_user_id_idx on payments(user_id, created_at desc);

-- ---------------------------------------------------------------------
-- reviews — src/data/contracts/review.ts's Review. One review per
-- (quest, rater) pair (PRD §7.8) — the unique index backs
-- ReviewsPort.submitReview's "already rated this one" guard for real.
-- ---------------------------------------------------------------------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references quests(id) on delete cascade,
  rater_id uuid not null references profiles(id),
  ratee_id uuid not null references profiles(id),
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  at timestamptz not null default now(),
  unique (quest_id, rater_id)
);

create index reviews_ratee_id_idx on reviews(ratee_id);

-- ---------------------------------------------------------------------
-- reports / blocked_users — M6's additions, not in PRD §9's original
-- table list (src/data/contracts/report.ts's own header comment: no
-- admin queue reads reports back, same accepted shape as a disputed
-- quest's frozen resolution half).
-- ---------------------------------------------------------------------
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id),
  target_user_id uuid not null references profiles(id),
  reason text not null,
  at timestamptz not null default now()
);

create table blocked_users (
  user_id uuid not null references profiles(id) on delete cascade,
  blocked_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, blocked_id)
);

-- ---------------------------------------------------------------------
-- notifications — src/data/contracts/notification.ts's Notification.
-- ---------------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  quest_id uuid references quests(id),
  body text not null,
  at timestamptz not null default now(),
  read_at timestamptz
);

create index notifications_user_id_idx on notifications(user_id, at desc);
