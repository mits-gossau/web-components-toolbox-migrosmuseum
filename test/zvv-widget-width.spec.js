const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
]) {
  test(`ZVV widget fills its container on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}/besuch`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => window.customElements.get('migrosmuseum-m-zvv-widget'))

    const widget = page.locator('migrosmuseum-m-zvv-widget').first()
    const iframe = widget.locator('iframe')

    await expect(widget).toBeVisible({ timeout: 30000 })
    await expect(iframe).toBeVisible({ timeout: 30000 })

    const [widgetBox, iframeBox, parentBox] = await Promise.all([
      widget.boundingBox(),
      iframe.boundingBox(),
      widget.evaluate(element => element.parentElement.getBoundingClientRect().toJSON())
    ])

    expect(widgetBox.width).toBeCloseTo(parentBox.width, 2)
    expect(iframeBox.width).toBeCloseTo(parentBox.width, 2)
    expect(await widget.evaluate(element => element.minHeight)).toBe(300)
  })
}
