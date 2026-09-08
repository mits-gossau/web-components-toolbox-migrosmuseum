const { test, expect } = require('@playwright/test')

/* global getComputedStyle */

const demoPage = 'src/es/components/web-components-toolbox/docs/Template.html?rootFolder=src&css=./src/css/variablesCustom.css&content=./test/fixtures/rich-text-lists.html'
const localSite = process.env.UMBRACO_BASE_URL

test('rich text lists align with 25 pixel indentation', async ({ page }) => {
  await page.goto(demoPage)
  await page.waitForLoadState('networkidle')

  const lists = page.locator('[data-test$="-list"]')
  await expect(lists).toHaveCount(2)

  const paddingLeft = await lists.evaluateAll(elements => (
    elements.map(element => getComputedStyle(element).paddingLeft)
  ))

  expect(paddingLeft).toEqual(['25px', '25px'])
})

test('rich text list margins are explicit on desktop and mobile', async ({ page }) => {
  test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport)
    await page.goto(`${localSite}/programm/ausstellungen/disobedience-archive-canopy-for-broken-time`)
    await page.waitForLoadState('networkidle')

    const richText = page.locator('.richText').filter({ hasText: 'Aufzählung 1' })
    const listMargins = await richText.locator('ul, ol').evaluateAll(elements => (
      elements.map(element => getComputedStyle(element).marginLeft)
    ))

    expect(listMargins).toEqual(['0px', '0px'])
  }
})

test('bullet and decimal markers share the same left edge and text column', async ({ page }) => {
  test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport)
    await page.goto(`${localSite}/programm/ausstellungen/disobedience-archive-canopy-for-broken-time`)
    await page.waitForLoadState('networkidle')

    const richText = page.locator('.richText').filter({ hasText: 'Aufzählung 1' })
    const alignment = await richText.locator('ul > li:first-child, ol > li:first-child').evaluateAll(elements => (
      elements.map(element => {
        const marker = getComputedStyle(element, '::before')
        const text = element.querySelector('p')

        return {
          itemPaddingLeft: getComputedStyle(element).paddingLeft,
          markerContent: marker.content,
          markerFontSize: marker.fontSize,
          markerLeft: element.getBoundingClientRect().x + parseFloat(marker.left),
          markerTop: marker.top,
          paddingLeft: getComputedStyle(element.parentElement).paddingLeft,
          textLeft: text.getBoundingClientRect().x,
          textMarkerGap: text.getBoundingClientRect().x - (element.getBoundingClientRect().x + parseFloat(marker.left))
        }
      })
    ))

    expect(alignment[0].markerContent).toBe('"•"')
    expect(alignment[1].markerContent).toContain('counter(rich-text-list-item)')
    expect(alignment.map(item => item.markerFontSize)).toEqual(['16px', '16px'])
    expect(alignment.map(item => item.markerTop)).toEqual(['1px', '2px'])
    expect(alignment.map(item => item.paddingLeft)).toEqual(['15px', '15px'])
    expect(alignment.map(item => item.itemPaddingLeft)).toEqual(['0px', '0px'])
    expect(alignment.map(item => item.textMarkerGap)).toEqual([15, 15])
    expect(Math.abs(alignment[0].markerLeft - alignment[1].markerLeft)).toBeLessThan(0.1)
    expect(Math.abs(alignment[0].textLeft - alignment[1].textLeft)).toBeLessThan(0.1)
  }
})
