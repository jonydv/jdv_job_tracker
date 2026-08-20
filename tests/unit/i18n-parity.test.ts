import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const messagesDir = fileURLToPath(
  new URL("../../src/messages", import.meta.url)
)

const es = JSON.parse(readFileSync(`${messagesDir}/es.json`, "utf8"))
const en = JSON.parse(readFileSync(`${messagesDir}/en.json`, "utf8"))

function collectKeys(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) =>
      collectKeys(entry, `${prefix}[${index}]`)
    )
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([key, nested]) => collectKeys(nested, prefix ? `${prefix}.${key}` : key)
    )
  }

  return [prefix]
}

describe("i18n message parity", () => {
  it("es.json and en.json expose the exact same set of keys", () => {
    const esKeys = new Set(collectKeys(es))
    const enKeys = new Set(collectKeys(en))

    const missingInEn = [...esKeys].filter((key) => !enKeys.has(key))
    const missingInEs = [...enKeys].filter((key) => !esKeys.has(key))

    expect(
      missingInEn,
      "keys present in es.json but missing in en.json"
    ).toEqual([])
    expect(
      missingInEs,
      "keys present in en.json but missing in es.json"
    ).toEqual([])
  })

  it("has no empty string values in either locale", () => {
    const emptyEs = collectKeys(es).filter((key) => {
      const value = key
        .split(".")
        .reduce<unknown>(
          (acc, segment) => (acc as Record<string, unknown>)?.[segment],
          es
        )
      return value === ""
    })
    const emptyEn = collectKeys(en).filter((key) => {
      const value = key
        .split(".")
        .reduce<unknown>(
          (acc, segment) => (acc as Record<string, unknown>)?.[segment],
          en
        )
      return value === ""
    })

    expect(emptyEs).toEqual([])
    expect(emptyEn).toEqual([])
  })
})
