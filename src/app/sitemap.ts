import type { MetadataRoute } from "next"
import { routing } from "@/i18n/routing"
import { env } from "@/lib/env"

const publicPaths = ["", "/legal/privacidad", "/legal/terminos"]

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: `${env.NEXT_PUBLIC_APP_URL}/${routing.defaultLocale}${path}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [
          locale,
          `${env.NEXT_PUBLIC_APP_URL}/${locale}${path}`,
        ])
      ),
    },
  }))
}
