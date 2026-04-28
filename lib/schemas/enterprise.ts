import { z } from "zod";

/**
 * Enterprise form schema. Same input/output split as the chapter schema:
 * inputs are all strings (HTML form values), outputs are typed values
 * (numbers, nulls, enums, ISO date strings).
 */

const ENTERPRISE_STAGES = [
  "idea",
  "validating",
  "building",
  "launched",
  "scaling",
  "paused",
] as const;

export type EnterpriseStage = (typeof ENTERPRISE_STAGES)[number];
export const enterpriseStages = ENTERPRISE_STAGES;

const stringToNullable = z
  .string()
  .trim()
  .max(2000)
  .transform((v) => (v.length === 0 ? null : v));

const stringToOptionalNumber = (min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((v, ctx) => {
      if (v.length === 0) return null;
      const n = Number(v);
      if (!Number.isFinite(n)) {
        ctx.addIssue({ code: "custom", message: "Must be a number" });
        return z.NEVER;
      }
      if (n < min || n > max) {
        ctx.addIssue({
          code: "custom",
          message: `Must be between ${min} and ${max}`,
        });
        return z.NEVER;
      }
      return n;
    });

const stringToOptionalUrl = z
  .string()
  .trim()
  .max(2000)
  .transform((v, ctx) => {
    if (v.length === 0) return null;
    try {
      new URL(v);
    } catch {
      ctx.addIssue({ code: "custom", message: "Must be a valid URL (include http/https)" });
      return z.NEVER;
    }
    return v;
  });

const stringToOptionalDate = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (v.length === 0) return null;
    // <input type="date"> emits YYYY-MM-DD. Sanity check that it parses.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v))) {
      ctx.addIssue({ code: "custom", message: "Must be a valid date" });
      return z.NEVER;
    }
    return v;
  });

const stringToOptionalUuid = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (v.length === 0) return null;
    // Loose UUID check; the DB will reject anything stricter that's still wrong.
    if (!/^[0-9a-f-]{36}$/i.test(v)) {
      ctx.addIssue({ code: "custom", message: "Invalid id" });
      return z.NEVER;
    }
    return v;
  });

export const enterpriseFormSchema = z.object({
  chapter_id: z.string().uuid("Chapter is required"),
  name: z.string().trim().min(1, "Name is required").max(200),
  outline: stringToNullable,
  category: stringToNullable,
  stage: z.enum(ENTERPRISE_STAGES),
  location_name: stringToNullable,
  lat: stringToOptionalNumber(-90, 90),
  lng: stringToOptionalNumber(-180, 180),
  contact_member_id: stringToOptionalUuid,
  contact_external: stringToNullable,
  business_plan_url: stringToOptionalUrl,
  business_plan_notes: stringToNullable,
  resources_needed: stringToNullable,
  founded_on: stringToOptionalDate,
});

export type EnterpriseFormInput = z.input<typeof enterpriseFormSchema>;
export type EnterpriseFormValues = z.output<typeof enterpriseFormSchema>;
