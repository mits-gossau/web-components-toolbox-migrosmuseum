const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL
const pagePath = '/programm/ausstellungen/disobedience-archive-canopy-for-broken-time'
const viewports = [
  { name: 'desktop', width: 1440, height: 900, h5FontSize: '19px' },
  { name: 'mobile', width: 390, height: 844, h5FontSize: '13px' }
]

for (const viewport of viewports) {
  test(`h5 uses the expected global font size on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}${pagePath}`)
    await page.waitForLoadState('networkidle')

    const heading = page.getByRole('heading', { level: 5, name: 'Ein H5 Titel dazwischen' })
    await expect(heading).toHaveCount(1)
    await expect(heading).toHaveCSS('font-size', viewport.h5FontSize)
  })
}
