-- Audit log for sensitive writes: deletes on the four content tables,
-- and role/chapter changes on profiles. Writes are made by a security
-- definer trigger, so they bypass RLS and are tamper-resistant.
-- Reads are admin-only.

create table public.audit_log (
  id           bigserial primary key,
  occurred_at  timestamptz not null default now(),
  actor_id     uuid,
  table_name   text   not null,
  operation    text   not null check (operation in ('INSERT','UPDATE','DELETE')),
  row_id       text,
  old_data     jsonb,
  new_data     jsonb
);

create index audit_log_occurred_at_idx on public.audit_log (occurred_at desc);
create index audit_log_table_name_idx  on public.audit_log (table_name);
create index audit_log_actor_idx       on public.audit_log (actor_id);

create or replace function public.log_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rid text;
begin
  if TG_OP = 'DELETE' then
    rid := (OLD.id)::text;
  else
    rid := (NEW.id)::text;
  end if;

  insert into public.audit_log (actor_id, table_name, operation, row_id, old_data, new_data)
  values (
    auth.uid(),
    TG_TABLE_NAME,
    TG_OP,
    rid,
    case when TG_OP in ('UPDATE','DELETE') then to_jsonb(OLD) else null end,
    case when TG_OP in ('INSERT','UPDATE') then to_jsonb(NEW) else null end
  );

  return coalesce(NEW, OLD);
end;
$$;

-- Triggers: deletes on the content tables
create trigger chapters_audit_delete
  after delete on public.chapters
  for each row execute function public.log_audit();

create trigger enterprises_audit_delete
  after delete on public.enterprises
  for each row execute function public.log_audit();

create trigger audits_audit_delete
  after delete on public.audits
  for each row execute function public.log_audit();

create trigger relationships_audit_delete
  after delete on public.enterprise_relationships
  for each row execute function public.log_audit();

-- Trigger: profile role/chapter changes only (not display_name etc.)
create trigger profiles_audit_role_or_chapter
  after update of role, chapter_id on public.profiles
  for each row execute function public.log_audit();

-- RLS: only admins can read. The trigger is security definer so writes
-- happen regardless of policy.
alter table public.audit_log enable row level security;

create policy "audit_log readable by admin"
  on public.audit_log for select
  to authenticated
  using (public.is_admin());
