const { test, expect } = require('@playwright/test')

/* global getComputedStyle */

const demoPage = 'src/es/components/web-components-toolbox/docs/Template.html?rootFolder=src&css=./src/css/variablesCustom.css&content=./test/fixtures/video-carousel-player.html'

async function playerBounds (carousel) {
  return carousel.evaluate(carousel => {
    const root = carousel.root || carousel.shadowRoot || carousel
    const host = root.querySelector('a-iframe')
    const iframe = host && (host.root || host.shadowRoot || host).querySelector('iframe')
    if (!iframe || getComputedStyle(host).overflow !== 'hidden') return null

    const container = host.getBoundingClientRect()
    const player = iframe.getBoundingClientRect()
    return {
      playerHeight: player.height,
      clippedBottom: player.bottom - container.bottom,
      clippedTop: container.top - player.top
    }
  })
}

for (const viewport of [
  { name: 'desktop', width: 1635, height: 985 },
  { name: 'mobile portrait', width: 390, height: 844 },
  { name: 'mobile landscape', width: 844, height: 390 }
]) {
  test(`video carousel contains the full player before and after play on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.route('https://www.youtube.com/embed/**', route => route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><body>Test player</body></html>'
    }))
    await page.goto(demoPage)

    const carousel = page.locator('m-carousel-two[namespace="carousel-two-video-museum-"]')
    await expect.poll(() => playerBounds(carousel)).not.toBeNull()

    const assertPlayerVisible = async () => {
      await expect.poll(async () => (await playerBounds(carousel)).playerHeight).toBeGreaterThan(0)
      await expect.poll(async () => (await playerBounds(carousel)).clippedBottom).toBeLessThanOrEqual(1)
      await expect.poll(async () => (await playerBounds(carousel)).clippedTop).toBeLessThanOrEqual(1)
    }

    await assertPlayerVisible()
    await carousel.locator('.video-play-overlay').first().click()
    await expect(carousel.locator('.video-play-overlay').first()).toHaveClass(/loaded/)
    await assertPlayerVisible()
  })
}
