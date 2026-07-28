const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
]

for (const viewport of viewports) {
  test(`first navigation page h1 has a 20 pixel top margin on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}/programm/ausstellungen`, { waitUntil: 'domcontentloaded' })

    const firstHeading = page.locator('#content h1').first()
    await expect(firstHeading).toHaveCount(1)
    await expect(firstHeading).toHaveCSS('margin-top', '20px')
  })

  test(`homepage h1 keeps its existing top margin on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(localSite, { waitUntil: 'domcontentloaded' })

    const firstHeading = page.locator('#content h1').first()
    await expect(firstHeading).toHaveCount(1)
    await expect(firstHeading).not.toHaveCSS('margin-top', '20px')
  })

  test(`exhibition detail h1 keeps its existing top margin on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}/programm/ausstellungen/disobedience-archive-canopy-for-broken-time`, { waitUntil: 'domcontentloaded' })

    const firstHeading = page.locator('#content h1').first()
    await expect(firstHeading).toHaveCount(1)
    await expect(firstHeading).not.toHaveCSS('margin-top', '20px')
  })
}
