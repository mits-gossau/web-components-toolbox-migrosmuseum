const { test, expect } = require('@playwright/test')

/* global getComputedStyle */

const fixture = 'test/fixtures/header-menu-icon-alignment.html'

test('desktop menu icon bars align to the right of their header area', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(fixture)

  const menuIcon = page.locator('[data-test="menu-icon"]')
  const lastBar = menuIcon.locator('.bar3')

  await expect(menuIcon).toBeVisible({ timeout: 30000 })

  const [menuBox, barBox] = await Promise.all([
    menuIcon.boundingBox(),
    lastBar.boundingBox()
  ])
  const layout = await menuIcon.evaluate(menuIcon => {
    const style = getComputedStyle(menuIcon)
    return {
      alignItems: style.alignItems,
      display: style.display,
      flexDirection: style.flexDirection,
      paddingRight: parseFloat(style.paddingRight)
    }
  })

  expect(layout).toMatchObject({
    alignItems: 'flex-end',
    display: 'flex',
    flexDirection: 'column'
  })
  expect(Math.abs(menuBox.x + menuBox.width - layout.paddingRight - barBox.x - barBox.width)).toBeLessThan(1)
})
