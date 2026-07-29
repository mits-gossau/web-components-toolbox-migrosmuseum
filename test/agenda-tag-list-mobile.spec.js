const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL

test('mobile agenda tag list reaches the viewport edge and uses compact tags', async ({ page }) => {
  test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${localSite}/programm/agenda`, { waitUntil: 'domcontentloaded' })

  const tagList = page.locator('migrosmuseum-m-tag-list')
  const tag = tagList.locator('a-button').first().locator('[part="button"]')

  await expect(tagList).toBeVisible({ timeout: 30000 })
  await expect(tag).toBeVisible({ timeout: 30000 })

  const listBox = await tagList.boundingBox()
  expect(listBox.x).toBeCloseTo(10, 2)
  expect(listBox.x + listBox.width).toBeCloseTo(390, 2)
  await expect(tagList).toHaveCSS('margin-left', '10px')
  await expect(tagList).toHaveCSS('margin-right', '0px')
  await expect(tagList).toHaveCSS('font-size', '16px')
  await expect(tag).toHaveCSS('font-size', '16px')
  await expect(tag).toHaveCSS('padding-top', '5px')
  await expect(tag).toHaveCSS('padding-bottom', '5px')
})
