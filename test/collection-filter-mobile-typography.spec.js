const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL

test('collection filters use compact mobile typography with a centered search button', async ({ page }) => {
  test.setTimeout(120000)
  test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${localSite}/sammlung?tab=artists`, { waitUntil: 'domcontentloaded' })

  const tabs = page.locator('m-tabs')
  const tabButtons = tabs.locator('.tab-navigation a-button a')
  const searchInput = tabs.locator('.tab-navigation a-input input')
  const searchButton = tabs.locator('.tab-navigation a-input button')

  await expect(tabButtons).toHaveCount(2)
  for (const tabButton of await tabButtons.all()) {
    await expect(tabButton).toHaveCSS('font-size', '16px')
  }
  await expect(searchInput).toHaveCSS('font-size', '16px')

  const inputBox = await searchInput.boundingBox()
  const buttonBox = await searchButton.boundingBox()
  expect(inputBox).not.toBeNull()
  expect(buttonBox).not.toBeNull()

  const inputCenter = inputBox.y + inputBox.height / 2
  const buttonCenter = buttonBox.y + buttonBox.height / 2
  expect(Math.abs(inputCenter - buttonCenter)).toBeLessThan(1)
})
