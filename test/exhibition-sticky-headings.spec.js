const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL
const exhibitionPath = '/programm/ausstellungen/disobedience-archive-canopy-for-broken-time'
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
]

for (const viewport of viewports) {
  test(`sticky exhibition headings become visible on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}${exhibitionPath}`, { waitUntil: 'networkidle' })

    const sensors = page.locator('heading-intersection-sensor')
    await expect(sensors).toHaveCount(3, { timeout: 30000 })

    const modules = page.locator('.exhibition-detail-modules')
    const ordinaryModule = modules.locator(':scope > o-grid').first()
    const [modulesBox, ordinaryModuleBox] = await Promise.all([
      modules.boundingBox(),
      ordinaryModule.boundingBox()
    ])

    for (let index = 0; index < await sensors.count(); index++) {
      const sensor = sensors.nth(index)
      const heading = sensor.locator('xpath=preceding-sibling::*[1]')
      const headingText = heading.locator('h1, h2, h3, h4, h5, h6')

      await sensor.evaluate(element => {
        element.ownerDocument.defaultView.Element.prototype.scrollIntoView.call(element.nextElementSibling, { block: 'start' })
      })

      await expect(heading).toBeVisible()

      const [headingBox, headingTextBox, sensorBox] = await Promise.all([
        heading.boundingBox(),
        headingText.boundingBox(),
        sensor.boundingBox()
      ])

      expect(headingBox.x).toBeCloseTo(modulesBox.x, 2)
      expect(headingBox.width).toBeCloseTo(modulesBox.width, 2)
      expect(sensorBox.x).toBeCloseTo(modulesBox.x, 2)
      expect(sensorBox.width).toBeCloseTo(modulesBox.width, 2)
      expect(headingTextBox.x).toBeCloseTo(ordinaryModuleBox.x, 2)
    }
  })
}
