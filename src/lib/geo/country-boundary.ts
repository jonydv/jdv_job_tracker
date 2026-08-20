import "server-only"
import countries from "./data/countries-110m.json"
import type { Feature, FeatureCollection, Geometry, Position } from "geojson"

type CountryProperties = {
  ISO_A2_EH?: string
  ISO_A2?: string
  NAME?: string
}

const collection = countries as unknown as FeatureCollection<
  Geometry,
  CountryProperties
>

type CountryBoundary = {
  feature: Feature<Geometry, { name: string }>
  bbox: [number, number, number, number]
}

function resolveCode(properties: CountryProperties): string | null {
  const code = [properties.ISO_A2_EH, properties.ISO_A2].find(
    (value) => value && value !== "-99"
  )
  return code ?? null
}

function extendBbox(
  bbox: [number, number, number, number],
  [lng, lat]: Position
) {
  bbox[0] = Math.min(bbox[0], lng)
  bbox[1] = Math.min(bbox[1], lat)
  bbox[2] = Math.max(bbox[2], lng)
  bbox[3] = Math.max(bbox[3], lat)
}

function computeBbox(geometry: Geometry): [number, number, number, number] {
  const bbox: [number, number, number, number] = [
    Infinity,
    Infinity,
    -Infinity,
    -Infinity,
  ]

  function walk(coordinates: unknown): void {
    if (!Array.isArray(coordinates)) return
    if (typeof coordinates[0] === "number") {
      extendBbox(bbox, coordinates as Position)
      return
    }
    for (const child of coordinates) walk(child)
  }

  if (geometry.type !== "GeometryCollection") {
    walk(geometry.coordinates)
  }

  return bbox
}

let cache: Map<string, CountryBoundary | null> | null = null

function getIndex() {
  if (cache) return cache

  cache = new Map()
  for (const feature of collection.features) {
    const code = resolveCode(feature.properties)
    if (!code || cache.has(code)) continue

    cache.set(code, {
      feature: {
        type: "Feature",
        geometry: feature.geometry,
        properties: { name: feature.properties.NAME ?? code },
      },
      bbox: computeBbox(feature.geometry),
    })
  }

  return cache
}

export function getCountryBoundary(
  isoAlpha2: string
): CountryBoundary | null {
  return getIndex().get(isoAlpha2) ?? null
}
