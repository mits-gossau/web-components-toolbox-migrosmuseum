const { test, expect } = require('@playwright/test')

const demoPage = 'src/es/components/web-components-toolbox/docs/Template.html?rootFolder=src&css=./src/css/variablesCustom.css&content=./test/fixtures/sticky-heading-layering.html'

test('all content following a sticky heading paints above it', async ({ page }) => {
  await page.goto(demoPage)

  const heading = page.locator('[data-test="sticky-heading"]')
  const marquee = page.locator('[data-test="marquee"]')
  const contentGrid = page.locator('[data-test="content-grid"]')

  await expect(heading).toHaveAttribute('show', '')
  await expect(marquee).toHaveCSS('position', 'relative')
  await expect(contentGrid).toHaveCSS('position', 'relative')
})
