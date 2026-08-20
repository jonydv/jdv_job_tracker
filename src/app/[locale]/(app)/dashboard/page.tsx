import { Download } from "lucide-react"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { auth } from "@/server/auth"
import { listApplications } from "@/server/dal/applications"
import { listPlatformsForUser } from "@/server/dal/platforms"
import { parseApplicationSearchParams } from "@/lib/validation/search-params"
import { Button } from "@/components/ui/button"
import { FilterBar } from "@/components/applications/filter-bar"
import { CreateApplicationButton } from "@/components/applications/create-application-button"
import { ApplicationsTable } from "@/components/applications/applications-table"
import { ApplicationsCards } from "@/components/applications/applications-cards"
import { ApplicationsPagination } from "@/components/applications/pagination"
import { EmptyState } from "@/components/applications/empty-state"
import { MetricsStrip } from "@/components/applications/metrics-strip"

export default async function DashboardPage({
  params,
  searchParams,
}: PageProps<"/[locale]/dashboard">) {
  const { locale } = await params
  const rawSearchParams = await searchParams
  setRequestLocale(locale)

  const session = await auth()
  const userId = session!.user.id

  const filters = parseApplicationSearchParams(rawSearchParams)
  const [{ items, total, pageCount }, platforms] = await Promise.all([
    listApplications(userId, filters),
    listPlatformsForUser(userId),
  ])

  const t = await getTranslations()
  const hasAnyFilter =
    filters.q ||
    filters.status.length > 0 ||
    filters.platform.length > 0 ||
    filters.location ||
    filters.from ||
    filters.to

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>
          <CreateApplicationButton platforms={platforms} />
        </div>
        <div className="flex justify-end">
          <Button asChild variant="outline" size="sm">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page route */}
            <a href="/api/export?format=csv">
              <Download className="size-4" aria-hidden="true" />
              {t("dashboard.exportCsv")}
            </a>
          </Button>
        </div>
      </div>

      {total === 0 && !hasAnyFilter ? null : <MetricsStrip userId={userId} />}

      <div className="mb-6">
        <FilterBar platforms={platforms} />
      </div>

      {total === 0 && !hasAnyFilter ? (
        <EmptyState
          title={t("dashboard.empty.title")}
          description={t("dashboard.empty.description")}
          action={<CreateApplicationButton platforms={platforms} />}
        />
      ) : total === 0 ? (
        <EmptyState
          title={t("dashboard.emptyFiltered.title")}
          description={t("dashboard.emptyFiltered.description")}
        />
      ) : (
        <>
          <div className="hidden md:block" data-testid="applications-table">
            <ApplicationsTable
              items={items}
              platforms={platforms}
              raw={rawSearchParams}
              sort={filters.sort}
              dir={filters.dir}
            />
          </div>
          <div className="md:hidden">
            <ApplicationsCards items={items} platforms={platforms} />
          </div>
          <div className="mt-6">
            <ApplicationsPagination
              raw={rawSearchParams}
              page={filters.page}
              pageCount={pageCount}
            />
          </div>
        </>
      )}
    </div>
  )
}
