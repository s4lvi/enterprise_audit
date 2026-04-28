import { z } from "zod";

/**
 * Chapter form schema. Chapters represent states (no per-chapter location);
 * see migration 20260428035047_chapters_state_only.sql.
 */

const stringToNullable = z
  .string()
  .trim()
  .max(2000)
  .transform((v) => (v.length === 0 ? null : v));

export const chapterFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  notes: stringToNullable,
});

export type ChapterFormInput = z.input<typeof chapterFormSchema>;
export type ChapterFormValues = z.output<typeof chapterFormSchema>;
