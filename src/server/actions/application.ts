"use server"

import { revalidatePath } from "next/cache"
import { authedAction } from "./authed-action"
import {
  applicationInputSchema,
  applicationUpdateSchema,
  updateApplicationStatusSchema,
  deleteApplicationSchema,
  checkDuplicateApplicationSchema,
} from "@/lib/validation/application"
import * as applicationsDal from "@/server/dal/applications"
import { normalizeJobUrl } from "@/lib/url"

const DASHBOARD_PATH = "/[locale]/(app)/dashboard"

export const createApplication = authedAction(
  applicationInputSchema,
  async (input, userId) => {
    const application = await applicationsDal.createApplication(userId, input)
    revalidatePath(DASHBOARD_PATH, "page")
    return application
  }
)

export const updateApplication = authedAction(
  applicationUpdateSchema,
  async (input, userId) => {
    const { id, ...data } = input
    const application = await applicationsDal.updateApplication(
      userId,
      id,
      data
    )
    revalidatePath(DASHBOARD_PATH, "page")
    return application
  }
)

export const updateApplicationStatus = authedAction(
  updateApplicationStatusSchema,
  async (input, userId) => {
    const application = await applicationsDal.updateApplicationStatus(
      userId,
      input.id,
      input.status
    )
    revalidatePath(DASHBOARD_PATH, "page")
    return application
  }
)

export const deleteApplication = authedAction(
  deleteApplicationSchema,
  async (input, userId) => {
    await applicationsDal.deleteApplication(userId, input.id)
    revalidatePath(DASHBOARD_PATH, "page")
  }
)

export const checkApplicationDuplicate = authedAction(
  checkDuplicateApplicationSchema,
  async (input, userId) => {
    const jobUrlKey = input.jobUrl ? normalizeJobUrl(input.jobUrl) : null
    return applicationsDal.findRecentDuplicate(userId, {
      companyName: input.companyName,
      jobTitle: input.jobTitle,
      jobUrlKey,
    })
  }
)
