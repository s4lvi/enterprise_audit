import { z } from "zod";

export const USER_ROLES = ["admin", "auditor", "chapter_exec", "member"] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const userRoles = USER_ROLES;

const stringToOptionalUuid = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (v.length === 0) return null;
    if (!/^[0-9a-f-]{36}$/i.test(v)) {
      ctx.addIssue({ code: "custom", message: "Invalid id" });
      return z.NEVER;
    }
    return v;
  });

export const profileAdminFormSchema = z.object({
  display_name: z.string().trim().min(1, "Name is required").max(120),
  role: z.enum(USER_ROLES),
  chapter_id: stringToOptionalUuid,
});

export type ProfileAdminFormInput = z.input<typeof profileAdminFormSchema>;
export type ProfileAdminFormValues = z.output<typeof profileAdminFormSchema>;

/** What a user can edit on their own profile (no role/chapter changes — RLS blocks those). */
export const profileSelfFormSchema = z.object({
  display_name: z.string().trim().min(1, "Name is required").max(120),
});

export type ProfileSelfFormInput = z.input<typeof profileSelfFormSchema>;
export type ProfileSelfFormValues = z.output<typeof profileSelfFormSchema>;
