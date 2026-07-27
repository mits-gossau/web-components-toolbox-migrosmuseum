const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL
const viewports = [
  { name: 'desktop', width: 1440, height: 900, secondH2MarginBottom: '24px', h4MarginBottom: '24px', regularH4MarginBottom: '18.4px' },
  { name: 'mobile', width: 390, height: 844, h4MarginTop: '8px', h4MarginBottom: '13px', regularH4MarginBottom: '10.4px' }
]

for (const viewport of viewports) {
  test(`homepage keeps h2 hierarchy and uses the expected h4 spacing on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(localSite)
    await page.waitForLoadState('networkidle')

    const leapYearHeading = page.getByRole('heading', { level: 2, name: 'LEAP YEAR' })
    const secondH2Heading = page.getByRole('heading', { level: 2, name: '27.9.25-18.1.26' })
    const h4Heading = page.getByRole('heading', { level: 4, name: 'Haegue Yang' })
    const regularH4Heading = page.getByRole('heading', { level: 4, name: 'Instagram' })

    await expect(leapYearHeading).toHaveCount(1)
    await expect(secondH2Heading).toHaveCount(1)
    await expect(h4Heading).toHaveCount(1)
    expect(await h4Heading.evaluate(element => [
      element.previousElementSibling?.previousElementSibling?.tagName,
      element.previousElementSibling?.tagName
    ])).toEqual(['H2', 'H2'])
    await expect(regularH4Heading).toHaveCount(1)
    await expect(h4Heading).toHaveCSS('margin-bottom', viewport.h4MarginBottom)
    await expect(regularH4Heading).toHaveCSS('margin-top', '0px')
    await expect(regularH4Heading).toHaveCSS('margin-bottom', viewport.regularH4MarginBottom)

    if (viewport.secondH2MarginBottom) await expect(secondH2Heading).toHaveCSS('margin-bottom', viewport.secondH2MarginBottom)
    if (viewport.h4MarginTop) await expect(h4Heading).toHaveCSS('margin-top', viewport.h4MarginTop)
  })
}
