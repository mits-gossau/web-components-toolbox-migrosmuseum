const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL
const pagePath = '/programm/ausstellungen/disobedience-archive-canopy-for-broken-time'
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
]

for (const viewport of viewports) {
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

    expect(modulesBox.x).toBeCloseTo(0, 2)
    expect(modulesBox.width).toBeCloseTo(viewport.width, 2)
    expect(videoBox.x).toBeCloseTo(0, 2)
    expect(videoBox.width).toBeCloseTo(viewport.width, 2)
    expect(agendaBox.x).toBeCloseTo(0, 2)
    expect(agendaBox.width).toBeCloseTo(viewport.width, 2)
    expect(ordinaryBox.x).toBeGreaterThan(0)
    expect(ordinaryBox.width).toBeLessThan(viewport.width)
  })
}
