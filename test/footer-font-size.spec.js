const { test, expect } = require('@playwright/test')

/* global getComputedStyle */

const localSite = process.env.UMBRACO_BASE_URL
const pagePath = '/programm/ausstellungen/disobedience-archive-canopy-for-broken-time'
const viewports = [
  { name: 'mobile', width: 390, height: 844, sectionFontSize: '13px', textFontSize: '13px' },
  { name: 'desktop', width: 1440, height: 900, sectionFontSize: '23px', textFontSize: '17px' }
]

for (const viewport of viewports) {
  test(`sub footer uses the expected font size on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}${pagePath}`)
    await page.waitForLoadState('networkidle')

    const subFooter = page.locator('#sub')
    await expect(subFooter).toHaveCount(1)
    await expect(subFooter).toHaveCSS('font-size', viewport.sectionFontSize)

    const textFontSizes = await subFooter.locator(':scope > p, :scope > .links a').evaluateAll(elements => (
      elements.map(element => getComputedStyle(element).fontSize)
    ))

    expect(new Set(textFontSizes)).toEqual(new Set([viewport.textFontSize]))
  })
}
