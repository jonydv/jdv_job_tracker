"use client"

import { useMemo } from "react"
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import { useTranslations, useLocale } from "next-intl"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusSelect } from "./status-select"
import { ApplicationRowActions } from "./application-row-actions"
import { PlatformIcon } from "@/components/platforms/platform-icon"
import { formatDateOnly } from "@/lib/dates"
import { formatSalary } from "@/lib/salary"
import { SortableHeader } from "./sortable-header"
import type { RawSearchParams } from "@/lib/validation/search-params"
import type { SortableField } from "@/lib/constants"
import type { ApplicationListItem, PlatformOption } from "@/types/application"

const features = tableFeatures({})
const columnHelper = createColumnHelper<typeof features, ApplicationListItem>()

export function ApplicationsTable({
  items,
  platforms,
  raw,
  sort,
  dir,
}: {
  items: ApplicationListItem[]
  platforms: PlatformOption[]
  raw: RawSearchParams
  sort: SortableField
  dir: "asc" | "desc"
}) {
  const t = useTranslations()
  const locale = useLocale()

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("companyName", {
          id: "companyName",
          header: () => (
            <SortableHeader
              field="companyName"
              label={t("dashboard.table.company")}
              raw={raw}
              currentSort={sort}
              currentDir={dir}
            />
          ),
          cell: (info) => (
            <div>
              <p className="font-medium">{info.getValue()}</p>
              {info.row.original.locationCity ? (
                <p className="text-muted-foreground text-xs">
                  {info.row.original.locationCity}
                </p>
              ) : null}
            </div>
          ),
        }),
        columnHelper.accessor("jobTitle", {
          id: "jobTitle",
          header: () => (
            <SortableHeader
              field="jobTitle"
              label={t("dashboard.table.role")}
              raw={raw}
              currentSort={sort}
              currentDir={dir}
            />
          ),
          cell: (info) => {
            const application = info.row.original
            const salary = formatSalary(application, locale, {
              HOURLY: t("enums.salaryPeriod.HOURLY"),
              MONTHLY: t("enums.salaryPeriod.MONTHLY"),
              YEARLY: t("enums.salaryPeriod.YEARLY"),
            })
            return (
              <div>
                <p>{info.getValue()}</p>
                {salary ? (
                  <p className="text-muted-foreground text-xs">{salary}</p>
                ) : null}
              </div>
            )
          },
        }),
        columnHelper.display({
          id: "platform",
          header: t("dashboard.table.platform"),
          cell: ({ row }) => {
            const platform = row.original.platform
            if (!platform) return "—"
            return (
              <span className="flex items-center gap-2">
                <PlatformIcon slug={platform.slug} name={platform.name} />
                {platform.name}
              </span>
            )
          },
        }),
        columnHelper.display({
          id: "location",
          header: t("dashboard.table.location"),
          cell: ({ row }) =>
            t(`enums.locationType.${row.original.locationType}`),
        }),
        columnHelper.display({
          id: "status",
          header: t("dashboard.table.status"),
          cell: ({ row }) => (
            <StatusSelect
              applicationId={row.original.id}
              status={row.original.status}
            />
          ),
        }),
        columnHelper.accessor("appliedAt", {
          id: "appliedAt",
          header: () => (
            <SortableHeader
              field="appliedAt"
              label={t("dashboard.table.appliedAt")}
              raw={raw}
              currentSort={sort}
              currentDir={dir}
            />
          ),
          cell: (info) => formatDateOnly(info.getValue(), locale),
        }),
        columnHelper.display({
          id: "stages",
          header: t("dashboard.table.stages"),
          cell: ({ row }) => {
            const stages = row.original.stages
            const completed = stages.filter((s) => s.completedAt).length
            return stages.length > 0 ? `${completed}/${stages.length}` : "—"
          },
        }),
        columnHelper.display({
          id: "actions",
          header: () => (
            <span className="sr-only">{t("dashboard.table.actions")}</span>
          ),
          cell: ({ row }) => (
            <div className="flex justify-end">
              <ApplicationRowActions
                application={row.original}
                platforms={platforms}
              />
            </div>
          ),
        }),
      ]),
    [t, locale, raw, sort, dir, platforms]
  )

  const table = useTable({
    features,
    columns,
    data: items,
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                <table.FlexRender header={header} />
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getAllCells().map((cell) => (
              <TableCell key={cell.id}>
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
