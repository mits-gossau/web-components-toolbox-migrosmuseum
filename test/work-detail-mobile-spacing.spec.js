const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL
const pagePath = '/werke/untitled-1998-das-soziale-kapital-sign'

test.use({ ignoreHTTPSErrors: true })

test('work exhibitions grid has no horizontal margin on mobile', async ({ page }) => {
  test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${localSite}${pagePath}`, { waitUntil: 'domcontentloaded' })

  const exhibitionsGrid = page.locator('.work-exhibitions-grid')

  await expect(exhibitionsGrid).toBeVisible({ timeout: 30000 })
  await expect(exhibitionsGrid).toHaveCSS('margin-left', '0px')
  await expect(exhibitionsGrid).toHaveCSS('margin-right', '0px')
})
