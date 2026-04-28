import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Map a Postgres / Supabase error to a user-readable message. Supabase
 * surfaces errors with a `code` (PG SQLSTATE) plus a raw `message`. The
 * raw message often leaks schema details ("new row violates row-level
 * security policy for table public.enterprises") — fine for logs, bad
 * for users.
 */
export function friendlyError(error: PostgrestError): string {
  const code = error.code ?? "";

  // RLS rejection
  if (code === "42501" || /row-level security/i.test(error.message)) {
    return "You don't have permission to do that.";
  }

  // Unique constraint
  if (code === "23505") {
    return "Something with that name already exists here.";
  }

  // Foreign key violation (referenced row is missing or has dependents)
  if (code === "23503") {
    if (/violates foreign key.*delete/i.test(error.message)) {
      return "Can't delete: other records depend on this.";
    }
    return "Referenced record is missing.";
  }

  // Not-null violation
  if (code === "23502") {
    return "A required field is missing.";
  }

  // Check constraint (e.g. score range)
  if (code === "23514") {
    return "A value is out of the allowed range.";
  }

  // Fallback — show the raw message but trimmed
  return error.message.replace(/^new row violates.*?for table .*?:\s*/i, "");
}
