const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
]

for (const viewport of viewports) {
  test(`visit page uses balanced two-column grid spacing on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}/besuch`, { waitUntil: 'domcontentloaded' })

    const grids = page.locator('#content o-grid o-grid')
    await expect(grids.first()).toBeAttached()
    await expect.poll(
      () => grids.evaluateAll(elements => elements.length > 0 && elements.every(element => !element.hidden)),
      { timeout: 30000 }
    ).toBe(true)
    await expect.poll(
      () => grids.evaluateAll(elements => elements.some(element => {
        const section = element.shadowRoot?.querySelector('section') || element.querySelector(':scope > section')
        return Array.from(section.children).some(cell => parseFloat(window.getComputedStyle(cell).paddingLeft) > 0)
      })),
      { timeout: 30000 }
    ).toBe(true)

    const gridSpacing = await grids.evaluateAll(elements => elements.map(element => {
      const section = element.shadowRoot?.querySelector('section') || element.querySelector(':scope > section')
      const rootFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize)
      return {
        desktop: parseFloat(window.getComputedStyle(element).getPropertyValue('--content-spacing')) * rootFontSize,
        cells: Array.from(section.children, cell => {
          const styles = window.getComputedStyle(cell)
          const contentChildren = Array.from(cell.children).filter(child => child.localName !== 'style')
          return {
            left: parseFloat(styles.paddingLeft),
            pictureOnly: contentChildren.length === 1 && contentChildren[0].localName === 'a-picture',
            right: parseFloat(styles.paddingRight)
          }
        })
      }
    }))

    if (viewport.name === 'mobile') {
      for (const grid of gridSpacing) {
        for (const padding of grid.cells) expect(padding.right).toBeCloseTo(padding.left, 2)
      }
    } else {
      for (const grid of gridSpacing) {
        for (let index = 1; index < grid.cells.length; index += 2) {
          expect(grid.cells[index].left).toBe(0)
          if (grid.cells[index].pictureOnly) {
            expect(grid.cells[index].right).toBe(0)
          } else {
            expect(grid.cells[index].right).toBeCloseTo(grid.desktop, 2)
          }
        }
      }
    }
  })
}
