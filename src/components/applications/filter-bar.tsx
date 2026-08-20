"use client"

import { useTransition } from "react"
import { useTranslations } from "next-intl"
import {
  parseAsString,
  parseAsArrayOf,
  parseAsStringEnum,
  parseAsIsoDate,
  parseAsInteger,
  useQueryStates,
} from "nuqs"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FilterMultiSelect } from "./filter-multi-select"
import { PlatformIcon } from "@/components/platforms/platform-icon"
import type { PlatformOption } from "@/types/application"
import { APPLICATION_STATUSES, LOCATION_TYPES } from "@/lib/constants"

const filterParsers = {
  q: parseAsString.withDefault(""),
  status: parseAsArrayOf(
    parseAsStringEnum([...APPLICATION_STATUSES]),
    ","
  ).withDefault([]),
  platform: parseAsArrayOf(parseAsString, ",").withDefault([]),
  location: parseAsStringEnum([...LOCATION_TYPES]),
  from: parseAsIsoDate,
  to: parseAsIsoDate,
  page: parseAsInteger,
}

export function FilterBar({ platforms }: { platforms: PlatformOption[] }) {
  const t = useTranslations()
  const [isPending, startTransition] = useTransition()
  const [filters, setFilters] = useQueryStates(filterParsers, {
    shallow: false,
    startTransition,
    limitUrlUpdates: { method: "debounce", timeMs: 300 },
  })

  const hasActiveFilters =
    filters.q ||
    filters.status.length > 0 ||
    filters.platform.length > 0 ||
    filters.location ||
    filters.from ||
    filters.to

  function updateAndResetPage(update: Partial<typeof filters>) {
    setFilters({ ...update, page: null })
  }

  return (
    <div className="flex flex-wrap items-center gap-2" aria-busy={isPending}>
      <Input
        value={filters.q}
        onChange={(event) => updateAndResetPage({ q: event.target.value })}
        placeholder={t("dashboard.searchPlaceholder")}
        className="w-full sm:w-64"
        aria-label={t("common.search")}
      />

      <FilterMultiSelect
        label={t("dashboard.filters.status")}
        allLabel={t("dashboard.filters.allStatuses")}
        selected={filters.status}
        onChange={(values) =>
          updateAndResetPage({
            status: values as (typeof APPLICATION_STATUSES)[number][],
          })
        }
        options={APPLICATION_STATUSES.map((status) => ({
          value: status,
          label: t(`enums.status.${status}`),
        }))}
      />

      <FilterMultiSelect
        label={t("dashboard.filters.platform")}
        allLabel={t("dashboard.filters.allPlatforms")}
        selected={filters.platform}
        onChange={(values) => updateAndResetPage({ platform: values })}
        options={platforms.map((platform) => ({
          value: platform.id,
          label: platform.name,
          icon: <PlatformIcon slug={platform.slug} name={platform.name} />,
        }))}
      />

      <Select
        value={filters.location ?? "ALL"}
        onValueChange={(value) =>
          updateAndResetPage({
            location:
              value === "ALL"
                ? null
                : (value as (typeof LOCATION_TYPES)[number]),
          })
        }
      >
        <SelectTrigger
          size="sm"
          className="w-auto"
          aria-label={t("dashboard.filters.location")}
        >
          <SelectValue placeholder={t("dashboard.filters.allLocations")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">
            {t("dashboard.filters.allLocations")}
          </SelectItem>
          {LOCATION_TYPES.map((location) => (
            <SelectItem key={location} value={location}>
              {t(`enums.locationType.${location}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1">
        <Input
          type="date"
          aria-label={t("dashboard.filters.from")}
          value={filters.from ? filters.from.toISOString().slice(0, 10) : ""}
          onChange={(event) =>
            updateAndResetPage({
              from: event.target.value ? new Date(event.target.value) : null,
            })
          }
          className="w-36"
        />
        <span className="text-muted-foreground text-xs">–</span>
        <Input
          type="date"
          aria-label={t("dashboard.filters.to")}
          value={filters.to ? filters.to.toISOString().slice(0, 10) : ""}
          onChange={(event) =>
            updateAndResetPage({
              to: event.target.value ? new Date(event.target.value) : null,
            })
          }
          className="w-36"
        />
      </div>

      {hasActiveFilters ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setFilters({
              q: "",
              status: [],
              platform: [],
              location: null,
              from: null,
              to: null,
              page: null,
            })
          }
        >
          <X className="size-3.5" aria-hidden="true" />
          {t("common.clearFilters")}
        </Button>
      ) : null}
    </div>
  )
}
