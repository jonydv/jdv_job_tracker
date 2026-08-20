import createMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"
import { auth } from "@/server/auth"
import { routing } from "@/i18n/routing"

const handleI18nRouting = createMiddleware(routing)

const protectedSegments = ["dashboard"]

export const proxy = auth((req) => {
  if (!req.cookies.get("NEXT_LOCALE") && req.auth?.user?.locale) {
    req.cookies.set("NEXT_LOCALE", req.auth.user.locale)
  }

  const response = handleI18nRouting(req)

  const segments = req.nextUrl.pathname.split("/").filter(Boolean)
  const [, ...rest] = segments
  const pathnameWithoutLocale = "/" + rest.join("/")
  const isProtected = protectedSegments.some(
    (segment) =>
      pathnameWithoutLocale === `/${segment}` ||
      pathnameWithoutLocale.startsWith(`/${segment}/`)
  )

  if (isProtected && !req.auth) {
    const locale = segments[0] ?? routing.defaultLocale
    const loginUrl = new URL(`/${locale}/login`, req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
})

export const config = {
  matcher: "/((?!api|_next|_vercel|icon|apple-icon|.*\\..*).*)",
}
