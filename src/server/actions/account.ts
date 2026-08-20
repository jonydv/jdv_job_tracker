"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { authedAction } from "./authed-action"
import {
  updateProfileSchema,
  updateLocaleSchema,
  deleteAccountSchema,
} from "@/lib/validation/account"
import * as accountDal from "@/server/dal/account"
import { auth, signOut } from "@/server/auth"
import { KnownActionError } from "@/server/errors"

export const updateProfile = authedAction(
  updateProfileSchema,
  async (input, userId) => {
    await accountDal.updateProfileName(userId, input.name)
    revalidatePath("/[locale]/(app)/dashboard/settings", "page")
  }
)

export const updateLocale = authedAction(
  updateLocaleSchema,
  async (input, userId) => {
    await accountDal.updateUserLocale(userId, input.locale)
    const cookieStore = await cookies()
    cookieStore.set("NEXT_LOCALE", input.locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    })
  }
)

export const deleteAccount = authedAction(
  deleteAccountSchema,
  async (input, userId) => {
    const session = await auth()
    const sessionEmail = session?.user?.email?.toLowerCase()

    if (!sessionEmail || input.email.trim().toLowerCase() !== sessionEmail) {
      throw new KnownActionError("validation.account.emailMismatch")
    }

    await accountDal.deleteUserAccount(userId)
  }
)

export async function signOutAfterAccountDeletion() {
  await signOut({ redirectTo: "/" })
}
