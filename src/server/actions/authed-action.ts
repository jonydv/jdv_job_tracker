import { z } from "zod"
import { auth } from "@/server/auth"
import { KnownActionError } from "@/server/errors"

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; errorKey: string; fieldErrors?: Record<string, string[]> }

export function authedAction<Schema extends z.ZodTypeAny, T>(
  schema: Schema,
  handler: (input: z.infer<Schema>, userId: string) => Promise<T>
) {
  return async (rawInput: z.infer<Schema>): Promise<ActionResult<T>> => {
    const session = await auth()
    if (!session?.user?.id) {
      return { ok: false, errorKey: "errors.unauthorized" }
    }

    const parsed = schema.safeParse(rawInput)
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".") || "_root"
        fieldErrors[path] ??= []
        fieldErrors[path].push(issue.message)
      }
      return { ok: false, errorKey: "errors.validation", fieldErrors }
    }

    try {
      const data = await handler(parsed.data, session.user.id)
      return { ok: true, data }
    } catch (error) {
      if (error instanceof KnownActionError) {
        return { ok: false, errorKey: error.key }
      }
      console.error(error)
      return { ok: false, errorKey: "errors.unexpected" }
    }
  }
}
