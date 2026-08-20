import { z } from "zod"
import { isValidHttpUrl } from "@/lib/url"

export const platformInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "validation.platform.nameTooShort")
    .max(40, "validation.platform.nameTooLong"),
  baseUrl: z
    .string()
    .trim()
    .max(2048)
    .optional()
    .refine(
      (value) => !value || isValidHttpUrl(value),
      "validation.platform.baseUrlInvalid"
    ),
})

export type PlatformInput = z.infer<typeof platformInputSchema>

export function slugifyPlatformName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60)
}
