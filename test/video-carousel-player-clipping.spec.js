const { test, expect } = require('@playwright/test')

/* global getComputedStyle */

const demoPage = 'src/es/components/web-components-toolbox/docs/Template.html?rootFolder=src&css=./src/css/variablesCustom.css&content=./test/fixtures/'

async function playerBounds (carousel, slideIndex) {
  return carousel.evaluate((carousel, slideIndex) => {
    const root = carousel.root || carousel.shadowRoot || carousel
    const host = root.querySelectorAll('a-iframe')[slideIndex]
    const iframe = host && (host.root || host.shadowRoot || host).querySelector('iframe')
    if (!iframe || getComputedStyle(host).overflow !== 'hidden') return null

    const container = host.getBoundingClientRect()
    const player = iframe.getBoundingClientRect()
    const overlay = host.parentElement.querySelector('.video-play-overlay').getBoundingClientRect()
    return {
      playerHeight: player.height,
      clippedBottom: player.bottom - container.bottom,
      clippedTop: container.top - player.top,
      overlayHeightDifference: Math.abs(overlay.height - container.height)
    }
  }, slideIndex)
}

for (const format of ['landscape', 'portrait']) {
  for (const viewport of [
    { name: 'desktop', width: 1635, height: 985 },
    { name: 'mobile portrait', width: 390, height: 844 },
    { name: 'mobile landscape', width: 844, height: 390 }
  ]) {
    test(`video carousel contains the full ${format} player before and after play on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.route('https://www.youtube.com/embed/**', route => route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><html><body>Test player</body></html>'
      }))
      await page.goto(demoPage + (format === 'portrait' ? 'video-carousel-player-portrait.html' : 'video-carousel-player.html'))

      const carousel = page.locator('m-carousel-two[namespace="carousel-two-video-museum-"]')
      for (const slideIndex of [0, 1]) {
        if (slideIndex) await carousel.locator('nav > *').nth(slideIndex).click()
        await expect.poll(() => playerBounds(carousel, slideIndex)).not.toBeNull()

        const assertPlayerVisible = async () => {
          await expect.poll(async () => (await playerBounds(carousel, slideIndex)).playerHeight).toBeGreaterThan(0)
          await expect.poll(async () => (await playerBounds(carousel, slideIndex)).clippedBottom).toBeLessThanOrEqual(1)
          await expect.poll(async () => (await playerBounds(carousel, slideIndex)).clippedTop).toBeLessThanOrEqual(1)
        }

        await assertPlayerVisible()
        await expect.poll(async () => (await playerBounds(carousel, slideIndex)).overlayHeightDifference).toBeLessThanOrEqual(1)
        await carousel.locator('.video-play-overlay').nth(slideIndex).click()
        await expect(carousel.locator('.video-play-overlay').nth(slideIndex)).toHaveClass(/loaded/)
        await assertPlayerVisible()
      }
    })
  }
}
