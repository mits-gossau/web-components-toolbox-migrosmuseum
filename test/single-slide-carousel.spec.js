const { test, expect } = require('@playwright/test')

/* global getComputedStyle */

const demoPage = 'src/es/components/web-components-toolbox/docs/Template.html?rootFolder=src&css=./src/css/variablesCustom.css&content=./test/fixtures/carousel-slide-count.html'

async function carouselState (carousel) {
  return carousel.evaluate(carousel => {
    const root = carousel.root || carousel.shadowRoot || carousel
    const section = root.querySelector('section')
    const nav = root.querySelector('nav')
    const arrowNav = root.querySelector('.arrow-nav')

    if (!section || !nav || !arrowNav) return null

    return {
      slideCount: section.children.length,
      visibleArrowCount: getComputedStyle(arrowNav).display === 'none' ? 0 : arrowNav.children.length,
      visibleDotCount: getComputedStyle(nav).display === 'none' ? 0 : nav.children.length
    }
  })
}

test('carousel hides navigation only when it has one slide', async ({ page }) => {
  await page.goto(demoPage)

  const singleSlide = page.locator('[data-test="single-slide-carousel"]')
  const multipleSlides = page.locator('[data-test="multiple-slide-carousel"]')

  await expect.poll(() => carouselState(singleSlide)).toEqual({ slideCount: 1, visibleArrowCount: 0, visibleDotCount: 0 })
  await expect.poll(() => carouselState(multipleSlides)).toEqual({ slideCount: 2, visibleArrowCount: 2, visibleDotCount: 2 })
})

test('museum carousel uses compact fully opaque navigation dots', async ({ page }) => {
  await page.goto(demoPage)

  const multipleSlides = page.locator('[data-test="multiple-slide-carousel"]')

  await expect.poll(() => multipleSlides.evaluate(carousel => {
    const root = carousel.root || carousel.shadowRoot || carousel
    const nav = root.querySelector('nav')
    const inactiveDot = nav && Array.from(nav.children).find(dot => !dot.classList.contains('active'))

    if (!nav || !inactiveDot) return null

    const navStyle = getComputedStyle(nav)
    const dotStyle = getComputedStyle(inactiveDot)
    const visibleDotStyle = getComputedStyle(inactiveDot, '::before')

    return {
      gap: navStyle.gap,
      touchTargetHeight: dotStyle.height,
      touchTargetWidth: dotStyle.width,
      opacity: dotStyle.opacity,
      visibleDotBorderWidth: visibleDotStyle.borderWidth,
      visibleDotHeight: visibleDotStyle.height,
      visibleDotWidth: visibleDotStyle.width
    }
  })).toEqual({
    gap: '8px',
    opacity: '1',
    touchTargetHeight: '16px',
    touchTargetWidth: '16px',
    visibleDotBorderWidth: '1px',
    visibleDotHeight: '12px',
    visibleDotWidth: '12px'
  })
})

test('museum carousel aligns compact dots with consistent spacing on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(demoPage)

  const multipleSlides = page.locator('[data-test="multiple-slide-carousel"]')
  const textLeft = await page.locator('[data-test="mobile-text-alignment"]').evaluate(text => text.getBoundingClientRect().left)

  await expect.poll(() => multipleSlides.evaluate((carousel, textLeft) => {
    const root = carousel.root || carousel.shadowRoot || carousel
    const nav = root.querySelector('nav')
    const dots = nav && Array.from(nav.children)
    const activeDot = nav && nav.querySelector('.active')
    const inactiveDot = dots && dots.find(dot => !dot.classList.contains('active'))

    if (!nav || !activeDot || !inactiveDot || dots.length < 2) return null

    const activeTargetStyle = getComputedStyle(activeDot)
    const activeVisibleDotStyle = getComputedStyle(activeDot, '::before')
    const inactiveTargetStyle = getComputedStyle(inactiveDot)
    const firstDotRect = dots[0].getBoundingClientRect()
    const secondDotRect = dots[1].getBoundingClientRect()
    const visibleDotWidth = parseFloat(activeVisibleDotStyle.width)
    const visibleDotInset = (firstDotRect.width - visibleDotWidth) / 2

    return {
      activeTargetBackground: activeTargetStyle.backgroundColor,
      touchTargetHeight: inactiveTargetStyle.height,
      touchTargetWidth: inactiveTargetStyle.width,
      visibleDotBorderWidth: activeVisibleDotStyle.borderWidth,
      visibleDotHeight: activeVisibleDotStyle.height,
      visibleDotTextOffset: Math.round((firstDotRect.left + visibleDotInset - textLeft) * 100) / 100,
      visibleDotSpacing: secondDotRect.left - firstDotRect.left - visibleDotWidth,
      visibleDotWidth: activeVisibleDotStyle.width
    }
  }, textLeft)).toEqual({
    activeTargetBackground: 'rgba(0, 0, 0, 0)',
    touchTargetHeight: '16px',
    touchTargetWidth: '16px',
    visibleDotBorderWidth: '1px',
    visibleDotHeight: '12px',
    visibleDotTextOffset: 0,
    visibleDotSpacing: 4,
    visibleDotWidth: '12px'
  })
})
