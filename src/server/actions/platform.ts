"use server"

import { revalidatePath } from "next/cache"
import { authedAction } from "./authed-action"
import { platformInputSchema } from "@/lib/validation/platform"
import * as platformsDal from "@/server/dal/platforms"

export const createPlatform = authedAction(
  platformInputSchema,
  async (input, userId) => {
    const platform = await platformsDal.createPlatform(userId, input)
    revalidatePath("/[locale]/(app)/dashboard", "page")
    return platform
  }
)
