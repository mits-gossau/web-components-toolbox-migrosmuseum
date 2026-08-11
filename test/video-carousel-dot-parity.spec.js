const { test, expect } = require('@playwright/test')

/* global getComputedStyle */

const localSite = process.env.UMBRACO_BASE_URL
const detailPath = '/programm/ausstellungen/disobedience-archive-canopy-for-broken-time'

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
]) {
  test(`video carousel dots match image carousel dots on ${viewport.name}`, async ({ page }) => {
    test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

    await page.setViewportSize(viewport)
    await page.goto(`${localSite}${detailPath}`, { waitUntil: 'domcontentloaded' })

    const dotStyles = async namespace => page.locator(`m-carousel-two[namespace="${namespace}"]`).first().evaluate(carousel => {
      const root = carousel.root || carousel.shadowRoot || carousel
      const dots = [...root.querySelectorAll('nav > *')]
      const activeDot = dots.find(dot => dot.classList.contains('active'))
      const inactiveDot = dots.find(dot => !dot.classList.contains('active'))

      if (!activeDot || !inactiveDot) return null

      const stylesFor = dot => {
        const style = getComputedStyle(dot)
        const pseudoStyle = getComputedStyle(dot, '::before')

        return {
          backgroundIsTransparent: style.backgroundColor === 'rgba(0, 0, 0, 0)',
          borderStyle: style.borderStyle,
          borderWidth: style.borderWidth,
          height: style.height,
          opacity: style.opacity,
          pseudoBackgroundIsTransparent: pseudoStyle.backgroundColor === 'rgba(0, 0, 0, 0)',
          pseudoBorderStyle: pseudoStyle.borderStyle,
          pseudoBorderWidth: pseudoStyle.borderWidth,
          pseudoHeight: pseudoStyle.height,
          pseudoWidth: pseudoStyle.width,
          width: style.width
        }
      }

      return {
        active: stylesFor(activeDot),
        inactive: stylesFor(inactiveDot)
      }
    })

    await expect.poll(() => dotStyles('carousel-two-museum-'), { timeout: 30000 }).not.toBeNull()
    const imageDotStyles = await dotStyles('carousel-two-museum-')

    await expect.poll(() => dotStyles('carousel-two-video-museum-'), { timeout: 30000 }).toEqual(
      imageDotStyles
    )
  })
}
