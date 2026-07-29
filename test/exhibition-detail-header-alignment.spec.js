const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL
const pagePath = '/programm/ausstellungen/disobedience-archive-canopy-for-broken-time'
const viewports = [
  { name: 'desktop', width: 1440, height: 900, closeOffset: 14, headingPaddingRight: '50px', headerPaddingBottom: '20px' },
  { name: 'mobile', width: 390, height: 844, closeOffset: 0, headingPaddingRight: '20px', headerPaddingBottom: '16px' }
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

  test(`exhibition heading and subtitle use balanced spacing on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against a local Umbraco instance')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}${pagePath}`)
    await page.waitForLoadState('networkidle')

    const detailHeader = page.locator('.exhibition-detail-header')
    const subtitleBlock = page.locator('.exhibition-detail-subtitle')
    const heading = detailHeader.locator('h1')
    const subtitle = subtitleBlock.locator('h3')
    const detailHeaderBox = await detailHeader.boundingBox()
    const headingBox = await heading.boundingBox()
    const subtitleBlockBox = await subtitleBlock.boundingBox()
    const subtitleBox = await subtitle.boundingBox()

    expect(detailHeaderBox).not.toBeNull()
    expect(headingBox).not.toBeNull()
    expect(subtitleBlockBox).not.toBeNull()
    expect(subtitleBox).not.toBeNull()
    expect(subtitleBox.y - (detailHeaderBox.y + detailHeaderBox.height)).toBeCloseTo(0, 1)
    expect(Math.abs(
      (subtitleBox.y - (headingBox.y + headingBox.height)) -
      (subtitleBlockBox.y + subtitleBlockBox.height - (subtitleBox.y + subtitleBox.height))
    )).toBeLessThan(1)
    await expect(detailHeader).toHaveCSS('padding-bottom', viewport.headerPaddingBottom)
    await expect(subtitle).toHaveCSS('margin-bottom', '0px')

    if (viewport.name === 'mobile') {
      await expect(heading).toHaveCSS('margin-bottom', '0px')
      await expect(subtitleBlock).toHaveCSS('padding-bottom', '16px')
      await expect(subtitle).toHaveCSS('font-size', '16px')
    }
  })
}
