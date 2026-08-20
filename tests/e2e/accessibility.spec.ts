import { test, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { randomUUID } from "node:crypto"

const seriousOrWorse = ["serious", "critical"]

async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze()
  const relevant = results.violations.filter((violation) =>
    seriousOrWorse.includes(violation.impact ?? "")
  )
  expect(relevant, JSON.stringify(relevant, null, 2)).toEqual([])
}

test("landing page has no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/es")
  await page.waitForSelector("h1")
  await expectNoSeriousViolations(page)
})

test("login page has no serious accessibility violations", async ({ page }) => {
  await page.goto("/es/login")
  await page.waitForSelector("#email")
  await expectNoSeriousViolations(page)
})

test("dashboard has no serious accessibility violations", async ({ page }) => {
  const email = `e2e-a11y-${randomUUID()}@example.com`
  await page.goto("/es/login")
  await page.fill("#email", email)
  await page.click("button:has-text('Entrar')")
  await page.waitForURL("**/dashboard")
  await page.waitForSelector("h1:has-text('Panel')")

  await expectNoSeriousViolations(page)
})

test("application form dialog and settings page have no serious accessibility violations", async ({
  page,
}) => {
  const email = `e2e-a11y-form-${randomUUID()}@example.com`
  await page.goto("/es/login")
  await page.fill("#email", email)
  await page.click("button:has-text('Entrar')")
  await page.waitForURL("**/dashboard")
  await page.waitForSelector("h1:has-text('Panel')")

  await page.click("button:has-text('Nueva postulación')")
  await page.waitForSelector("#companyName")
  await expectNoSeriousViolations(page)

  await page.goto("/es/dashboard/settings")
  await page.waitForSelector("text=Eliminar cuenta")
  await expectNoSeriousViolations(page)
})

test("edit dialog with a country map has no serious accessibility violations", async ({
  page,
}) => {
  const email = `e2e-a11y-map-${randomUUID()}@example.com`
  await page.goto("/es/login")
  await page.fill("#email", email)
  await page.click("button:has-text('Entrar')")
  await page.waitForURL("**/dashboard")
  await page.waitForSelector("h1:has-text('Panel')")

  await page.click("button:has-text('Nueva postulación')")
  await page.waitForSelector("#companyName")
  await page.fill("#companyName", "A11y Map Co")
  await page.fill("#jobTitle", "Engineer")
  await page.fill("#appliedAt", "2026-08-01")

  await page.getByRole("combobox", { name: "País" }).click()
  await page.getByPlaceholder("Buscar un país…").fill("Argent")
  await page.getByRole("option", { name: "Argentina" }).click()
  await page.click("button[type=submit]:has-text('Guardar')")
  await page.waitForSelector("text=Postulación creada")

  await page.getByRole("button", { name: "Acciones" }).first().click()
  await page.waitForSelector("[role=menu]")
  await page.getByRole("menuitem", { name: "Editar" }).click()
  await page.waitForSelector("#companyName")
  await expect(page.getByText("Mapa que resalta Argentina")).toBeVisible({
    timeout: 10000,
  })

  await expectNoSeriousViolations(page)
})
