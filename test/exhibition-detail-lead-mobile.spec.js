const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL

test('exhibition lead uses the expected mobile typography and padding', async ({ page }) => {
  test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${localSite}/programm/ausstellungen/disobedience-archive-canopy-for-broken-time`, { waitUntil: 'domcontentloaded' })

  const lead = page.locator('p.exhibition-detail-lead')

  await expect(lead).toBeVisible({ timeout: 30000 })
  await expect(lead).toHaveCSS('font-size', '21px')
  await expect(lead).toHaveCSS('padding', '10px')
})
