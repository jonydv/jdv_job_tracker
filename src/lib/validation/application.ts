import { z } from "zod"
import { isValidHttpUrl } from "@/lib/url"
import { isFutureDate, yearsAgo } from "@/lib/dates"
import { CURRENCY_CODES } from "@/lib/constants"
import { COUNTRY_CODES } from "@/lib/constants/country-codes"

export const applicationStatusEnum = z.enum([
  "APPLIED",
  "SCREENING",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
])

export const locationTypeEnum = z.enum(["REMOTE", "HYBRID", "ONSITE"])

export const salaryPeriodEnum = z.enum(["HOURLY", "MONTHLY", "YEARLY"])

export const applicationInputSchema = z
  .object({
    platformId: z.string().min(1).nullable(),
    companyName: z
      .string()
      .trim()
      .min(1, "validation.application.companyRequired")
      .max(120, "validation.application.companyTooLong"),
    jobTitle: z
      .string()
      .trim()
      .min(1, "validation.application.jobTitleRequired")
      .max(160, "validation.application.jobTitleTooLong"),
    jobUrl: z
      .string()
      .trim()
      .max(2048)
      .optional()
      .refine(
        (value) => !value || isValidHttpUrl(value),
        "validation.application.jobUrlInvalid"
      ),
    salaryMin: z
      .number({ message: "validation.application.salaryInvalid" })
      .int()
      .positive()
      .optional(),
    salaryMax: z
      .number({ message: "validation.application.salaryInvalid" })
      .int()
      .positive()
      .optional(),
    salaryCurrency: z.enum(CURRENCY_CODES).optional(),
    salaryPeriod: salaryPeriodEnum.optional(),
    locationType: locationTypeEnum,
    locationCity: z.string().trim().max(120).optional(),
    locationCountry: z.enum(COUNTRY_CODES).optional(),
    status: applicationStatusEnum,
    appliedAt: z.date({
      message: "validation.application.appliedAtInvalid",
    }),
    notes: z.string().trim().max(5000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.salaryMin && data.salaryMax && data.salaryMax < data.salaryMin) {
      ctx.addIssue({
        code: "custom",
        path: ["salaryMax"],
        message: "validation.application.salaryMaxLowerThanMin",
      })
    }

    if ((data.salaryMin || data.salaryMax) && !data.salaryCurrency) {
      ctx.addIssue({
        code: "custom",
        path: ["salaryCurrency"],
        message: "validation.application.salaryCurrencyRequired",
      })
    }

    if (data.locationType !== "REMOTE" && !data.locationCity) {
      ctx.addIssue({
        code: "custom",
        path: ["locationCity"],
        message: "validation.application.locationCityRequired",
      })
    }

    if (isFutureDate(data.appliedAt)) {
      ctx.addIssue({
        code: "custom",
        path: ["appliedAt"],
        message: "validation.application.appliedAtFuture",
      })
    }

    if (data.appliedAt < yearsAgo(5)) {
      ctx.addIssue({
        code: "custom",
        path: ["appliedAt"],
        message: "validation.application.appliedAtTooOld",
      })
    }
  })

export type ApplicationInput = z.infer<typeof applicationInputSchema>

export const applicationUpdateSchema = applicationInputSchema.and(
  z.object({ id: z.string().min(1) })
)

export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>

export const updateApplicationStatusSchema = z.object({
  id: z.string().min(1),
  status: applicationStatusEnum,
})

export const deleteApplicationSchema = z.object({
  id: z.string().min(1),
})

export const checkDuplicateApplicationSchema = z.object({
  companyName: z.string().trim().min(1),
  jobTitle: z.string().trim().min(1),
  jobUrl: z.string().trim().optional(),
})
