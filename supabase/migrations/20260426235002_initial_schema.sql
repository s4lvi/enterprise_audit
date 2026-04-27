-- Initial schema for Enterprise Audit
-- Tables: chapters, profiles, enterprises, enterprise_members,
--         audits, enterprise_relationships
-- All tables have RLS enabled. Policies use helper functions that read
-- the current user's role/chapter from public.profiles.

-- ============================================================================
-- Extensions
-- ============================================================================

create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- ============================================================================
-- Enums
-- ============================================================================

create type public.user_role as enum (
  'admin',
  'auditor',
  'chapter_exec',
  'member'
);

create type public.enterprise_stage as enum (
  'idea',
  'validating',
  'building',
  'launched',
  'scaling',
  'paused'
);

create type public.enterprise_member_role as enum (
  'founder',
  'lead',
  'contributor',
  'advisor'
);

create type public.relationship_type as enum (
  'partner',
  'supplier',
  'customer',
  'competitor',
  'parent',
  'spinoff'
);

-- ============================================================================
-- Helpers: updated_at trigger
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- chapters
-- ============================================================================

create table public.chapters (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null unique,
  city        text,
  region      text,
  lat         double precision,
  lng         double precision,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger chapters_set_updated_at
  before update on public.chapters
  for each row execute function public.set_updated_at();

-- ============================================================================
-- profiles  (1:1 with auth.users)
-- ============================================================================

create table public.profiles (
  id           uuid       primary key references auth.users(id) on delete cascade,
  display_name text       not null,
  role         public.user_role not null default 'member',
  chapter_id   uuid       references public.chapters(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index profiles_chapter_id_idx on public.profiles(chapter_id);
create index profiles_role_idx       on public.profiles(role);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row on new auth signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- enterprises
-- ============================================================================

create table public.enterprises (
  id                  uuid       primary key default gen_random_uuid(),
  chapter_id          uuid       not null references public.chapters(id) on delete restrict,
  name                text       not null,
  outline             text,
  category            text,
  stage               public.enterprise_stage not null default 'idea',
  location_name       text,
  lat                 double precision,
  lng                 double precision,
  contact_member_id   uuid       references public.profiles(id) on delete set null,
  contact_external    text,
  business_plan_url   text,
  business_plan_notes text,
  resources_needed    text,
  founded_on          date,
  created_by          uuid       references public.profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (chapter_id, name)
);

create index enterprises_chapter_id_idx     on public.enterprises(chapter_id);
create index enterprises_stage_idx          on public.enterprises(stage);
create index enterprises_contact_member_idx on public.enterprises(contact_member_id);

create trigger enterprises_set_updated_at
  before update on public.enterprises
  for each row execute function public.set_updated_at();

-- ============================================================================
-- enterprise_members  (many-to-many: profiles <-> enterprises)
-- ============================================================================

create table public.enterprise_members (
  enterprise_id uuid not null references public.enterprises(id) on delete cascade,
  profile_id    uuid not null references public.profiles(id)    on delete cascade,
  role          public.enterprise_member_role not null default 'contributor',
  created_at    timestamptz not null default now(),
  primary key (enterprise_id, profile_id)
);

create index enterprise_members_profile_idx on public.enterprise_members(profile_id);

-- ============================================================================
-- audits
-- ============================================================================

create table public.audits (
  id                 uuid       primary key default gen_random_uuid(),
  enterprise_id      uuid       not null references public.enterprises(id) on delete cascade,
  auditor_id         uuid       not null references public.profiles(id)    on delete restrict,
  audited_on         date       not null default current_date,
  feasibility_score  smallint   not null check (feasibility_score between 1 and 5),
  progress_score     smallint   not null check (progress_score    between 1 and 5),
  capability_score   smallint   not null check (capability_score  between 1 and 5),
  summary            text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index audits_enterprise_id_idx on public.audits(enterprise_id);
create index audits_auditor_id_idx    on public.audits(auditor_id);
create index audits_audited_on_idx    on public.audits(audited_on desc);

create trigger audits_set_updated_at
  before update on public.audits
  for each row execute function public.set_updated_at();

-- ============================================================================
-- enterprise_relationships
-- ============================================================================

create table public.enterprise_relationships (
  id            uuid       primary key default gen_random_uuid(),
  from_id       uuid       not null references public.enterprises(id) on delete cascade,
  to_id         uuid       not null references public.enterprises(id) on delete cascade,
  type          public.relationship_type not null,
  notes         text,
  created_by    uuid       references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  check (from_id <> to_id),
  unique (from_id, to_id, type)
);

create index enterprise_relationships_from_idx on public.enterprise_relationships(from_id);
create index enterprise_relationships_to_idx   on public.enterprise_relationships(to_id);

-- ============================================================================
-- Role helpers (security definer, so RLS policies can call them)
-- ============================================================================

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_chapter_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select chapter_id from public.profiles where id = auth.uid();
$$;

-- Convenience predicates
create or replace function public.is_admin()
returns boolean language sql stable
as $$ select public.current_user_role() = 'admin' $$;

create or replace function public.is_auditor_or_admin()
returns boolean language sql stable
as $$ select public.current_user_role() in ('admin','auditor') $$;

-- ============================================================================
-- RLS: enable on every table
-- ============================================================================

alter table public.chapters                 enable row level security;
alter table public.profiles                 enable row level security;
alter table public.enterprises              enable row level security;
alter table public.enterprise_members       enable row level security;
alter table public.audits                   enable row level security;
alter table public.enterprise_relationships enable row level security;

-- ============================================================================
-- Policies
--
-- v1 read model: any authenticated user in the org sees all chapters,
-- enterprises, audits, and relationships (the map/graph need it).
-- Writes are role-gated.
-- ============================================================================

-- chapters: readable by all authenticated; admin-only writes
create policy "chapters readable by authenticated"
  on public.chapters for select
  to authenticated using (true);

create policy "chapters writable by admin"
  on public.chapters for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- profiles: readable by all authenticated; you can update your own non-privileged
-- fields; only admins can change role/chapter; only admin can delete.
create policy "profiles readable by authenticated"
  on public.profiles for select
  to authenticated using (true);

create policy "profiles update own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.profiles where id = auth.uid())
    and chapter_id is not distinct from (select chapter_id from public.profiles where id = auth.uid())
  );

create policy "profiles update by admin"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "profiles delete by admin"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- enterprises: readable by all authenticated; writable by chapter members
-- of the same chapter, auditors, or admins. Delete admin-only.
create policy "enterprises readable by authenticated"
  on public.enterprises for select
  to authenticated using (true);

create policy "enterprises insert by chapter or staff"
  on public.enterprises for insert
  to authenticated
  with check (
    public.is_auditor_or_admin()
    or chapter_id = public.current_user_chapter_id()
  );

create policy "enterprises update by chapter or staff"
  on public.enterprises for update
  to authenticated
  using (
    public.is_auditor_or_admin()
    or chapter_id = public.current_user_chapter_id()
  )
  with check (
    public.is_auditor_or_admin()
    or chapter_id = public.current_user_chapter_id()
  );

create policy "enterprises delete by admin"
  on public.enterprises for delete
  to authenticated using (public.is_admin());

-- enterprise_members: readable by all; writable by chapter or staff;
-- delete admin-only.
create policy "enterprise_members readable by authenticated"
  on public.enterprise_members for select
  to authenticated using (true);

create policy "enterprise_members insert by chapter or staff"
  on public.enterprise_members for insert
  to authenticated
  with check (
    public.is_auditor_or_admin()
    or exists (
      select 1 from public.enterprises e
      where e.id = enterprise_id
        and e.chapter_id = public.current_user_chapter_id()
    )
  );

create policy "enterprise_members update by chapter or staff"
  on public.enterprise_members for update
  to authenticated
  using (
    public.is_auditor_or_admin()
    or exists (
      select 1 from public.enterprises e
      where e.id = enterprise_id
        and e.chapter_id = public.current_user_chapter_id()
    )
  );

create policy "enterprise_members delete by admin"
  on public.enterprise_members for delete
  to authenticated using (public.is_admin());

-- audits: readable by all; insert by auditors/admins only;
-- update by author or admin; delete by admin.
create policy "audits readable by authenticated"
  on public.audits for select
  to authenticated using (true);

create policy "audits insert by auditor or admin"
  on public.audits for insert
  to authenticated
  with check (
    public.is_auditor_or_admin()
    and auditor_id = auth.uid()
  );

create policy "audits update by author or admin"
  on public.audits for update
  to authenticated
  using (auditor_id = auth.uid() or public.is_admin())
  with check (auditor_id = auth.uid() or public.is_admin());

create policy "audits delete by admin"
  on public.audits for delete
  to authenticated using (public.is_admin());

-- enterprise_relationships: readable by all; writable by auditors/admins.
create policy "relationships readable by authenticated"
  on public.enterprise_relationships for select
  to authenticated using (true);

create policy "relationships writable by auditor or admin"
  on public.enterprise_relationships for all
  to authenticated
  using (public.is_auditor_or_admin())
  with check (public.is_auditor_or_admin());
