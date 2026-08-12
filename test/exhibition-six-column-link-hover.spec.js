const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL
const pages = ['/', '/programm/ausstellungen']

for (const pagePath of pages) {
  test(`six-column image and link tiles share valid link behaviour on ${pagePath}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${localSite}${pagePath}`, { waitUntil: 'domcontentloaded' })

    const imageLink = page.locator('div[col-lg="6"] > a[href="/sammlung"]:has(> a-picture):visible').first()
    await expect(imageLink).toBeVisible({ timeout: 30000 })

    const pair = await imageLink.evaluate(anchor => {
      const imageCell = anchor.parentElement
      const textCell = imageCell?.previousElementSibling || imageCell?.nextElementSibling
      const textLink = textCell?.querySelector('a[href="/sammlung"]')

      return {
        imageTarget: anchor.getAttribute('target') || '',
        imageClasses: Array.from(anchor.classList),
        textTarget: textLink?.getAttribute('target') || '',
        backgroundBeforeHover: textCell ? getComputedStyle(textCell).backgroundColor : null
      }
    })

    expect(pair.imageTarget).toBe(pair.textTarget)
    expect(pair.imageClasses).toContain('no-icon')

    await imageLink.hover()

    await expect.poll(() => imageLink.evaluate(anchor => {
      const imageCell = anchor.parentElement
      const textCell = imageCell?.previousElementSibling || imageCell?.nextElementSibling
      return textCell ? getComputedStyle(textCell).backgroundColor : null
    })).not.toBe(pair.backgroundBeforeHover)
  })
}
