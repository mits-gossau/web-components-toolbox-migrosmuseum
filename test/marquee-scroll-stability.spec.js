const { test, expect } = require('@playwright/test')

/* global DOMMatrix, innerWidth, requestAnimationFrame */

const demoPage = 'src/es/components/web-components-toolbox/docs/Template.html?rootFolder=src&css=./src/css/variablesCustom.css&content=./test/fixtures/marquee-resize.html'

test('marquee width measurement keeps its content in document flow', async ({ page }) => {
  await page.goto(demoPage)

  const marquee = page.locator('[data-test="marquee"]')
  await expect.poll(() => marquee.evaluate(element => Boolean(element.root?.querySelector('section')))).toBe(true)

  const measurement = await marquee.evaluate(async element => {
    const section = element.root.querySelector('section')
    const before = {
      position: section.style.position,
      scrollHeight: document.documentElement.scrollHeight
    }

    element.renderCSSByChildrenOffsetWidth()

    const during = {
      position: section.style.position,
      scrollHeight: document.documentElement.scrollHeight
    }

    await new Promise(resolve => requestAnimationFrame(resolve))

    return { before, during }
  })

  expect(measurement.during).toEqual(measurement.before)
})

test('marquee moves 800 pixel wide content across the screen in 15 seconds', async ({ page }) => {
  await page.goto(demoPage)

  const marquee = page.locator('[data-test="marquee"]')
  await expect.poll(() => marquee.evaluate(element => (
    element.root?.querySelector('section > *')?.getAnimations()[0]?.effect.getTiming().duration
  ))).toBe(15000)
})

test('marquee starts half a viewport beyond the left edge', async ({ page }) => {
  await page.goto(demoPage)

  const marquee = page.locator('[data-test="marquee"]')
  await expect.poll(() => marquee.evaluate(element => {
    const animation = element.root?.querySelector('section > *')?.getAnimations()[0]
    const startTransform = animation?.effect.getKeyframes()[0]?.transform
    if (!startTransform) return null

    return new DOMMatrix(startTransform).m41 / innerWidth
  })).toBeCloseTo(0.5, 5)
})
