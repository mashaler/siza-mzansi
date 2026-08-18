-- =================================================================
-- Siza Mzansi — database schema
-- Run this in Supabase: Dashboard → SQL Editor → New query → paste
-- this whole file → Run. Safe to re-run (uses IF NOT EXISTS / OR
-- REPLACE where possible).
-- =================================================================

-- ---------------------------------------------------------------
-- PROFILES
-- One row per user, linked 1:1 to Supabase's built-in auth.users.
-- We don't store email/password ourselves — Supabase Auth handles
-- that. This table holds the profile data the app actually needs.
-- ---------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'New user',
  phone text,
  province text,
  city text,
  education text,
  field_of_study text,
  experience text,
  skills text,
  job_title text default 'Job seeker',
  industries text,
  relocate boolean default false,
  remote boolean default true,
  completion int default 20,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a blank profile row the moment someone signs up,
-- so the app never has to handle "no profile yet" as a special case.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'New user'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------
-- OPPORTUNITIES
-- Public read for everyone (no login needed to browse jobs).
-- Only admins write — enforced at the app/service level for now;
-- tighten with a real "role" check once admin accounts exist.
-- ---------------------------------------------------------------
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  org text not null,
  type text not null check (type in ('Job', 'Graduate Programme', 'Learnership', 'Internship', 'Bursary')),
  location text,
  province text,
  closing date,
  experience text,
  salary text,
  description text,
  requirements text[] default '{}',
  verified boolean default false,
  source text default 'demo',
  created_at timestamptz not null default now()
);

alter table public.opportunities enable row level security;

drop policy if exists "Anyone can view opportunities" on public.opportunities;
create policy "Anyone can view opportunities"
  on public.opportunities for select
  using (true);

-- ---------------------------------------------------------------
-- SAVED OPPORTUNITIES (many-to-many: user <-> opportunity)
-- ---------------------------------------------------------------
create table if not exists public.saved_opportunities (
  user_id uuid references auth.users(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

alter table public.saved_opportunities enable row level security;

drop policy if exists "Users manage own saved opportunities" on public.saved_opportunities;
create policy "Users manage own saved opportunities"
  on public.saved_opportunities for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- APPLICATIONS
-- ---------------------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  title text not null,
  org text not null,
  status text not null default 'Saved' check (
    status in ('Saved', 'Planning to Apply', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn')
  ),
  applied_date date,
  interview_date timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.applications enable row level security;

drop policy if exists "Users manage own applications" on public.applications;
create policy "Users manage own applications"
  on public.applications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- SEED DATA
-- The 5 opportunities that were previously hardcoded in App.jsx.
-- Match score is intentionally NOT stored here — it depends on the
-- viewing user's profile, so it gets computed at query time later.
-- ---------------------------------------------------------------
insert into public.opportunities (title, org, type, location, province, closing, experience, salary, description, requirements, verified, source)
values
  ('Junior Software Tester', 'Thusong Digital', 'Job', 'Johannesburg', 'Gauteng', '2026-08-28', '0–1 years', 'R14,000 – R18,000/mo',
   'Join a small QA team supporting a retail banking client. You''ll write manual test cases, learn automation basics on Playwright, and pair with senior testers.',
   array['Matric + IT-related qualification', 'Basic understanding of SDLC', 'Strong attention to detail'], true, 'demo'),

  ('Graduate Data Analyst Programme', 'Kagiso Insurance Group', 'Graduate Programme', 'Sandton', 'Gauteng', '2026-09-05', 'Graduate', 'R16,500/mo',
   'A 12-month structured graduate programme rotating through underwriting, claims and actuarial analytics teams.',
   array['BSc/BCom with Statistics or similar', 'Strong Excel skills', 'Willingness to relocate to Sandton'], true, 'demo'),

  ('IT Support Learnership (NQF4)', 'Vodacom Foundation', 'Learnership', 'Midrand', 'Gauteng', '2026-09-12', 'Entry level', 'R4,500/mo stipend',
   'A 12-month accredited learnership combining classroom training with on-the-job IT service desk experience.',
   array['Matric with Maths or Maths Literacy', 'South African citizen aged 18–28', 'Not currently studying full-time'], true, 'demo'),

  ('Marketing Internship', 'Nandi & Co Communications', 'Internship', 'Cape Town', 'Western Cape', '2026-08-30', '0–1 years', 'R6,000/mo stipend',
   '6-month internship supporting social content, client reporting and campaign coordination for a boutique agency.',
   array['Diploma or degree in Marketing/Communications', 'Own laptop', 'Portfolio of written work'], false, 'demo'),

  ('Sasol Engineering Bursary 2027', 'Sasol', 'Bursary', 'Secunda', 'Mpumalanga', '2026-09-20', 'Matric / 1st year', 'Full cover + stipend',
   'Full bursary covering tuition, accommodation and a monthly allowance for students pursuing Chemical or Mechanical Engineering.',
   array['Matric with 70%+ in Maths & Physical Science', 'South African citizen', 'Household income below threshold'], true, 'demo')
on conflict do nothing;
