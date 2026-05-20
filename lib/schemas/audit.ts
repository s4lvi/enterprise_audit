import { z } from "zod";

/**
 * Audit form schema. Audits are point-in-time records (one row per visit).
 * Scores are 1-5 integers; summary is free text.
 *
 * An audit targets exactly one of: an enterprise or a chapter. The form
 * carries a `target_kind` discriminator + the chosen id; the action maps
 * that to one nullable column in the DB.
 *
 * `auditor_id` is NOT in the form — the action sets it from auth.uid()
 * because RLS requires it to match the caller.
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

export const auditTargetKinds = ["enterprise", "chapter"] as const;
export type AuditTargetKind = (typeof auditTargetKinds)[number];

export const auditFormSchema = z
  .object({
    target_kind: z.enum(auditTargetKinds),
    target_id: z.string().min(1, "Target is required"),
    audited_on: dateString,
    feasibility_score: scoreFromString,
    progress_score: scoreFromString,
    capability_score: scoreFromString,
    summary: stringToNullable,
  })
  .refine(
    (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.target_id),
    { message: "Pick a target", path: ["target_id"] },
  );

export type AuditFormInput = z.input<typeof auditFormSchema>;
export type AuditFormValues = z.output<typeof auditFormSchema>;
