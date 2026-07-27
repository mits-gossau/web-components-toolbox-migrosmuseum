const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
]

for (const viewport of viewports) {
  test(`rich text icon links align their icons and labels on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}/programm/ausstellungen/disobedience-archive-canopy-for-broken-time`)
    await page.waitForLoadState('networkidle')

    const links = page.locator('.richText-icon-link')
    await expect(links).toHaveCount(5)

    const positions = await links.evaluateAll(elements => elements.map(element => {
      const icon = element.querySelector('.richText-icon-link__icon').getBoundingClientRect()
      const label = element.querySelector('.richText-icon-link__label').getBoundingClientRect()

      return {
        iconCenter: icon.x + icon.width / 2,
        labelStart: label.x
      }
    }))

    const iconCenters = positions.map(position => position.iconCenter)
    const labelStarts = positions.map(position => position.labelStart)

    expect(Math.max(...iconCenters) - Math.min(...iconCenters)).toBeLessThan(0.1)
    expect(Math.max(...labelStarts) - Math.min(...labelStarts)).toBeLessThan(0.1)
  })
}
