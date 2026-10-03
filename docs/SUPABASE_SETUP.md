# Turning on the Supabase adapter

M7 built a complete Supabase scaffold — schema, RLS, every RPC, the full
`src/data/adapters/supabase` implementation, realtime, real Google OAuth +
OTP — but it was built without a live project (see `docs/DECISIONS.md`'s
ADR-015 for the full scope note and the real architecture decisions made
along the way). Nothing below has been run. This is the checklist for
whoever provisions the first real project.

## 1. Create the project

Create a project at [supabase.com](https://supabase.com). Note its
**Project URL** and **anon public key** (Project Settings → API) — you'll
need both for step 5. Note the **service_role key** too (same page) — only
for step 4, and only ever from a trusted machine; it bypasses every RLS
policy in `supabase/migrations/*.sql`, so it must never ship to the app.

## 2. Apply the migrations

Either:

```sh
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

or, without the Supabase CLI, run each file in `supabase/migrations/`
against the project's SQL editor **in filename order** — they're numbered
for exactly this reason and several later ones depend on tables/functions
earlier ones create.

## 3. Configure auth providers

- **Google OAuth**: Authentication → Providers → Google. You'll need a
  matching OAuth client in
  [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
  with `youdo://` (from `app.json`'s `scheme`) registered as an authorized
  redirect scheme, plus Supabase's own callback URL (shown on that same
  Providers page) added there too.
- **Email OTP** works out of the box on most projects (Supabase's default
  email provider, rate-limited).
- **Phone/SMS OTP** needs a configured provider (Twilio or similar) under
  Authentication → Providers → Phone — skip this if phone sign-in isn't
  needed yet; the app degrades to email OTP + Google either way.

## 4. Seed the fixture data

```sh
SUPABASE_URL=https://<ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service_role key> \
npm run db:seed
```

Runs `scripts/seed-supabase.ts` — reads `src/data/adapters/memory/seed.ts`
directly (the exact same fixture the memory adapter parses) and inserts it
via the service-role key, which bypasses RLS. Creates one real
`auth.users` row per seed user (no password — this product has none,
ADR-007 — they sign in later via real OTP/Google), then every quest,
offer, thread, message, ledger entry, review and notification the fixture
has, with real foreign keys throughout. Idempotent it is not — running it
twice against the same project creates duplicate users; only run it once,
against a fresh project.

## 5. Point the app at it

In `.env` (see `.env.example`):

```sh
EXPO_PUBLIC_DATA_ADAPTER=supabase
EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
```

No feature code changes — that's ADR-004's whole promise, and flipping this
one flag is the actual test of whether it held.

## 6. What you still won't get for free

- **No real integration tests.** `adapters/supabase/*.test.ts` mock
  `@supabase/supabase-js`'s client and verify request shape — real signal,
  but never proof a query executes correctly or an RLS policy holds.
  Exercise the app against the real project by hand (or write a real
  integration suite against it — none exists yet).
- **No 72-hour auto-release.** `confirm_done` is poster-initiated only; the
  `system` actor the memory adapter's clock sweep models has no scheduler
  to run against yet. Wire a `pg_cron` job or a scheduled Edge Function
  calling `confirm_done`-equivalent logic once the window's passed, or
  accept manual confirmation as the only path for now.
- **No quest-photo or avatar storage.** No field or UI for it exists
  anywhere in the app yet — this is real product work, not a config step.
- **Generated types.** `src/data/adapters/supabase/database.types.ts` is
  hand-authored. Once a real project exists, run
  `supabase gen types typescript --project-id <ref>` and reconcile — see
  that file's own header comment.
