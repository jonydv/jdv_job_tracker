"use client"

import { useTranslations } from "next-intl"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("dashboard.error")

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-24 text-center">
      <AlertTriangle className="text-destructive size-8" aria-hidden="true" />
      <p className="font-medium">{t("title")}</p>
      <p className="text-muted-foreground text-sm">{t("description")}</p>
      <Button onClick={reset} variant="outline">
        {t("retry")}
      </Button>
    </div>
  )
}
