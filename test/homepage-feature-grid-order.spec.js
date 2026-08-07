const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
]

for (const viewport of viewports) {
  test(`homepage feature grid shows each image before its title on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(localSite, { waitUntil: 'networkidle' })

    const firstTitle = page.getByRole('heading', { level: 2, name: 'LEAP YEAR' })
    await expect(firstTitle).toBeVisible({ timeout: 30000 })

    const visualOrder = await firstTitle.evaluate(element => {
      const firstCell = element.closest('div[col-lg]')
      const section = firstCell?.parentElement
      if (!section) return []

      return Array.from(section.children)
        .map((cell, domIndex) => ({
          domIndex,
          label: cell.querySelector('a-picture')
            ? 'image'
            : cell.querySelector('h2')?.textContent?.trim(),
          order: Number(window.getComputedStyle(cell).order)
        }))
        .sort((a, b) => a.order - b.order || a.domIndex - b.domIndex)
        .map(cell => cell.label)
    })

    expect(visualOrder).toEqual(['image', 'LEAP YEAR', 'image', 'ACCUMULATION'])
  })
}
