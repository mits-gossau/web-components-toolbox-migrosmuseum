const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL

test('exhibition work list link uses a textual arrow without an icon component', async ({ page }) => {
  test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

  await page.goto(`${localSite}/programm/ausstellungen/disobedience-archive-canopy-for-broken-time`, { waitUntil: 'domcontentloaded' })

  const workListLink = page.locator('migrosmuseum-a-link').filter({ hasText: 'Werkliste' })
  await expect(workListLink).toHaveCount(1)

  await expect.poll(() => workListLink.evaluate(link => {
    const iconCount = (link.shadowRoot || link).querySelectorAll('a-icon-mdx').length
    const text = link.textContent.replace(/\s+/g, ' ').trim()

    return { iconCount, text }
  })).toEqual({ iconCount: 0, text: '→ Werkliste' })
})
