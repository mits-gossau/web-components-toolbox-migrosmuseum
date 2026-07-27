const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL
const pagePath = '/programm/ausstellungen/disobedience-archive-canopy-for-broken-time'
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
]

for (const viewport of viewports) {
  test(`revealed sticky header has no bottom border on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}${pagePath}`)
    await page.waitForLoadState('networkidle')

    await page.mouse.wheel(0, 2200)
    await page.waitForTimeout(1200)
    await page.mouse.wheel(0, -500)

    const stickyHeader = page.locator('migrosmuseum-o-header')
    await expect(stickyHeader).toHaveClass(/show/)
    await expect(stickyHeader.locator('header')).toHaveCSS('border-bottom-width', '0px')
  })
}
