const { test, expect } = require('@playwright/test')

/* global getComputedStyle, scrollTo */

const localSite = process.env.UMBRACO_BASE_URL
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
]

for (const viewport of viewports) {
  test(`scrolling content covers sticky heading on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(localSite, { waitUntil: 'networkidle' })

    const headingHost = page.locator('migrosmuseum-a-heading', { hasText: 'MUSEUM' })
    const headingText = headingHost.locator('h1, h2, h3, h4, h5, h6')
    const content = page.locator('#testanchor + o-grid')
    const contentHeading = content.locator('h1, h2, h3, h4, h5, h6').first()
    let overlap = 0

    for (let scrollTop = 0; scrollTop <= await page.evaluate(() => document.documentElement.scrollHeight); scrollTop += 100) {
      await page.evaluate(scrollTop => scrollTo(0, scrollTop), scrollTop)
      await page.waitForTimeout(20)

      const [headingBox, contentBox] = await Promise.all([
        headingText.boundingBox(),
        contentHeading.boundingBox()
      ])

      if (headingBox && contentBox) {
        overlap = Math.max(0, Math.min(headingBox.y + headingBox.height, contentBox.y + contentBox.height) - Math.max(headingBox.y, contentBox.y))
        if (overlap > 0) break
      }
    }

    expect(overlap).toBeGreaterThan(0)
    await expect.poll(() => headingHost.evaluate(host => getComputedStyle(host).backgroundColor)).toBe('rgba(0, 0, 0, 0)')
    await expect.poll(() => content.evaluate(content => getComputedStyle(content).position)).toBe('relative')
  })
}
