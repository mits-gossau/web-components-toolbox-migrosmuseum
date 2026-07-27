const { test, expect } = require('@playwright/test')

/* global getComputedStyle */

const demoPage = 'src/es/components/web-components-toolbox/docs/Template.html?rootFolder=src&css=./src/css/variablesCustom.css&content=./test/fixtures/rich-text-lists.html'
const localSite = process.env.UMBRACO_BASE_URL

async function markerLeft (cdp, listItemText) {
  const result = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      let listItem
      const walk = root => {
        for (const element of root.querySelectorAll('*')) {
          if (element.shadowRoot) walk(element.shadowRoot)
          if (element.tagName === 'LI' && element.textContent.trim().startsWith(${JSON.stringify(listItemText)})) listItem = element
        }
      }
      walk(document)
      return listItem
    })()`,
    returnByValue: false
  })
  const tree = await cdp.send('Accessibility.getPartialAXTree', {
    objectId: result.result.objectId,
    fetchRelatives: true
  })
  const marker = tree.nodes.find(node => node.role?.value === 'ListMarker')
  const box = await cdp.send('DOM.getBoxModel', { backendNodeId: marker.backendDOMNodeId })

  return box.model.border[0]
}

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

test('mobile rich text list markers align with surrounding text', async ({ page }) => {
  test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${localSite}/programm/ausstellungen/disobedience-archive-canopy-for-broken-time`)
  await page.waitForLoadState('networkidle')

  const richText = page.locator('.richText').filter({ hasText: 'Aufzählung 1' })
  const referenceLeft = await richText.locator('p').first().evaluate(element => element.getBoundingClientRect().x)
  const cdp = await page.context().newCDPSession(page)

  await cdp.send('Accessibility.enable')
  await cdp.send('DOM.enable')

  const markerPositions = await Promise.all([
    markerLeft(cdp, 'Aufzählung 1'),
    markerLeft(cdp, 'Nummerierung 1')
  ])

  await cdp.detach()

  for (const position of markerPositions) {
    expect(Math.abs(position - referenceLeft)).toBeLessThan(3.1)
  }
})
