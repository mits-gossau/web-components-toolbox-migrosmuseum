const { test, expect } = require('@playwright/test')

const localSite = process.env.UMBRACO_BASE_URL
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
]
const twoColumnPages = [
  { name: 'homepage', path: '/' },
  { name: 'visit page', path: '/besuch' },
  { name: 'museum page', path: '/museum' },
  { name: 'collection page', path: '/sammlung' },
  { name: 'agenda detail page', path: '/programm/agenda/eroeffnung-accumulation' }
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

  test(`homepage news grid matches visit page spacing on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(localSite, { waitUntil: 'domcontentloaded' })

    const heading = page.getByRole('heading', { name: 'Yasmin Naderi Afschar neu in der Co-Leitung', exact: true }).first()
    await expect(heading).toBeAttached({ timeout: 30000 })

    const spacing = await heading.evaluate(element => {
      const firstCell = element.closest('.richText').parentElement
      const secondCell = firstCell.nextElementSibling
      const styles = window.getComputedStyle(secondCell)
      const rootFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize)
      return {
        contentSpacing: parseFloat(styles.getPropertyValue('--content-spacing')) * rootFontSize,
        left: parseFloat(styles.paddingLeft),
        right: parseFloat(styles.paddingRight)
      }
    })

    if (viewport.name === 'mobile') {
      expect(spacing.right).toBeCloseTo(spacing.left, 2)
    } else {
      expect(spacing.left).toBe(0)
      expect(spacing.right).toBeCloseTo(spacing.contentSpacing, 2)
    }
  })
}

for (const target of twoColumnPages) {
  for (const viewport of viewports) {
    test(`${target.name} balances every 6/6 grid cell on ${viewport.name}`, async ({ page }) => {
      test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

      await page.setViewportSize(viewport)
      await page.goto(`${localSite}${target.path}`, { waitUntil: 'commit' })

      const grids = page.locator('o-grid')
      await expect.poll(() => grids.evaluateAll(elements => elements.some(element => {
        const section = element.shadowRoot?.querySelector('section') || element.querySelector(':scope > section')
        return Array.from(section?.children || []).filter(cell => (
          cell.getAttribute('col-lg') === '6' && cell.getAttribute('col-md') === '6'
        )).length >= 2
      }))).toBe(true)
      await expect.poll(() => grids.evaluateAll((elements, mobile) => elements.every(element => {
        const section = element.shadowRoot?.querySelector('section') || element.querySelector(':scope > section')
        const cells = Array.from(section?.children || []).filter(cell => (
          cell.getAttribute('col-lg') === '6' && cell.getAttribute('col-md') === '6'
        ))
        if (cells.length < 2) return true

        return cells.every(cell => {
          const styles = window.getComputedStyle(cell)
          if (mobile) return Math.abs(parseFloat(styles.paddingRight) - parseFloat(styles.paddingLeft)) < 0.01

          const contentChildren = Array.from(cell.children).filter(child => child.localName !== 'style')
          const pictureOnly = contentChildren.length === 1 && contentChildren[0].localName === 'a-picture'
          return pictureOnly || parseFloat(styles.paddingRight) > 0
        })
      }), viewport.name === 'mobile'), { timeout: 30000 }).toBe(true)

      const gridSpacing = await grids.evaluateAll(elements => elements.flatMap(element => {
        const section = element.shadowRoot?.querySelector('section') || element.querySelector(':scope > section')
        const cells = Array.from(section?.children || []).filter(cell => (
          cell.getAttribute('col-lg') === '6' && cell.getAttribute('col-md') === '6'
        ))
        if (cells.length < 2) return []

        const cellSpacing = cells.map(cell => {
          const styles = window.getComputedStyle(cell)
          return {
            left: parseFloat(styles.paddingLeft),
            right: parseFloat(styles.paddingRight)
          }
        })
        return [{
          desktop: Math.max(...cellSpacing.map(spacing => spacing.left)),
          cells: cells.map((cell, index) => {
            const contentChildren = Array.from(cell.children).filter(child => child.localName !== 'style')
            return {
              left: cellSpacing[index].left,
              pictureOnly: contentChildren.length === 1 && contentChildren[0].localName === 'a-picture',
              right: cellSpacing[index].right
            }
          })
        }]
      }))

      for (const grid of gridSpacing) {
        for (const [index, padding] of grid.cells.entries()) {
          if (viewport.name === 'mobile') {
            expect(padding.right).toBeCloseTo(padding.left, 2)
          } else {
            if (index % 2 === 1) expect(padding.left).toBe(0)
            expect(padding.right).toBeCloseTo(padding.pictureOnly ? 0 : grid.desktop, 2)
          }
        }
      }
    })
  }
}
