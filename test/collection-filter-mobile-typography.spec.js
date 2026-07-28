const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL

test('collection filters and artist index use the expected mobile typography', async ({ page }) => {
  test.setTimeout(120000)
  test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${localSite}/sammlung?tab=artists`, { waitUntil: 'domcontentloaded' })

  const tabs = page.locator('m-tabs')
  const tabButtons = tabs.locator('.tab-navigation a-button a')
  const searchInput = tabs.locator('.tab-navigation a-input input')
  const searchIcon = tabs.locator('.tab-navigation a-input button svg')
  const artistList = page.locator('migrosmuseum-m-artists')
  const artistHeading = artistList.locator('h3').first()
  const artistName = artistList.locator('o-grid section > div a').first()

  await tabButtons.first().waitFor({ state: 'attached', timeout: 30000 })
  await expect(tabButtons).toHaveCount(2)
  for (const tabButton of await tabButtons.all()) {
    await expect(tabButton).toHaveCSS('font-size', '16px')
  }
  await expect(searchInput).toHaveCSS('font-size', '16px')
  await expect(artistHeading).toHaveCSS('font-size', '34px')
  await expect(artistName).toHaveCSS('font-size', '16px')

  const inputBox = await searchInput.boundingBox()
  const iconBox = await searchIcon.boundingBox()
  expect(inputBox).not.toBeNull()
  expect(iconBox).not.toBeNull()

  const inputCenter = inputBox.y + inputBox.height / 2
  const iconCenter = iconBox.y + iconBox.height / 2
  expect(Math.abs(inputCenter - iconCenter)).toBeLessThan(1)
})
