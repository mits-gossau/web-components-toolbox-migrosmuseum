const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
]

for (const viewport of viewports) {
  test(`homepage feature grid keeps its expected order and paired hover on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(localSite, { waitUntil: 'networkidle' })

    const firstTitle = page.getByRole('heading', { level: 2, name: 'LEAP YEAR' })
    await expect(firstTitle).toBeVisible({ timeout: 30000 })

    const visualOrder = await firstTitle.evaluate(element => {
      const firstCell = element.closest('div[col-lg]')
      const section = firstCell?.parentElement
      if (!section) return []

      const cells = Array.from(section.children)
      const visualOrder = cells
        .map((cell, domIndex) => ({
          domIndex,
          label: cell.querySelector('a-picture')
            ? 'image'
            : cell.querySelector('h2')?.textContent?.trim(),
          order: Number(window.getComputedStyle(cell).order)
        }))
        .sort((a, b) => a.order - b.order || a.domIndex - b.domIndex)
        .map(cell => cell.label)

      return {
        imageRightPaddings: cells
          .filter(cell => cell.querySelector('a-picture'))
          .map(cell => window.getComputedStyle(cell).paddingRight),
        visualOrder
      }
    })

    const expectedOrder = viewport.name === 'mobile'
      ? ['image', 'LEAP YEAR', 'image', 'ACCUMULATION']
      : ['LEAP YEAR', 'image', 'ACCUMULATION', 'image']

    expect(visualOrder.visualOrder).toEqual(expectedOrder)
    if (viewport.name === 'desktop') expect(visualOrder.imageRightPaddings).toEqual(['0px', '0px'])

    if (viewport.name === 'desktop') {
      for (const title of [firstTitle, page.getByRole('heading', { level: 2, name: 'ACCUMULATION' })]) {
        const titleCell = title.locator('xpath=ancestor::div[@col-lg][1]')
        const imageCell = titleCell.locator('xpath=following-sibling::div[1]')
        const readColors = () => title.evaluate(element => ({
          background: window.getComputedStyle(element.closest('div[col-lg]')).backgroundColor,
          text: window.getComputedStyle(element).color
        }))

        await titleCell.hover()
        await page.waitForTimeout(500)
        const titleHoverColors = await readColors()

        await page.mouse.move(viewport.width - 10, 10)
        await page.waitForTimeout(500)
        expect(await readColors()).not.toEqual(titleHoverColors)

        await imageCell.hover()
        await page.waitForTimeout(500)
        expect(await readColors()).toEqual(titleHoverColors)
      }
    }
  })
}
