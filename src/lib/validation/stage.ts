import { z } from "zod"

export const stageTypeEnum = z.enum([
  "HR_SCREEN",
  "TECHNICAL_TEST",
  "TECH_INTERVIEW",
  "CULTURE_FIT",
  "MANAGEMENT",
  "OFFER_REVIEW",
  "OTHER",
])

export const stageInputSchema = z
  .object({
    applicationId: z.string().min(1),
    type: stageTypeEnum,
    title: z.string().trim().max(120).optional(),
    scheduledAt: z.date().optional(),
    feedback: z.string().trim().max(3000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "OTHER" && !data.title) {
      ctx.addIssue({
        code: "custom",
        path: ["title"],
        message: "validation.stage.titleRequired",
      })
    }
  })

export type StageInput = z.infer<typeof stageInputSchema>

export const stageUpdateSchema = z.object({
  id: z.string().min(1),
  type: stageTypeEnum,
  title: z.string().trim().max(120).optional(),
  scheduledAt: z.date().optional(),
  feedback: z.string().trim().max(3000).optional(),
})

export const stageIdSchema = z.object({
  id: z.string().min(1),
})
