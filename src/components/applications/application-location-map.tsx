"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Map, MapGeoJSON, useMap } from "@/components/ui/map"
import { Skeleton } from "@/components/ui/skeleton"
import { getCountryBoundaryAction } from "@/server/actions/geo"
import { getCountryName } from "@/lib/geo/country-name"
import type { CountryCode } from "@/lib/constants/country-codes"
import type { Feature, Geometry } from "geojson"

type Boundary = {
  feature: Feature<Geometry, { name: string }>
  bbox: [number, number, number, number]
}

function FitBounds({ bbox }: { bbox: [number, number, number, number] }) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!isLoaded || !map) return
    map.fitBounds(bbox, { padding: 24, duration: 0 })
  }, [isLoaded, map, bbox])

  return null
}

export function ApplicationLocationMap({
  countryCode,
}: {
  countryCode: CountryCode
}) {
  const t = useTranslations()
  const locale = useLocale()
  const [result, setResult] = useState<{
    code: CountryCode
    boundary: Boundary | null
  } | null>(null)

  useEffect(() => {
    let cancelled = false

    getCountryBoundaryAction({ isoAlpha2: countryCode }).then((response) => {
      if (cancelled) return
      setResult({ code: countryCode, boundary: response.ok ? response.data : null })
    })

    return () => {
      cancelled = true
    }
  }, [countryCode])

  const countryName = getCountryName(countryCode, locale)
  const caption = t("application.fields.locationCountryMapCaption", {
    country: countryName,
  })

  const isLoading = result?.code !== countryCode

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-md" />
  }

  const boundary = result.boundary
  if (!boundary) return null

  return (
    <div className="grid gap-1.5">
      <div
        aria-hidden="true"
        className="h-48 w-full overflow-hidden rounded-md border"
      >
        <Map blank className="h-full w-full">
          <MapGeoJSON
            data={boundary.feature}
            fillPaint={{ "fill-color": "#a93500", "fill-opacity": 0.55 }}
            linePaint={{ "line-color": "#a93500", "line-width": 1.5 }}
          />
          <FitBounds bbox={boundary.bbox} />
        </Map>
      </div>
      <p className="text-muted-foreground text-xs">{caption}</p>
    </div>
  )
}
