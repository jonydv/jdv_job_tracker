"use server"

import { revalidatePath } from "next/cache"
import { authedAction } from "./authed-action"
import {
  stageInputSchema,
  stageUpdateSchema,
  stageIdSchema,
} from "@/lib/validation/stage"
import * as stagesDal from "@/server/dal/stages"

const DASHBOARD_PATH = "/[locale]/(app)/dashboard"

export const addStage = authedAction(
  stageInputSchema,
  async (input, userId) => {
    const stage = await stagesDal.addStage(userId, input)
    revalidatePath(DASHBOARD_PATH, "page")
    return stage
  }
)

export const updateStage = authedAction(
  stageUpdateSchema,
  async (input, userId) => {
    const { id, ...data } = input
    const stage = await stagesDal.updateStage(userId, id, data)
    revalidatePath(DASHBOARD_PATH, "page")
    return stage
  }
)

export const deleteStage = authedAction(
  stageIdSchema,
  async (input, userId) => {
    await stagesDal.deleteStage(userId, input.id)
    revalidatePath(DASHBOARD_PATH, "page")
  }
)

export const toggleStageCompleted = authedAction(
  stageIdSchema,
  async (input, userId) => {
    const stage = await stagesDal.toggleStageCompleted(userId, input.id)
    revalidatePath(DASHBOARD_PATH, "page")
    return stage
  }
)
