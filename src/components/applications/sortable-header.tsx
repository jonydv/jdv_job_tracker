import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { Link } from "@/i18n/navigation"
import type { RawSearchParams } from "@/lib/validation/search-params"
import type { SortableField } from "@/lib/constants"

function buildSortHref(
  raw: RawSearchParams,
  field: SortableField,
  nextDir: "asc" | "desc"
) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(raw)) {
    if (
      key === "sort" ||
      key === "dir" ||
      key === "page" ||
      value === undefined
    )
      continue
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry))
    } else {
      params.set(key, value)
    }
  }
  params.set("sort", field)
  params.set("dir", nextDir)
  return `/dashboard?${params.toString()}`
}

export function SortableHeader({
  field,
  label,
  raw,
  currentSort,
  currentDir,
}: {
  field: SortableField
  label: string
  raw: RawSearchParams
  currentSort: SortableField
  currentDir: "asc" | "desc"
}) {
  const isActive = currentSort === field
  const nextDir = isActive && currentDir === "asc" ? "desc" : "asc"
  const Icon = !isActive
    ? ArrowUpDown
    : currentDir === "asc"
      ? ArrowUp
      : ArrowDown

  return (
    <Link
      href={buildSortHref(raw, field, nextDir)}
      className="hover:text-foreground inline-flex items-center gap-1 font-medium"
    >
      {label}
      <Icon className="size-3.5 opacity-70" aria-hidden="true" />
    </Link>
  )
}
