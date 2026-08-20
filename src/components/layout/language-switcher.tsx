"use client"

import { useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing, type AppLocale } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LanguageSwitcher() {
  const t = useTranslations("nav")
  const locale = useLocale()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function switchTo(nextLocale: AppLocale) {
    if (nextLocale === locale || isPending) return

    const query = searchParams.toString()
    const href = query ? `${pathname}?${query}` : pathname

    startTransition(() => {
      router.replace(href, { locale: nextLocale })
    })
  }

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="inline-flex items-center gap-1 rounded-full border p-0.5"
    >
      {routing.locales.map((value) => (
        <Button
          key={value}
          type="button"
          size="sm"
          variant="ghost"
          aria-pressed={value === locale}
          disabled={isPending}
          onClick={() => switchTo(value)}
          className={cn(
            "h-7 rounded-full px-2.5 text-xs font-medium uppercase",
            value === locale && "bg-secondary text-secondary-foreground"
          )}
        >
          {value}
        </Button>
      ))}
    </div>
  )
}
