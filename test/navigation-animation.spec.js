const { test, expect } = require('@playwright/test')

/* global getComputedStyle */

const demoPage = 'src/es/components/web-components-toolbox/docs/Template.html?rootFolder=src&css=./src/css/variablesCustom.css&nav=./src/es/components/molecules/navigation/default-/default-.html'

test('desktop navigation animates level one only', async ({ page }) => {
  await page.goto(demoPage)
  const navigation = page.locator('m-navigation')
  await navigation.waitFor()

  const transitions = await navigation.evaluate(navigation => {
    const firstLevelItem = navigation.shadowRoot.querySelector('nav > ul:first-of-type > li')
    const details = firstLevelItem.querySelector('m-details')
    const transitionForPart = part => getComputedStyle(details.shadowRoot.querySelector(`[part="${part}"]`)).transition

    return {
      item: getComputedStyle(firstLevelItem).transition,
      summary: transitionForPart('summary'),
      content: transitionForPart('content'),
      children: Array.from(details.shadowRoot.querySelectorAll('[part="content-child"]'))
        .map(child => getComputedStyle(child).transition)
    }
  })

  expect(transitions.item).toContain('transform')
  expect(transitions.summary).toContain('transform')
  expect(transitions.content).toContain('transform')
  expect(transitions.children).not.toHaveLength(0)
  expect(transitions.children).toEqual(transitions.children.map(() => 'none'))

  await navigation.evaluate(navigation => navigation.setAttribute('mouse-over', ''))
  const secondFirstLevelItem = navigation.locator('nav > ul:first-of-type > li').nth(1)
  await secondFirstLevelItem.hover()

  const summaryTransform = await secondFirstLevelItem.locator('m-details').evaluate(details => (
    getComputedStyle(details.shadowRoot.querySelector('[part="summary"]')).transform
  ))

  expect(summaryTransform).not.toBe('none')
})
