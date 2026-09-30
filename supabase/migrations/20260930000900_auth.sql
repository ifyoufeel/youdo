-- M7 scaffold, Phase 8: the one piece of schema real auth needs — a
-- trigger that creates a profiles row the moment a real signup lands in
-- Supabase's own auth.users, since every table here references
-- profiles(id), never auth.users(id) directly (Phase 0's own design).
--
-- Google OAuth and email/phone OTP themselves need zero SQL — they're
-- supabase-js client calls (src/data/adapters/supabase/auth.ts) against
-- Supabase's built-in GoTrue service, configured entirely through the
-- dashboard (Authentication -> Providers), not a migration. Real OTP
-- delivery (email works out of the box on most projects; phone/SMS
-- needs a configured provider like Twilio) and the Google OAuth client
-- credentials are both provisioning steps for whoever stands up the
-- live project this scaffold has never had — recorded in Phase 9's
-- setup doc, not something a migration file can do.
--
-- default_area picks the alphabetically-first seeded area as a
-- placeholder — onboarding's real job (unbuilt in this scaffold, same
-- as every other client-side screen change M7 doesn't touch) is letting
-- a new signup pick their actual area/home point before they do
-- anything real; this trigger only has to satisfy the NOT NULL/FK on
-- profiles.area so the row can exist at all. It depends on areas
-- already being seeded — true once Phase 9's seed script has run
-- against a real project, not before.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_default_area text;
begin
  select name into v_default_area from areas order by name limit 1;

  insert into profiles (id, name, area, home_x, home_y)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'New user'),
    v_default_area,
    0,
    0
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
