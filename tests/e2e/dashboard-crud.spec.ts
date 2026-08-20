import { test, expect } from "@playwright/test"
import { randomUUID } from "node:crypto"

test("login, create, filter, edit status, delete", async ({ page }) => {
  const email = `e2e-crud-${randomUUID()}@example.com`

  await page.goto("/es/login")
  await page.fill("#email", email)
  await page.click("button:has-text('Entrar')")
  await page.waitForURL("**/dashboard")
  await page.waitForSelector("h1:has-text('Panel')")

  await page.click("button:has-text('Nueva postulación')")
  await page.waitForSelector("#companyName")
  await page.fill("#companyName", "E2E Corp")
  await page.fill("#jobTitle", "QA Engineer")
  await page.fill("#appliedAt", "2026-08-01")
  await page.click("button[type=submit]:has-text('Guardar')")
  await page.waitForSelector("text=Postulación creada")

  const table = page.getByTestId("applications-table")
  await expect(table.getByText("E2E Corp")).toBeVisible({ timeout: 10000 })

  await page.fill(
    "input[placeholder='Buscar por empresa o puesto…']",
    "Nonexistent Company"
  )
  await expect(
    page.getByText("Ninguna postulación coincide con estos filtros")
  ).toBeVisible({ timeout: 10000 })

  await page.fill("input[placeholder='Buscar por empresa o puesto…']", "")
  await expect(table.getByText("E2E Corp")).toBeVisible({ timeout: 10000 })

  await page.getByRole("button", { name: "Acciones" }).first().click()
  await page.waitForSelector("[role=menu]")
  await page.getByRole("menuitem", { name: "Editar" }).click()
  await page.waitForSelector("#companyName")
  await page.fill("#companyName", "E2E Corp Updated")
  await page.click("button[type=submit]:has-text('Guardar')")
  await page.waitForSelector("text=Postulación actualizada")
  await expect(table.getByText("E2E Corp Updated")).toBeVisible({
    timeout: 10000,
  })

  await page.getByRole("button", { name: "Acciones" }).first().click()
  await page.waitForSelector("[role=menu]")
  await page.getByRole("menuitem", { name: "Eliminar" }).click()
  await page.waitForSelector("text=¿Eliminar esta postulación?")
  await page.waitForTimeout(400)
  await page.getByRole("button", { name: "Eliminar postulación" }).click()
  await page.waitForSelector("text=Postulación eliminada")
  await expect(
    page.getByText("Todavía no cargaste ninguna postulación")
  ).toBeVisible({ timeout: 10000 })
})

test("view action shows a read-only detail dialog", async ({ page }) => {
  const email = `e2e-view-${randomUUID()}@example.com`

  await page.goto("/es/login")
  await page.fill("#email", email)
  await page.click("button:has-text('Entrar')")
  await page.waitForURL("**/dashboard")
  await page.waitForSelector("h1:has-text('Panel')")

  await page.click("button:has-text('Nueva postulación')")
  await page.waitForSelector("#companyName")
  await page.fill("#companyName", "View Co")
  await page.fill("#jobTitle", "QA Engineer")
  await page.fill("#appliedAt", "2026-08-01")
  await page.click("button[type=submit]:has-text('Guardar')")
  await page.waitForSelector("text=Postulación creada")

  await page.getByRole("button", { name: "Acciones" }).first().click()
  await page.waitForSelector("[role=menu]")
  await page.getByRole("menuitem", { name: "Ver" }).click()

  const dialog = page.getByRole("dialog")
  await expect(dialog.getByText("Detalle de la postulación")).toBeVisible()
  await expect(dialog.getByText("View Co")).toBeVisible()
  await expect(page.locator("#companyName")).toHaveCount(0)
})

test("pick a country in edit and see the highlighted map", async ({
  page,
}) => {
  const email = `e2e-country-${randomUUID()}@example.com`

  await page.goto("/es/login")
  await page.fill("#email", email)
  await page.click("button:has-text('Entrar')")
  await page.waitForURL("**/dashboard")
  await page.waitForSelector("h1:has-text('Panel')")

  await page.click("button:has-text('Nueva postulación')")
  await page.waitForSelector("#companyName")
  await page.fill("#companyName", "Map Test Co")
  await page.fill("#jobTitle", "Remote Engineer")
  await page.fill("#appliedAt", "2026-08-01")
  await page.click("button[type=submit]:has-text('Guardar')")
  await page.waitForSelector("text=Postulación creada")

  const table = page.getByTestId("applications-table")
  await expect(table.getByText("Map Test Co")).toBeVisible({ timeout: 10000 })

  await page.getByRole("button", { name: "Acciones" }).first().click()
  await page.waitForSelector("[role=menu]")
  await page.getByRole("menuitem", { name: "Editar" }).click()
  await page.waitForSelector("#companyName")

  await page.getByRole("combobox", { name: "País" }).click()
  await page.getByPlaceholder("Buscar un país…").fill("Argent")
  await page.getByRole("option", { name: "Argentina" }).click()

  await expect(
    page.getByText("Mapa que resalta Argentina")
  ).toBeVisible({ timeout: 10000 })

  await page.click("button[type=submit]:has-text('Guardar')")
  await page.waitForSelector("text=Postulación actualizada")

  // Reload to verify the country actually persisted server-side, instead of
  // racing the client-side router.refresh() that follows a save.
  await page.reload()
  await expect(table.getByText("Map Test Co")).toBeVisible({ timeout: 10000 })

  await page.getByRole("button", { name: "Acciones" }).first().click()
  await page.waitForSelector("[role=menu]")
  await page.getByRole("menuitem", { name: "Editar" }).click()
  await page.waitForSelector("#companyName")
  await expect(
    page.getByText("Mapa que resalta Argentina")
  ).toBeVisible({ timeout: 10000 })
})
