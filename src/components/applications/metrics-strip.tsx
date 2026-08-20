import { getLocale, getTranslations } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardMetrics } from "@/server/dal/metrics"

export async function MetricsStrip({ userId }: { userId: string }) {
  const [metrics, t, locale] = await Promise.all([
    getDashboardMetrics(userId),
    getTranslations("dashboard.metrics"),
    getLocale(),
  ])

  const percentFormatter = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  })

  const items = [
    { label: t("active"), value: String(metrics.active) },
    {
      label: t("responseRate"),
      value: percentFormatter.format(metrics.responseRate),
    },
    {
      label: t("avgDaysToFirstResponse"),
      value:
        metrics.avgDaysToFirstResponse === null
          ? "—"
          : metrics.avgDaysToFirstResponse.toFixed(1),
    },
    { label: t("interviewing"), value: String(metrics.interviewing) },
  ]

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
