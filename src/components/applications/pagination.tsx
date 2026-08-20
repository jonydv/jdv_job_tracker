import { getTranslations } from "next-intl/server"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RawSearchParams } from "@/lib/validation/search-params"

function buildHref(raw: RawSearchParams, page: number) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(raw)) {
    if (key === "page" || value === undefined) continue
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry))
    } else {
      params.set(key, value)
    }
  }
  if (page > 1) params.set("page", String(page))
  const query = params.toString()
  return query ? `/dashboard?${query}` : "/dashboard"
}

export async function ApplicationsPagination({
  raw,
  page,
  pageCount,
}: {
  raw: RawSearchParams
  page: number
  pageCount: number
}) {
  if (pageCount <= 1) return null

  const t = await getTranslations("dashboard")

  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label={t("title")}
    >
      {page > 1 ? (
        <Link
          href={buildHref(raw, page - 1)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>
      )}

      <span className="text-muted-foreground text-sm">
        {page} / {pageCount}
      </span>

      {page < pageCount ? (
        <Link
          href={buildHref(raw, page + 1)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      )}
    </nav>
  )
}
