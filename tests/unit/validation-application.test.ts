import { describe, expect, it } from "vitest"
import { applicationInputSchema } from "@/lib/validation/application"

function baseInput(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    platformId: null,
    companyName: "Acme",
    jobTitle: "Engineer",
    locationType: "REMOTE",
    status: "APPLIED",
    appliedAt: new Date("2026-01-01"),
    ...overrides,
  }
}

describe("applicationInputSchema", () => {
  it("accepts a minimal valid remote application", () => {
    const result = applicationInputSchema.safeParse(baseInput())
    expect(result.success).toBe(true)
  })

  it("rejects salaryMax lower than salaryMin", () => {
    const result = applicationInputSchema.safeParse(
      baseInput({ salaryMin: 5000, salaryMax: 3000, salaryCurrency: "USD" })
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.path.includes("salaryMax")
      )
      expect(issue?.message).toBe(
        "validation.application.salaryMaxLowerThanMin"
      )
    }
  })

  it("requires salaryCurrency when a salary amount is set", () => {
    const result = applicationInputSchema.safeParse(
      baseInput({ salaryMin: 5000 })
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.path.includes("salaryCurrency")
      )
      expect(issue?.message).toBe(
        "validation.application.salaryCurrencyRequired"
      )
    }
  })

  it("requires locationCity when locationType is not REMOTE", () => {
    const result = applicationInputSchema.safeParse(
      baseInput({ locationType: "HYBRID" })
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.path.includes("locationCity")
      )
      expect(issue?.message).toBe("validation.application.locationCityRequired")
    }
  })

  it("accepts HYBRID with a locationCity", () => {
    const result = applicationInputSchema.safeParse(
      baseInput({ locationType: "HYBRID", locationCity: "Buenos Aires" })
    )
    expect(result.success).toBe(true)
  })

  it("rejects an appliedAt date in the future", () => {
    const future = new Date()
    future.setDate(future.getDate() + 5)
    const result = applicationInputSchema.safeParse(
      baseInput({ appliedAt: future })
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.path.includes("appliedAt")
      )
      expect(issue?.message).toBe("validation.application.appliedAtFuture")
    }
  })

  it("rejects an appliedAt date older than 5 years", () => {
    const old = new Date()
    old.setFullYear(old.getFullYear() - 6)
    const result = applicationInputSchema.safeParse(
      baseInput({ appliedAt: old })
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.path.includes("appliedAt")
      )
      expect(issue?.message).toBe("validation.application.appliedAtTooOld")
    }
  })

  it("rejects a jobUrl that isn't http/https", () => {
    const result = applicationInputSchema.safeParse(
      baseInput({ jobUrl: "javascript:alert(1)" })
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes("jobUrl"))
      expect(issue?.message).toBe("validation.application.jobUrlInvalid")
    }
  })

  it("accepts a valid https jobUrl", () => {
    const result = applicationInputSchema.safeParse(
      baseInput({ jobUrl: "https://example.com/jobs/1" })
    )
    expect(result.success).toBe(true)
  })

  it("accepts a REMOTE application with locationCountry set", () => {
    const result = applicationInputSchema.safeParse(
      baseInput({ locationType: "REMOTE", locationCountry: "CA" })
    )
    expect(result.success).toBe(true)
  })

  it("rejects an unknown locationCountry code", () => {
    const result = applicationInputSchema.safeParse(
      baseInput({ locationCountry: "ZZ" })
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.path.includes("locationCountry")
      )
      expect(issue).toBeDefined()
    }
  })
})
