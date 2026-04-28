import { z } from "zod";

/**
 * Two-stage schema:
 * - Input shape: all string fields (matches HTML form inputs naturally).
 * - Output shape: name is non-empty string; optional text fields become
 *   string | null; lat/lng become number | null and are range-validated.
 *
 * Used on both client (via @hookform/resolvers/zod) and server (re-parsed
 * inside the action). The same schema handles both create and edit.
 */

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

export const chapterFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  city: stringToNullable,
  region: stringToNullable,
  lat: stringToOptionalNumber(-90, 90),
  lng: stringToOptionalNumber(-180, 180),
  notes: stringToNullable,
});

/** What the form fields hold (all strings). */
export type ChapterFormInput = z.input<typeof chapterFormSchema>;

/** What the action receives after parsing. */
export type ChapterFormValues = z.output<typeof chapterFormSchema>;
