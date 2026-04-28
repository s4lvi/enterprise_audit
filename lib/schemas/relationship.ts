import { z } from "zod";

export const RELATIONSHIP_TYPES = [
  "partner",
  "supplier",
  "customer",
  "competitor",
  "parent",
  "spinoff",
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];
export const relationshipTypes = RELATIONSHIP_TYPES;

const stringToNullable = z
  .string()
  .trim()
  .max(2000)
  .transform((v) => (v.length === 0 ? null : v));

export const relationshipFormSchema = z
  .object({
    from_id: z.string().uuid("Source enterprise is required"),
    to_id: z.string().uuid("Target enterprise is required"),
    type: z.enum(RELATIONSHIP_TYPES),
    notes: stringToNullable,
  })
  .refine((v) => v.from_id !== v.to_id, {
    message: "An enterprise can't have a relationship with itself",
    path: ["to_id"],
  });

export type RelationshipFormInput = z.input<typeof relationshipFormSchema>;
export type RelationshipFormValues = z.output<typeof relationshipFormSchema>;
