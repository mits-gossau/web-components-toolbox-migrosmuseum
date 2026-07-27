const { test, expect } = require('@playwright/test')

/* global getComputedStyle */

const demoPage = 'src/es/components/web-components-toolbox/docs/Template.html?rootFolder=src&css=./src/css/variablesCustom.css&content=./test/fixtures/rich-text-lists.html'

test('rich text lists align with 25 pixel indentation', async ({ page }) => {
  await page.goto(demoPage)
  await page.waitForLoadState('networkidle')

  const lists = page.locator('[data-test$="-list"]')
  await expect(lists).toHaveCount(2)

  const paddingLeft = await lists.evaluateAll(elements => (
    elements.map(element => getComputedStyle(element).paddingLeft)
  ))

  expect(paddingLeft).toEqual(['25px', '25px'])
})
