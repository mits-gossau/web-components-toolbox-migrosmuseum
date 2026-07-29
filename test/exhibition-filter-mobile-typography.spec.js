const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL

test('exhibition archive filters match the mobile collection typography', async ({ page }) => {
  test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${localSite}/programm/ausstellungen`, { waitUntil: 'domcontentloaded' })

  const filter = page.locator('.exhibition-archive-filter')
  const yearSelect = filter.locator('a-select select')
  const searchInput = filter.locator('a-input input')
  const searchIcon = filter.locator('a-input button svg')

  await expect(yearSelect).toBeVisible({ timeout: 30000 })
  await expect(searchInput).toHaveCSS('font-size', '16px')
  await expect(yearSelect).toHaveCSS('font-size', '16px')

  const inputBox = await searchInput.boundingBox()
  const iconBox = await searchIcon.boundingBox()
  expect(inputBox).not.toBeNull()
  expect(iconBox).not.toBeNull()

  const inputCenter = inputBox.y + inputBox.height / 2
  const iconCenter = iconBox.y + iconBox.height / 2
  expect(Math.abs(inputCenter - iconCenter)).toBeLessThan(1)
})
