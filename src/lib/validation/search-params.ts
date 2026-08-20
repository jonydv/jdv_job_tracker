import { z } from "zod"
import { applicationStatusEnum, locationTypeEnum } from "./application"
import { PER_PAGE_VALUES, SORTABLE_FIELDS } from "@/lib/constants"

function splitCsv(value: string | undefined): string[] {
  return value
    ? value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
    : []
}

export const searchParamsSchema = z.object({
  q: z.string().trim().max(200).catch(""),
  status: z
    .string()
    .optional()
    .transform(splitCsv)
    .pipe(z.array(applicationStatusEnum))
    .catch([]),
  platform: z.string().optional().transform(splitCsv).catch([]),
  location: locationTypeEnum.optional().catch(undefined),
  from: z.coerce.date().optional().catch(undefined),
  to: z.coerce.date().optional().catch(undefined),
  sort: z.enum(SORTABLE_FIELDS).catch("appliedAt"),
  dir: z.enum(["asc", "desc"]).catch("desc"),
  page: z.coerce.number().int().min(1).catch(1),
  per: z.coerce
    .number()
    .int()
    .catch(25)
    .transform((value) =>
      (PER_PAGE_VALUES as readonly number[]).includes(value) ? value : 25
    ),
})

export type ApplicationSearchParams = z.infer<typeof searchParamsSchema>

export type RawSearchParams = Record<string, string | string[] | undefined>

export function parseApplicationSearchParams(raw: RawSearchParams) {
  const flat = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ])
  )
  return searchParamsSchema.parse(flat)
}
