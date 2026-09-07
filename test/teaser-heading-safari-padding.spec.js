const { test, expect } = require('@playwright/test')
const fs = require('fs')
const path = require('path')

const demoPage = 'src/es/components/web-components-toolbox/docs/Template.html?rootFolder=src&css=./src/css/variablesCustom.css&content=./test/fixtures/safari-teaser-heading.html'

test('teaser headings have no extra padding without host-context support', async ({ page }) => {
  const headingPath = path.resolve(__dirname, '../src/es/components/atoms/heading/Heading.js')
  const headingSource = fs.readFileSync(headingPath, 'utf8').replace(/\s*:host-context\(m-teaser\) \{\s*padding: 0 !important;\s*\}/g, '')

  await page.route('**/components/atoms/heading/Heading.js', route => route.fulfill({
    contentType: 'text/javascript',
    body: headingSource
  }))
  await page.goto(demoPage)

  const heading = page.locator('migrosmuseum-a-heading', { hasText: 'RUNDGÄNGE' })
  await expect(heading).toHaveAttribute('teaser-child', '')
  await expect(heading).toHaveCSS('padding-left', '0px')
  await expect(heading).toHaveCSS('padding-right', '0px')
})
