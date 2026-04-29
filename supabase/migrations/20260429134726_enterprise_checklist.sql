-- Configurable per-enterprise checklist (admin-managed list of items;
-- per-enterprise tick presence = "yes", absence = "no/unanswered").

create table public.enterprise_check_items (
  id          uuid        primary key default gen_random_uuid(),
  label       text        not null unique,
  description text,
  sort_order  integer     not null default 0,
  archived    boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index enterprise_check_items_sort_idx
  on public.enterprise_check_items (sort_order, label);

create trigger enterprise_check_items_set_updated_at
  before update on public.enterprise_check_items
  for each row execute function public.set_updated_at();

create table public.enterprise_checks (
  enterprise_id uuid not null references public.enterprises(id) on delete cascade,
  check_item_id uuid not null references public.enterprise_check_items(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (enterprise_id, check_item_id)
);

create index enterprise_checks_enterprise_idx on public.enterprise_checks (enterprise_id);
create index enterprise_checks_item_idx       on public.enterprise_checks (check_item_id);

-- ============================================================================
-- RLS
-- ============================================================================

alter table public.enterprise_check_items enable row level security;
alter table public.enterprise_checks      enable row level security;

-- check_items: readable by everyone authenticated; admin-only writes.
create policy "check_items readable by authenticated"
  on public.enterprise_check_items for select
  to authenticated using (true);

create policy "check_items writable by admin"
  on public.enterprise_check_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- checks: readable by all authenticated; writable by anyone who can edit
-- the enterprise (mirror enterprises RLS — chapter members for own
-- chapter, auditors, admins).
create policy "checks readable by authenticated"
  on public.enterprise_checks for select
  to authenticated using (true);

create policy "checks writable by chapter or staff"
  on public.enterprise_checks for all
  to authenticated
  using (
    public.is_auditor_or_admin()
    or exists (
      select 1 from public.enterprises e
      where e.id = enterprise_id
        and e.chapter_id = public.current_user_chapter_id()
    )
  )
  with check (
    public.is_auditor_or_admin()
    or exists (
      select 1 from public.enterprises e
      where e.id = enterprise_id
        and e.chapter_id = public.current_user_chapter_id()
    )
  );

-- Audit-log delete on these tables too, for consistency with the rest.
create trigger enterprise_check_items_audit_delete
  after delete on public.enterprise_check_items
  for each row execute function public.log_audit();
