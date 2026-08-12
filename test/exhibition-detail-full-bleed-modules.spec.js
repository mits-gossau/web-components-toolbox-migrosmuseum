const { test, expect } = require('@playwright/test')

/* global document, getComputedStyle */

const localSite = process.env.UMBRACO_BASE_URL
const pagePath = '/programm/ausstellungen/disobedience-archive-canopy-for-broken-time'
const viewports = [
  { name: 'large desktop', width: 1920, height: 1080 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
]

for (const viewport of viewports) {
  test(`exhibition nested ten-column cells use the responsive alignment inset on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}${pagePath}`, { waitUntil: 'domcontentloaded' })

    const grids = page.locator('.exhibition-detail-modules o-grid')
    await expect(grids.first()).toBeVisible({ timeout: 30000 })

    await expect.poll(() => grids.evaluateAll(elements => elements.flatMap(grid => {
      const section = grid.shadowRoot?.querySelector('section') || grid.querySelector(':scope > section')
      return Array.from(section?.children || [])
        .filter(cell => cell.getAttribute('col-lg') === '10')
    }).length)).toBeGreaterThan(0)

    const paddings = await grids.evaluateAll(elements => elements.flatMap(grid => {
      const section = grid.shadowRoot?.querySelector('section') || grid.querySelector(':scope > section')
      return Array.from(section?.children || [])
        .filter(cell => cell.getAttribute('col-lg') === '10')
        .map(cell => parseFloat(getComputedStyle(cell).paddingLeft))
    }))

    if (viewport.name === 'mobile') {
      expect(paddings).toEqual(paddings.map(() => 0))
    } else {
      expect(paddings.every(padding => padding > 0)).toBe(true)
    }
  })

  test(`exhibition video and agenda use full bleed layout on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}${pagePath}`, { waitUntil: 'domcontentloaded' })

    const modules = page.locator('.exhibition-detail-modules')
    const ordinaryModule = modules.locator(':scope > o-grid').first()
    const video = modules.locator(':scope > m-carousel-two[namespace="carousel-two-video-museum-"]')
    const agenda = modules.locator(':scope > migrosmuseum-m-agenda')

    await expect(video).toBeAttached()
    await expect(agenda).toBeAttached()
    await expect(ordinaryModule).toBeAttached()
    await expect(modules).toBeVisible({ timeout: 30000 })
    await expect(video).toBeVisible({ timeout: 30000 })
    await expect(ordinaryModule).toBeVisible({ timeout: 30000 })

    const [modulesBox, ordinaryBox, videoBox, agendaBox] = await Promise.all([
      modules.boundingBox(),
      ordinaryModule.boundingBox(),
      video.boundingBox(),
      agenda.boundingBox()
    ])
    const layoutViewportWidth = await page.evaluate(() => document.body.clientWidth)

    expect(modulesBox.x).toBeCloseTo(0, 2)
    expect(modulesBox.width).toBeCloseTo(layoutViewportWidth, 2)
    expect(videoBox.x).toBeCloseTo(0, 2)
    expect(videoBox.width).toBeCloseTo(layoutViewportWidth, 2)
    expect(agendaBox.x).toBeCloseTo(0, 2)
    expect(agendaBox.width).toBeCloseTo(layoutViewportWidth, 2)
    expect(ordinaryBox.x).toBeGreaterThan(0)
    expect(ordinaryBox.width).toBeLessThan(layoutViewportWidth)

    const textBox = await page.locator('.exhibition-detail-textcol > :visible').first().boundingBox()
    const ordinaryContentBox = await ordinaryModule.locator('[col-lg="10"] > :visible').first().boundingBox()

    expect(ordinaryContentBox.x).toBeCloseTo(textBox.x, 1)
  })
}
