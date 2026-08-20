import { z } from "zod"
import { routing } from "@/i18n/routing"

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "validation.account.nameRequired").max(120),
})

export const updateLocaleSchema = z.object({
  locale: z.enum(routing.locales),
})

export const exportUserDataSchema = z.object({
  format: z.enum(["json", "csv"]),
})

export const deleteAccountSchema = z.object({
  email: z.string().trim().min(1, "validation.account.emailRequired"),
})
