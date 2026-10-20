const { test, expect } = require('@playwright/test')

const fixture = 'test/fixtures/catalog-performance.html'
const image = '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="orange"/></svg>'

test('catalog becomes visible while its images are still pending', async ({ page }) => {
  let releaseImages
  const pending = new Promise(resolve => { releaseImages = resolve })
  await page.route('**/media/catalog-*', async route => {
    await pending
    await route.fulfill({ contentType: 'image/svg+xml', body: image })
  })
  try {
    await page.goto(fixture)
    await expect(page.locator('migrosmuseum-m-catalog')).not.toHaveAttribute('hidden', '', { timeout: 5000 })
    await expect(page.locator('m-teaser').first()).toBeVisible()
  } finally {
    releaseImages()
  }
})

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`catalog uses bounded images without duplicate previews at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    const requests = []
    await page.route('**/media/catalog-*', async route => {
      requests.push(new URL(route.request().url()))
      await route.fulfill({ contentType: 'image/svg+xml', body: image })
    })
    await page.goto(fixture)
    await expect(page.locator('m-teaser').first()).toBeVisible()
    await expect.poll(() => requests.length).toBeGreaterThan(0)
    await page.waitForTimeout(300)
    for (const url of requests) {
      expect(Number(url.searchParams.get('width'))).toBeGreaterThan(0)
      expect(Number(url.searchParams.get('width'))).toBeLessThanOrEqual(640)
      expect(url.searchParams.get('quality')).toBe('80')
    }
    expect(new Set(requests.map(url => url.pathname)).size).toBe(requests.length)
    expect(requests.length).toBeLessThan(40)
  })
}

test('catalog without images supports filtering, clearing and reconnecting', async ({ page }) => {
  await page.goto(`${fixture}?no-images&search=Artist%2039`)
  const catalog = page.locator('migrosmuseum-m-catalog')
  await expect(catalog).not.toHaveAttribute('hidden', '', { timeout: 5000 })
  await expect(page.locator('m-teaser').filter({ hasText: 'Artist 39' })).toBeVisible()
  await page.evaluate(() => document.body.dispatchEvent(new CustomEvent('request-artists-filter-text', { detail: { value: 'unmatched' } })))
  await expect(catalog).toHaveClass('empty')
  await page.evaluate(() => document.body.dispatchEvent(new CustomEvent('request-artists-filter-text', { detail: { value: '' } })))
  await expect(catalog).not.toHaveClass('empty')
  await page.evaluate(() => {
    const element = document.querySelector('migrosmuseum-m-catalog')
    element.remove()
    document.body.appendChild(element)
  })
  await expect(catalog).not.toHaveAttribute('hidden', '')
  await expect(page.locator('m-teaser').first()).toBeVisible()
})
