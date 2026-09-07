const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL
const pagePath = '/programm/ausstellungen/mohamed-bourouissa'

test.use({ ignoreHTTPSErrors: true })

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
]) {
  test(`exhibition section headings have no nested horizontal padding on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}${pagePath}`, { waitUntil: 'domcontentloaded' })

    const musicHeading = page.getByRole('heading', { name: /^MUSIK$/i })
    test.skip(await musicHeading.count() === 0, 'The configured Umbraco database has no Musik/Mehr modules on this exhibition')

    const headings = await Promise.all(
      ['MUSIK', 'MEHR'].map(async label => {
        const heading = page.getByRole('heading', { name: new RegExp(`^${label}$`, 'i') })
        await expect(heading).toBeVisible({ timeout: 30000 })
        return heading.evaluate(element => {
          const headingHost = element.getRootNode().host
          const gridCell = headingHost.parentElement
          const view = element.ownerDocument.defaultView

          return {
            headingPaddingLeft: view.getComputedStyle(headingHost).paddingLeft,
            headingPaddingRight: view.getComputedStyle(headingHost).paddingRight,
            cellPaddingLeft: view.getComputedStyle(gridCell).paddingLeft,
            cellPaddingRight: view.getComputedStyle(gridCell).paddingRight
          }
        })
      })
    )

    for (const spacing of headings) {
      expect(spacing).toEqual({
        headingPaddingLeft: '0px',
        headingPaddingRight: '0px',
        cellPaddingLeft: '0px',
        cellPaddingRight: '0px'
      })
    }
  })
}
