"use client"

import { useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing, type AppLocale } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { updateLocale } from "@/server/actions/account"

export function SettingsLanguageSection() {
  const t = useTranslations("settings.language")
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function switchTo(next: AppLocale) {
    if (next === locale || isPending) return
    startTransition(async () => {
      await updateLocale({ locale: next })
      router.replace(pathname, { locale: next })
    })
  }

  return (
    <section>
      <h2 className="mb-1 font-medium">{t("title")}</h2>
      <p className="text-muted-foreground mb-2 text-sm">{t("description")}</p>
      <div className="flex gap-2">
        {routing.locales.map((value) => (
          <Button
            key={value}
            type="button"
            variant={value === locale ? "default" : "outline"}
            disabled={isPending}
            onClick={() => switchTo(value)}
          >
            {value.toUpperCase()}
          </Button>
        ))}
      </div>
    </section>
  )
}
