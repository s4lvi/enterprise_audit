import { z } from "zod";

const stringToNullable = z
  .string()
  .trim()
  .max(2000)
  .transform((v) => (v.length === 0 ? null : v));

const dateTimeLocalToIso = z
  .string()
  .trim()
  .min(1, "Date and time are required")
  .transform((v, ctx) => {
    // <input type="datetime-local"> emits "YYYY-MM-DDTHH:MM" in the user's
    // local timezone with no offset. Treat it as local time and serialize
    // to a full ISO string so Postgres can store it as timestamptz.
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid date/time" });
      return z.NEVER;
    }
    return d.toISOString();
  });

// Optional enterprise pointer. Null/empty means the schedule is for a
// chapter-wide audit; a uuid means the schedule is for that enterprise.
const optionalUuid = z
  .string()
  .trim()
  .transform((v) => (v.length === 0 ? null : v))
  .refine(
    (v) => v == null || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
    "Invalid enterprise",
  );

export const scheduledAuditFormSchema = z.object({
  scheduled_at: dateTimeLocalToIso,
  chapter_id: z.string().uuid("Chapter is required"),
  enterprise_id: optionalUuid,
  assigned_to: z.string().uuid("Assignee is required"),
  notes: stringToNullable,
});

export type ScheduledAuditFormInput = z.input<typeof scheduledAuditFormSchema>;
export type ScheduledAuditFormValues = z.output<typeof scheduledAuditFormSchema>;
