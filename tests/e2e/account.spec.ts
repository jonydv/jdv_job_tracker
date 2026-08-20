import { test, expect } from "@playwright/test"
import { randomUUID } from "node:crypto"

test("export data and delete account", async ({ page }) => {
  const email = `e2e-account-${randomUUID()}@example.com`

  await page.goto("/es/login")
  await page.fill("#email", email)
  await page.click("button:has-text('Entrar')")
  await page.waitForURL("**/dashboard")
  await page.waitForSelector("h1:has-text('Panel')")

  await page.goto("/es/dashboard/settings")
  await page.waitForSelector("text=Eliminar cuenta")

  const downloadPromise = page.waitForEvent("download")
  await page.click("text=Descargar JSON")
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/job-tracker-.*\.json/)

  const deleteButton = page.getByRole("button", {
    name: "Eliminar mi cuenta y todos mis datos",
  })
  await expect(deleteButton).toBeDisabled()

  await page.fill("#delete-email", email)
  await expect(deleteButton).toBeEnabled()

  await deleteButton.click()
  await page.waitForSelector("[role=alertdialog]")
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Eliminar mi cuenta y todos mis datos" })
    .click()

  await page.waitForFunction(() => !location.pathname.includes("/dashboard"))

  await page.goto("/es/dashboard")
  await page.waitForURL("**/login**")
})
