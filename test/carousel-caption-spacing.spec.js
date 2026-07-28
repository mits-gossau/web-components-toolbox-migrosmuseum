const { test, expect } = require('@playwright/test')

/* global getComputedStyle */

const localSite = process.env.UMBRACO_BASE_URL
const viewports = [
  { name: 'desktop', width: 1440, height: 900, navPadding: '23px', spacing: 23 },
  { name: 'mobile', width: 390, height: 844, navPadding: '9px', spacing: 13 }
]

for (const viewport of viewports) {
  test(`museum carousel uses caption spacing around visible dots on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}/programm/ausstellungen/disobedience-archive-canopy-for-broken-time`, { waitUntil: 'domcontentloaded' })

    const carousel = page.locator('m-carousel-two[namespace="carousel-two-museum-"]').first()

    await expect.poll(() => carousel.evaluate(carousel => {
      const root = carousel.root || carousel.shadowRoot || carousel
      const nav = root.querySelector('nav')
      const dot = nav && nav.firstElementChild
      const teaser = root.querySelector('section > m-teaser')
      const teaserRoot = teaser && (teaser.root || teaser.shadowRoot || teaser)
      const figcaption = teaserRoot && teaserRoot.querySelector('figcaption')

      if (!nav || !dot || !figcaption) return null

      const carouselRect = carousel.getBoundingClientRect()
      const captionRect = figcaption.getBoundingClientRect()
      const captionStyle = getComputedStyle(figcaption)
      const navStyle = getComputedStyle(nav)
      const dotRect = dot.getBoundingClientRect()
      const pseudoStyle = getComputedStyle(dot, '::before')
      const visibleDotHeight = parseFloat(pseudoStyle.height) || dotRect.height
      const visibleDotInset = (dotRect.height - visibleDotHeight) / 2
      const visibleDotTop = dotRect.top + visibleDotInset
      const visibleDotBottom = visibleDotTop + visibleDotHeight
      const captionContentBottom = captionRect.bottom - parseFloat(captionStyle.paddingBottom)
      const round = value => Math.round(value * 100) / 100

      return {
        captionPaddingBottom: captionStyle.paddingBottom,
        captionPaddingTop: captionStyle.paddingTop,
        captionToDot: round(visibleDotTop - captionContentBottom),
        dotToCarouselEnd: round(carouselRect.bottom - visibleDotBottom),
        navMarginBottom: navStyle.marginBottom,
        navPaddingBottom: navStyle.paddingBottom,
        navPaddingTop: navStyle.paddingTop
      }
    })).toEqual({
      captionPaddingBottom: '0px',
      captionPaddingTop: `${viewport.spacing}px`,
      captionToDot: viewport.spacing,
      dotToCarouselEnd: viewport.spacing,
      navMarginBottom: '0px',
      navPaddingBottom: viewport.navPadding,
      navPaddingTop: viewport.navPadding
    })
  })
}
