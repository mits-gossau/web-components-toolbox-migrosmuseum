const { test, expect } = require('@playwright/test')

/* global getComputedStyle */

const demoPage = 'src/es/components/web-components-toolbox/docs/Template.html?rootFolder=src&css=./src/css/variablesCustom.css&content=./test/fixtures/carousel-slide-count.html'

async function carouselState (carousel) {
  return carousel.evaluate(carousel => {
    const root = carousel.root || carousel.shadowRoot || carousel
    const section = root.querySelector('section')
    const nav = root.querySelector('nav')

    if (!section || !nav) return null

    return {
      slideCount: section.children.length,
      visibleDotCount: getComputedStyle(nav).display === 'none' ? 0 : nav.children.length
    }
  })
}

test('carousel hides dot navigation only when it has one slide', async ({ page }) => {
  await page.goto(demoPage)

  const singleSlide = page.locator('[data-test="single-slide-carousel"]')
  const multipleSlides = page.locator('[data-test="multiple-slide-carousel"]')

  await expect.poll(() => carouselState(singleSlide)).toEqual({ slideCount: 1, visibleDotCount: 0 })
  await expect.poll(() => carouselState(multipleSlides)).toEqual({ slideCount: 2, visibleDotCount: 2 })
})
