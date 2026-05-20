-- Chapter audits: extend `audits` so it can target either an enterprise
-- or a chapter (exactly one). Adds a parallel chapter checklist.
-- Also lets `scheduled_audits` optionally target a specific enterprise.

-- ============================================================================
-- audits: make enterprise_id nullable, add chapter_id, enforce one-of.
-- ============================================================================

alter table public.audits
  alter column enterprise_id drop not null;

alter table public.audits
  add column chapter_id uuid references public.chapters(id) on delete cascade;

create index audits_chapter_id_idx on public.audits(chapter_id);

alter table public.audits
  add constraint audits_target_exactly_one
  check (
    (enterprise_id is not null and chapter_id is null)
    or (enterprise_id is null and chapter_id is not null)
  );

-- ============================================================================
-- scheduled_audits: optional enterprise target. Null => chapter-wide audit.
-- ============================================================================

alter table public.scheduled_audits
  add column enterprise_id uuid references public.enterprises(id) on delete set null;

create index scheduled_audits_enterprise_idx on public.scheduled_audits(enterprise_id);

-- ============================================================================
-- chapter_check_items (mirror of enterprise_check_items)
-- ============================================================================

create table public.chapter_check_items (
  id          uuid        primary key default gen_random_uuid(),
  label       text        not null unique,
  description text,
  sort_order  integer     not null default 0,
  archived    boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index chapter_check_items_sort_idx
  on public.chapter_check_items (sort_order, label);

create trigger chapter_check_items_set_updated_at
  before update on public.chapter_check_items
  for each row execute function public.set_updated_at();

create table public.chapter_checks (
  chapter_id    uuid not null references public.chapters(id) on delete cascade,
  check_item_id uuid not null references public.chapter_check_items(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (chapter_id, check_item_id)
);

create index chapter_checks_chapter_idx on public.chapter_checks (chapter_id);
create index chapter_checks_item_idx    on public.chapter_checks (check_item_id);

alter table public.chapter_check_items enable row level security;
alter table public.chapter_checks      enable row level security;

create policy "chapter_check_items readable by authenticated"
  on public.chapter_check_items for select
  to authenticated using (true);

create policy "chapter_check_items writable by admin"
  on public.chapter_check_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "chapter_checks readable by authenticated"
  on public.chapter_checks for select
  to authenticated using (true);

-- Mirror chapter write rules: admin or auditor anywhere; chapter members
-- only on their own chapter.
create policy "chapter_checks writable by chapter or staff"
  on public.chapter_checks for all
  to authenticated
  using (
    public.is_auditor_or_admin()
    or chapter_id = public.current_user_chapter_id()
  )
  with check (
    public.is_auditor_or_admin()
    or chapter_id = public.current_user_chapter_id()
  );

create trigger chapter_check_items_audit_delete
  after delete on public.chapter_check_items
  for each row execute function public.log_audit();
