import { describe, expect, it } from "vitest"
import { parseApplicationSearchParams } from "@/lib/validation/search-params"

describe("parseApplicationSearchParams", () => {
  it("falls back to safe defaults when given no params", () => {
    const result = parseApplicationSearchParams({})
    expect(result).toMatchObject({
      q: "",
      status: [],
      platform: [],
      sort: "appliedAt",
      dir: "desc",
      page: 1,
      per: 25,
    })
  })

  it("parses a comma-separated status filter", () => {
    const result = parseApplicationSearchParams({
      status: "APPLIED,INTERVIEWING",
    })
    expect(result.status).toEqual(["APPLIED", "INTERVIEWING"])
  })

  it("resets an invalid status filter to empty instead of throwing", () => {
    const result = parseApplicationSearchParams({ status: "NOT_A_STATUS" })
    expect(result.status).toEqual([])
  })

  it("rejects an unknown sort field, falling back to appliedAt", () => {
    const result = parseApplicationSearchParams({ sort: "password" })
    expect(result.sort).toBe("appliedAt")
  })

  it("clamps per to the allowed set of page sizes", () => {
    const result = parseApplicationSearchParams({ per: "999" })
    expect(result.per).toBe(25)
  })

  it("accepts a valid per value", () => {
    const result = parseApplicationSearchParams({ per: "50" })
    expect(result.per).toBe(50)
  })

  it("rejects a page below 1", () => {
    const result = parseApplicationSearchParams({ page: "0" })
    expect(result.page).toBe(1)
  })

  it("takes the first value when a param is duplicated", () => {
    const result = parseApplicationSearchParams({ q: ["react", "vue"] })
    expect(result.q).toBe("react")
  })
})
