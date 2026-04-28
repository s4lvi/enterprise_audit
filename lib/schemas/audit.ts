import { z } from "zod";

/**
 * Audit form schema. Audits are point-in-time records (one row per visit).
 * Scores are 1-5 integers; summary is free text.
 *
 * `auditor_id` is NOT in the form — the action sets it from auth.uid()
 * because RLS requires it to match the caller and we don't want users
 * choosing.
 */

const stringToNullable = z
  .string()
  .trim()
  .max(4000)
  .transform((v) => (v.length === 0 ? null : v));

const scoreFromString = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      ctx.addIssue({ code: "custom", message: "Pick a score from 1 to 5" });
      return z.NEVER;
    }
    return n;
  });

const dateString = z
  .string()
  .trim()
  .min(1, "Date is required")
  .refine(
    (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)),
    "Must be a valid date",
  );

export const auditFormSchema = z.object({
  enterprise_id: z.string().uuid("Enterprise is required"),
  audited_on: dateString,
  feasibility_score: scoreFromString,
  progress_score: scoreFromString,
  capability_score: scoreFromString,
  summary: stringToNullable,
});

export type AuditFormInput = z.input<typeof auditFormSchema>;
export type AuditFormValues = z.output<typeof auditFormSchema>;
