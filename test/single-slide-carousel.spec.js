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

test('museum carousel uses large fully opaque navigation dots', async ({ page }) => {
  await page.goto(demoPage)

  const multipleSlides = page.locator('[data-test="multiple-slide-carousel"]')

  await expect.poll(() => multipleSlides.evaluate(carousel => {
    const root = carousel.root || carousel.shadowRoot || carousel
    const nav = root.querySelector('nav')
    const inactiveDot = nav && Array.from(nav.children).find(dot => !dot.classList.contains('active'))

    if (!nav || !inactiveDot) return null

    const navStyle = getComputedStyle(nav)
    const dotStyle = getComputedStyle(inactiveDot)

    return {
      gap: navStyle.gap,
      height: dotStyle.height,
      opacity: dotStyle.opacity,
      width: dotStyle.width
    }
  })).toEqual({ gap: '8px', height: '20px', opacity: '1', width: '20px' })
})

test('museum carousel uses compact dots with accessible touch targets on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(demoPage)

  const multipleSlides = page.locator('[data-test="multiple-slide-carousel"]')

  await expect.poll(() => multipleSlides.evaluate(carousel => {
    const root = carousel.root || carousel.shadowRoot || carousel
    const nav = root.querySelector('nav')
    const inactiveDot = nav && Array.from(nav.children).find(dot => !dot.classList.contains('active'))

    if (!nav || !inactiveDot) return null

    const touchTargetStyle = getComputedStyle(inactiveDot)
    const visibleDotStyle = getComputedStyle(inactiveDot, '::before')

    return {
      gap: getComputedStyle(nav).gap,
      touchTargetHeight: touchTargetStyle.height,
      touchTargetWidth: touchTargetStyle.width,
      visibleDotHeight: visibleDotStyle.height,
      visibleDotWidth: visibleDotStyle.width
    }
  })).toEqual({
    gap: '8px',
    touchTargetHeight: '24px',
    touchTargetWidth: '24px',
    visibleDotHeight: '14px',
    visibleDotWidth: '14px'
  })
})
