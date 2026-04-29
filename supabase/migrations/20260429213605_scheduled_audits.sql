-- Scheduled audit visits (date + time + chapter + assignee).
-- Distinct from the `audits` table which records the result of a visit.
-- A scheduled_audit can optionally point at the audit row produced when
-- the visit happens (completed_audit_id), but isn't required to.

create table public.scheduled_audits (
  id                  uuid        primary key default gen_random_uuid(),
  scheduled_at        timestamptz not null,
  chapter_id          uuid        not null references public.chapters(id) on delete cascade,
  assigned_to         uuid        not null references public.profiles(id) on delete restrict,
  notes               text,
  completed_audit_id  uuid        references public.audits(id) on delete set null,
  created_by          uuid        references public.profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index scheduled_audits_scheduled_at_idx on public.scheduled_audits (scheduled_at);
create index scheduled_audits_chapter_idx      on public.scheduled_audits (chapter_id);
create index scheduled_audits_assignee_idx     on public.scheduled_audits (assigned_to);

create trigger scheduled_audits_set_updated_at
  before update on public.scheduled_audits
  for each row execute function public.set_updated_at();

create trigger scheduled_audits_audit_delete
  after delete on public.scheduled_audits
  for each row execute function public.log_audit();

alter table public.scheduled_audits enable row level security;

-- Read by all authenticated.
create policy "scheduled_audits readable by authenticated"
  on public.scheduled_audits for select
  to authenticated using (true);

-- Auditors and admins can create/edit any scheduled audit.
-- The assignee can also update their own scheduled audit (e.g. to add
-- notes or attach the completed audit).
create policy "scheduled_audits insert by staff"
  on public.scheduled_audits for insert
  to authenticated
  with check (public.is_auditor_or_admin());

create policy "scheduled_audits update by staff or assignee"
  on public.scheduled_audits for update
  to authenticated
  using (public.is_auditor_or_admin() or assigned_to = auth.uid())
  with check (public.is_auditor_or_admin() or assigned_to = auth.uid());

create policy "scheduled_audits delete by admin"
  on public.scheduled_audits for delete
  to authenticated using (public.is_admin());
