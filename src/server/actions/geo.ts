"use server"

import { z } from "zod"
import { authedAction } from "./authed-action"
import { COUNTRY_CODES } from "@/lib/constants/country-codes"
import { getCountryBoundary } from "@/lib/geo/country-boundary"

const getCountryBoundarySchema = z.object({
  isoAlpha2: z.enum(COUNTRY_CODES),
})

export const getCountryBoundaryAction = authedAction(
  getCountryBoundarySchema,
  async (input) => getCountryBoundary(input.isoAlpha2)
)
