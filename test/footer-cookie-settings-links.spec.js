const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL
const regularLinks = [
  { name: 'Impressum', path: '/impressum' },
  { name: 'Rechtliches', path: '/rechtliches' },
  { name: 'Datenschutz', path: '/datenschutz' }
]

test('only the cookie settings footer link opens OneTrust', async ({ page }) => {
  test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

  await page.goto(localSite)
  await page.waitForLoadState('networkidle')

  for (const regularLink of regularLinks) {
    const link = page.getByRole('link', { name: regularLink.name, exact: true })
    await expect(link).not.toHaveAttribute('data-one-trust-settings')

    await Promise.all([
      page.waitForURL(url => url.pathname === regularLink.path),
      link.evaluate(element => element.click())
    ])

    await page.goto(localSite)
    await page.waitForLoadState('networkidle')
  }

  await page.evaluate(() => {
    window.__oneTrustToggleCount = 0
    window.OneTrust = {
      ToggleInfoDisplay: () => { window.__oneTrustToggleCount++ }
    }
  })

  const cookieSettingsLink = page.getByRole('link', { name: 'Cookie-Einstellungen', exact: true })
  await expect(cookieSettingsLink).toHaveAttribute('data-one-trust-settings', 'True')
  await cookieSettingsLink.evaluate(element => element.click())

  await expect.poll(() => page.evaluate(() => window.__oneTrustToggleCount)).toBe(1)
  await expect(page).toHaveURL(localSite)
})
