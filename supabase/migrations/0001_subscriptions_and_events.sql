-- Paywall storage: who has paid for what, and what visitors actually do.
--
-- Two tables with deliberately opposite postures, because they carry opposite
-- risks.
--
--   subscriptions — the source of truth for entitlement. A row here is money,
--                   so nothing the browser can reach may write it. The only
--                   writer is the Stripe webhook running as `service_role`,
--                   which bypasses RLS entirely. There is therefore NO insert
--                   or update policy at all: a policy that exists can be
--                   reasoned around, one that was never written cannot.
--
--   events        — product analytics. A lost row costs nothing and the funnel
--                   has to be measurable for logged-out visitors, so the
--                   posture inverts: anon and authenticated may INSERT, nobody
--                   may SELECT. Reading is what would leak the pipeline; being
--                   able to write only lets someone add noise, which is the
--                   same exposure any public form on the internet already has
--                   (see the `capture_lead` note in README.md).
--
-- This follows the convention already set by leads / assessments /
-- consultation_requests: RLS on, and the client never gets a policy it does
-- not strictly need.

-- ------------------------------------------------------------ subscriptions

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  -- Deleting the account deletes the entitlement with it. Keeping an orphan
  -- subscription row would leave paid capabilities attached to a user id that
  -- can, in principle, be reissued.
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Mirrors TierId in src/lib/tiers.ts. Postgres has no idea that file exists,
  -- so the check constraint is the only thing stopping a typo in a webhook
  -- from writing a tier the application will silently read as unknown.
  tier text not null
    check (tier in ('free', 'diagnostic', 'plan', 'guided')),
  -- Stripe's own vocabulary, kept verbatim so the webhook never has to
  -- translate. Only 'active' grants anything; see the index below.
  status text not null
    check (status in ('active', 'canceled', 'past_due', 'incomplete')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One live subscription per user, enforced in Postgres rather than in the
-- webhook. Stripe retries deliveries, so "insert if not present" logic in
-- application code eventually races itself; here a duplicate delivery collides
-- with a constraint instead of quietly granting a second tier. Partial, because
-- canceled and past_due rows are history and a user may accumulate many.
create unique index if not exists subscriptions_one_active_per_user
  on public.subscriptions (user_id)
  where status = 'active';

alter table public.subscriptions enable row level security;

-- The only policy on this table. A signed-in user may read their own row —
-- that is what getTier() in src/lib/entitlement.ts does with the session-bound
-- anon key — and nothing else. No insert, update or delete policy exists, so
-- every write must arrive with the service role key.
create policy subscriptions_select_own
  on public.subscriptions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- ------------------------------------------------------------------- events

create table if not exists public.events (
  id bigserial primary key,
  -- Nullable and `set null` on delete: most events happen before anyone signs
  -- in, and a deleted account must not take the funnel's history with it.
  user_id uuid references auth.users (id) on delete set null,
  -- Client-generated id that stitches an anonymous visit together and, later,
  -- to the account it converted into.
  session_id text,
  name text not null,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- The two questions this table is actually asked: "what did this person do,
-- most recent first" and "how has this event trended". Both are answered by an
-- index whose second column is already in the order the query wants.
create index if not exists events_user_id_created_at_idx
  on public.events (user_id, created_at desc);

create index if not exists events_name_created_at_idx
  on public.events (name, created_at desc);

alter table public.events enable row level security;

-- Insert only, and only as yourself. The `user_id is null` arm is what lets a
-- logged-out visitor be measured at all; the second arm stops a signed-in user
-- from attributing events to somebody else's account. There is deliberately no
-- select policy: analytics is read from the dashboard or the service role.
create policy events_insert_own
  on public.events
  for insert
  to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));

-- Supabase's default privileges already grant these to anon/authenticated, but
-- stating them makes the migration self-contained rather than dependent on how
-- the project was provisioned. RLS above is the actual gate — these grants only
-- decide whether the statement is allowed to be attempted at all.
grant select on public.subscriptions to authenticated;
grant insert on public.events to anon, authenticated;
-- `bigserial` means every insert calls nextval() on this sequence; without
-- usage on it an otherwise valid insert fails on a permission error, which
-- would break analytics for exactly the logged-out visitors it exists to track.
grant usage on sequence public.events_id_seq to anon, authenticated;
