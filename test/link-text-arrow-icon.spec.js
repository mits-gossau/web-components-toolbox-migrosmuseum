const { test, expect } = require('@playwright/test')

test('textual arrows suppress the default link icon', async ({ page }) => {
  const pageQuery = 'rootFolder=src&css=./src/css/variablesCustom.css&content=./src/es/components/pages/LinkTextArrow.html'
  await page.goto(`/src/es/components/web-components-toolbox/docs/TemplateMigrosmuseum.html?${pageQuery}`)

  const textArrowLinks = page.locator('migrosmuseum-a-link[data-test^="text-arrow-"]')
  const defaultArrowLink = page.locator('migrosmuseum-a-link[data-test="default-arrow"]')

  await expect(textArrowLinks).toHaveCount(5)
  await expect(defaultArrowLink).toBeVisible()
  await expect(textArrowLinks.locator('a-icon-mdx')).toHaveCount(0)
  await expect(defaultArrowLink.locator('a-icon-mdx')).toHaveCount(1)
})
