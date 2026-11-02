const { test, expect } = require('@playwright/test')

/* global getComputedStyle */

const localSite = process.env.UMBRACO_BASE_URL

test('agenda mobile height uses the museum theme, supports overrides and keeps the fallback', async ({ page }) => {
  test.skip(!localSite, 'Set UMBRACO_BASE_URL to run against the local Umbraco site')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${localSite}/programm/agenda`, { waitUntil: 'domcontentloaded' })

  const agenda = page.locator('migrosmuseum-m-agenda').first()
  const sections = agenda.locator('o-grid section')
  await expect(sections.first()).toBeVisible({ timeout: 30000 })
  const minimumHeights = () => sections.evaluateAll(elements => elements.map(element => {
    const style = getComputedStyle(element)
    return parseFloat(style.minHeight) / parseFloat(style.fontSize)
  }))
  const expectHeight = async height => {
    const heights = await minimumHeights()
    expect(heights.length).toBeGreaterThan(0)
    for (const actual of heights) expect(actual).toBeCloseTo(height, 2)
  }

  await expectHeight(11)
  await agenda.evaluate(element => element.style.setProperty('--agenda-event-min-height-mobile', '13em'))
  await expectHeight(13)
  await agenda.evaluate(element => element.style.setProperty('--agenda-event-min-height-mobile', 'initial'))
  await expectHeight(10)
  await page.setViewportSize({ width: 1440, height: 900 })
  await expectHeight(8)
})
