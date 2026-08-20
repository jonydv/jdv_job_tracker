"use client"

import type { ReactNode } from "react"
import { useLocale, useTranslations } from "next-intl"
import { ExternalLink } from "lucide-react"
import { ResponsiveDialog } from "@/components/layout/responsive-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { StatusBadge } from "./status-badge"
import { PlatformIcon } from "@/components/platforms/platform-icon"
import { ApplicationLocationMap } from "./application-location-map"
import { formatDateOnly, formatDateTime } from "@/lib/dates"
import { formatSalary } from "@/lib/salary"
import type { ApplicationListItem } from "@/types/application"
import type { CountryCode } from "@/lib/constants/country-codes"

function DetailField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-0.5">
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  )
}

export function ApplicationDetailDialog({
  open,
  onOpenChange,
  application,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: ApplicationListItem
}) {
  const t = useTranslations()
  const locale = useLocale()

  const salary = formatSalary(application, locale, {
    HOURLY: t("enums.salaryPeriod.HOURLY"),
    MONTHLY: t("enums.salaryPeriod.MONTHLY"),
    YEARLY: t("enums.salaryPeriod.YEARLY"),
  })

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("application.viewTitle")}
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-lg font-semibold">{application.companyName}</p>
          <p className="text-muted-foreground">{application.jobTitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            status={application.status}
            label={t(`enums.status.${application.status}`)}
          />
          {application.platform ? (
            <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <PlatformIcon
                slug={application.platform.slug}
                name={application.platform.name}
              />
              {application.platform.name}
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DetailField label={t("application.fields.locationType")}>
            {t(`enums.locationType.${application.locationType}`)}
          </DetailField>
          {application.locationCity ? (
            <DetailField label={t("application.fields.locationCity")}>
              {application.locationCity}
            </DetailField>
          ) : null}
          {salary ? (
            <DetailField label={t("application.fields.salary")}>
              {salary}
            </DetailField>
          ) : null}
          <DetailField label={t("application.fields.appliedAt")}>
            {formatDateOnly(application.appliedAt, locale)}
          </DetailField>
        </div>

        {application.jobUrl ? (
          <DetailField label={t("application.fields.jobUrl")}>
            <a
              href={application.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary inline-flex items-center gap-1 break-all hover:underline"
            >
              {application.jobUrl}
              <ExternalLink
                className="size-3.5 shrink-0"
                aria-hidden="true"
              />
            </a>
          </DetailField>
        ) : null}

        {application.locationCountry ? (
          <ApplicationLocationMap
            countryCode={application.locationCountry as CountryCode}
          />
        ) : null}

        {application.notes ? (
          <DetailField label={t("application.fields.notes")}>
            <p className="whitespace-pre-wrap">{application.notes}</p>
          </DetailField>
        ) : null}

        <div className="border-t pt-4">
          <p className="mb-2 text-sm font-medium">{t("stage.title")}</p>
          {application.stages.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("stage.empty")}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {application.stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-start gap-2 rounded-md border p-3"
                >
                  <Checkbox
                    checked={Boolean(stage.completedAt)}
                    disabled
                    className="mt-0.5"
                  />
                  <div className="text-sm">
                    <p>
                      <span className="font-medium">
                        {t(`enums.stageType.${stage.type}`)}
                      </span>
                      {stage.title ? (
                        <span className="text-muted-foreground">
                          {" "}
                          — {stage.title}
                        </span>
                      ) : null}
                    </p>
                    {stage.scheduledAt ? (
                      <p className="text-muted-foreground text-xs">
                        {formatDateTime(stage.scheduledAt, locale)}
                      </p>
                    ) : null}
                    {stage.feedback ? (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {stage.feedback}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ResponsiveDialog>
  )
}
