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
  const archiveYear = page.locator('migrosmuseum-m-exhibition migrosmuseum-a-heading[cluster-by] h3').first()
  const archiveTeaserLoader = page.locator('migrosmuseum-m-exhibition m-load-template-tag').first()
  const archiveTitle = page.locator('migrosmuseum-m-exhibition m-teaser h3').first()

  await expect(yearSelect).toBeVisible({ timeout: 30000 })
  await expect(archiveYear).toBeAttached({ timeout: 30000 })
  await expect(archiveTeaserLoader).toBeAttached({ timeout: 30000 })
  await archiveTeaserLoader.scrollIntoViewIfNeeded()
  await expect(archiveTitle).toBeVisible({ timeout: 30000 })
  await expect(searchInput).toHaveCSS('font-size', '16px')
  await expect(yearSelect).toHaveCSS('font-size', '16px')
  await expect(archiveYear).toHaveCSS('font-size', '34px')
  await expect(archiveTitle).toHaveCSS('font-size', '16px')

  const inputBox = await searchInput.boundingBox()
  const iconBox = await searchIcon.boundingBox()
  expect(inputBox).not.toBeNull()
  expect(iconBox).not.toBeNull()

  const inputCenter = inputBox.y + inputBox.height / 2
  const iconCenter = iconBox.y + iconBox.height / 2
  expect(Math.abs(inputCenter - iconCenter)).toBeLessThan(1)

  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(archiveYear).toHaveCSS('font-size', '56px')
})
