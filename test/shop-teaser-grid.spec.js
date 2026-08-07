const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL
const pagePath = '/programm/ausstellungen/disobedience-archive-canopy-for-broken-time'
const shopLinks = 'a[href*="shop.migrosmuseum.ch"]'
const viewports = [
  { name: 'desktop', width: 1440, height: 900, expectedRows: 1, itemsPerRow: 4, captionTextSize: '19px' },
  { name: 'mobile', width: 390, height: 844, expectedRows: 2, itemsPerRow: 2, captionTextSize: '13px' }
]

for (const viewport of viewports) {
  test(`shop teasers form a ${viewport.itemsPerRow}-column grid on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}${pagePath}`)
    await page.waitForLoadState('networkidle')

    const teasers = page.locator(shopLinks)
    await expect(teasers).toHaveCount(4)

    const boxes = await Promise.all(
      Array.from({ length: 4 }, (_, index) => teasers.nth(index).boundingBox())
    )
    const rows = boxes.reduce((result, box) => {
      const row = result.find(items => Math.abs(items[0].y - box.y) < 1)
      row ? row.push(box) : result.push([box])
      return result
    }, [])

    expect(rows).toHaveLength(viewport.expectedRows)
    for (const row of rows) expect(row).toHaveLength(viewport.itemsPerRow)
  })

  test(`shop teaser captions have no panel styling on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}${pagePath}`)
    await page.waitForLoadState('networkidle')

    const captions = page.locator(`${shopLinks} figcaption`)
    const captionTitles = page.locator(`${shopLinks} figcaption h3`)
    const captionTexts = page.locator(`${shopLinks} figcaption p`)
    await expect(captions).toHaveCount(4)
    await expect(captionTitles).toHaveCount(4)
    await expect(captionTexts).toHaveCount(4)

    for (let index = 0; index < 4; index++) {
      await expect(captions.nth(index)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      await expect(captions.nth(index)).toHaveCSS('padding', '0px')
      await expect(captionTexts.nth(index)).toHaveCSS('font-size', viewport.captionTextSize)
      if (viewport.name === 'mobile') await expect(captionTitles.nth(index)).toHaveCSS('font-size', '22px')
    }
  })
}
