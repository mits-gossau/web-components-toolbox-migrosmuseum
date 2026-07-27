const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL
const pagePath = '/programm/ausstellungen/disobedience-archive-canopy-for-broken-time'
const viewports = [
  { name: 'desktop', width: 1440, height: 900, closeOffset: 14, headingPaddingRight: '50px' },
  { name: 'mobile', width: 390, height: 844, closeOffset: 0, headingPaddingRight: '20px' }
]

for (const viewport of viewports) {
  test(`exhibition close icon aligns with the heading on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}${pagePath}`)
    await page.waitForLoadState('networkidle')

    const detailHeader = page.locator('.exhibition-detail-block').first()
    const heading = await detailHeader.locator('h1').boundingBox()
    const closeIcon = await detailHeader.locator('a-icon-mdx svg').boundingBox()

    expect(closeIcon.y - heading.y).toBeCloseTo(viewport.closeOffset, 1)
    await expect(detailHeader.locator('h1')).toHaveCSS('padding-right', viewport.headingPaddingRight)
  })

  test(`exhibition subtitle follows the heading on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against a local Umbraco instance')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}${pagePath}`)
    await page.waitForLoadState('networkidle')

    const detailHeader = await page.locator('.exhibition-detail-block').first().boundingBox()
    const subtitle = await page.locator('.exhibition-detail-block h3').first().boundingBox()

    expect(detailHeader).not.toBeNull()
    expect(subtitle).not.toBeNull()
    expect(subtitle.y - (detailHeader.y + detailHeader.height)).toBeCloseTo(0, 1)
  })
}
