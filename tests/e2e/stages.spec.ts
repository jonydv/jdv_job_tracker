import { test, expect } from "@playwright/test"
import { randomUUID } from "node:crypto"

test("add and complete an interview stage", async ({ page }) => {
  const email = `e2e-stages-${randomUUID()}@example.com`

  await page.goto("/es/login")
  await page.fill("#email", email)
  await page.click("button:has-text('Entrar')")
  await page.waitForURL("**/dashboard")
  await page.waitForSelector("h1:has-text('Panel')")

  await page.click("button:has-text('Nueva postulación')")
  await page.waitForSelector("#companyName")
  await page.fill("#companyName", "Stage E2E Co")
  await page.fill("#jobTitle", "Backend Engineer")
  await page.fill("#appliedAt", "2026-08-01")
  await page.click("button[type=submit]:has-text('Guardar')")
  await page.waitForSelector("text=Postulación creada")

  await page.getByRole("button", { name: "Acciones" }).first().click()
  await page.waitForSelector("[role=menu]")
  await page.getByRole("menuitem", { name: "Editar" }).click()
  await page.waitForSelector("text=Etapas de entrevista")

  const dialog = page.locator("[role=dialog]")
  await page.click("button:has-text('Agregar etapa')")
  await page.waitForSelector("text=Etapa agregada")
  await expect(
    dialog.getByText("Todavía no cargaste ninguna etapa.")
  ).toBeHidden({ timeout: 10000 })

  await dialog.getByRole("checkbox").first().click()
  await page.waitForSelector("text=Etapa actualizada")
})
