import { getLocale, getTranslations } from "next-intl/server"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "./status-badge"
import { ApplicationRowActions } from "./application-row-actions"
import { PlatformIcon } from "@/components/platforms/platform-icon"
import { formatDateOnly } from "@/lib/dates"
import { formatSalary } from "@/lib/salary"
import type { ApplicationListItem, PlatformOption } from "@/types/application"

export async function ApplicationsCards({
  items,
  platforms,
}: {
  items: ApplicationListItem[]
  platforms: PlatformOption[]
}) {
  const locale = await getLocale()
  const t = await getTranslations()

  return (
    <div className="flex flex-col gap-3">
      {items.map((application) => {
        const salary = formatSalary(application, locale, {
          HOURLY: t("enums.salaryPeriod.HOURLY"),
          MONTHLY: t("enums.salaryPeriod.MONTHLY"),
          YEARLY: t("enums.salaryPeriod.YEARLY"),
        })

        return (
          <Card key={application.id}>
            <CardContent className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {application.companyName}
                </p>
                <p className="text-muted-foreground truncate text-sm">
                  {application.jobTitle}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    status={application.status}
                    label={t(`enums.status.${application.status}`)}
                  />
                  {application.platform ? (
                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      <PlatformIcon
                        slug={application.platform.slug}
                        name={application.platform.name}
                      />
                      {application.platform.name}
                    </span>
                  ) : null}
                  <span className="text-muted-foreground text-xs">
                    {formatDateOnly(application.appliedAt, locale)}
                  </span>
                </div>
                {salary ? (
                  <p className="text-muted-foreground mt-1 text-xs">{salary}</p>
                ) : null}
              </div>
              <ApplicationRowActions
                application={application}
                platforms={platforms}
              />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
