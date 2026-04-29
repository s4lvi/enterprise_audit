import { z } from "zod";

const stringToNullable = z
  .string()
  .trim()
  .max(2000)
  .transform((v) => (v.length === 0 ? null : v));

const stringToInt = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (v.length === 0) return 0;
    const n = Number(v);
    if (!Number.isInteger(n)) {
      ctx.addIssue({ code: "custom", message: "Must be a whole number" });
      return z.NEVER;
    }
    return n;
  });

export const checkItemFormSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(120),
  description: stringToNullable,
  sort_order: stringToInt,
  archived: z.union([z.literal("on"), z.literal("")]).transform((v) => v === "on"),
});

export type CheckItemFormInput = z.input<typeof checkItemFormSchema>;
export type CheckItemFormValues = z.output<typeof checkItemFormSchema>;
