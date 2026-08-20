import { test, expect } from "@playwright/test"
import { randomUUID } from "node:crypto"

test("switching language preserves dashboard filters", async ({ page }) => {
  const email = `e2e-i18n-${randomUUID()}@example.com`

  await page.goto("/es/login")
  await page.fill("#email", email)
  await page.click("button:has-text('Entrar')")
  await page.waitForURL("**/dashboard")
  await page.waitForSelector("h1:has-text('Panel')")

  await page.goto("/es/dashboard?status=OFFER&q=acme")
  await page.waitForSelector("h1:has-text('Panel')")

  await page.locator("[role=group] button", { hasText: "EN" }).click()
  await page.waitForURL("**/en/dashboard**")

  const url = new URL(page.url())
  expect(url.searchParams.get("status")).toBe("OFFER")
  expect(url.searchParams.get("q")).toBe("acme")
})

test("landing page renders in both locales", async ({ page }) => {
  await page.goto("/es")
  await expect(page.locator("h1")).toContainText(
    "Dejá de perder el rastro de tus postulaciones"
  )

  await page.goto("/en")
  await expect(page.locator("h1")).toContainText(
    "Stop losing track of your job applications"
  )
})
