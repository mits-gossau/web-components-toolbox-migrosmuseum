const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
]) {
  test(`newsletter inputs use the expected styles on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}/newsletter`, { waitUntil: 'domcontentloaded' })

    const inputs = page.locator('m-form .form-group input')
    await expect(inputs.first()).toBeVisible({ timeout: 30000 })

    for (const input of await inputs.all()) {
      await expect(input).toHaveCSS('border-width', '2px')
      await expect(input).toHaveCSS('font-size', viewport.name === 'mobile' ? '16px' : '23px')
    }
  })
}
