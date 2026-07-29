const { test, expect } = require('@playwright/test')

/* global getComputedStyle */

const demoPage = 'src/es/components/web-components-toolbox/docs/Template.html?rootFolder=src&css=./src/css/variablesCustom.css&nav=./src/es/components/molecules/navigation/default-/default-.html'
const localSite = process.env.UMBRACO_BASE_URL

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
      firstSummaryPaddingTop: getComputedStyle(details.shadowRoot.querySelector('.summary.icon')).paddingTop,
      summary: transitionForPart('summary'),
      content: transitionForPart('content'),
      children: Array.from(details.shadowRoot.querySelectorAll('[part="content-child"]'))
        .map(child => getComputedStyle(child).transition)
    }
  })

  expect(transitions.item).toContain('transform')
  expect(transitions.firstSummaryPaddingTop).toBe('15px')
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

test('mobile language switcher uses compact text', async ({ page }) => {
  test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(localSite, { waitUntil: 'domcontentloaded' })

  const navigation = page.locator('m-navigation')
  await navigation.waitFor({ state: 'attached' })
  await expect.poll(() => navigation.evaluate(navigation => (
    navigation.shadowRoot?.querySelectorAll('ul.language-switcher .font-size-h1').length || 0
  ))).toBeGreaterThan(0)

  await expect.poll(() => navigation.evaluate(navigation => (
    Array.from(navigation.shadowRoot.querySelectorAll('ul.language-switcher .font-size-h1'))
      .every(link => {
        const styles = getComputedStyle(link)
        return styles.fontSize === '19px' && styles.marginLeft === '3px'
      })
  ))).toBe(true)

  const lastUtilityItem = await navigation.evaluate(navigation => {
    const item = navigation.shadowRoot.querySelector('ul.language-switcher > li:last-child')
    return {
      marginTop: getComputedStyle(item).marginTop,
      text: item.textContent.trim()
    }
  })

  expect(lastUtilityItem.marginTop).toBe('20px')
  expect(lastUtilityItem.text).toContain('SHOP')
})

test('mobile second navigation level uses a five pixel gap', async ({ page }) => {
  test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(localSite, { waitUntil: 'domcontentloaded' })

  const navigation = page.locator('m-navigation')
  await navigation.waitFor({ state: 'attached' })
  await expect.poll(() => navigation.evaluate(navigation => (
    navigation.shadowRoot
      ?.querySelector('nav > ul:first-of-type m-details')
      ?.shadowRoot?.querySelectorAll('[part="content-child"]').length || 0
  ))).toBeGreaterThan(1)

  const contentStyle = await navigation.evaluate(navigation => {
    const details = navigation.shadowRoot.querySelector('nav > ul:first-of-type m-details')
    const styles = getComputedStyle(details.shadowRoot.querySelector('[part="content"]'))
    return { display: styles.display, gap: styles.gap }
  })

  expect(contentStyle).toEqual({ display: 'flex', gap: '5px' })
})

test('mobile first navigation level uses balanced summary padding', async ({ page }) => {
  test.skip(!localSite, 'Set UMBRACO_BASE_URL to run tests against the local Umbraco site')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(localSite, { waitUntil: 'domcontentloaded' })

  const navigation = page.locator('m-navigation')
  await navigation.waitFor({ state: 'attached' })
  await expect.poll(() => navigation.evaluate(navigation => Boolean(
    navigation.shadowRoot
      ?.querySelector('nav > ul:first-of-type m-details')
      ?.shadowRoot?.querySelector('.summary.icon')
  ))).toBe(true)

  const padding = await navigation.evaluate(navigation => {
    const details = navigation.shadowRoot.querySelector('nav > ul:first-of-type m-details')
    const styles = getComputedStyle(details.shadowRoot.querySelector('.summary.icon'))
    return {
      customProperty: getComputedStyle(details).getPropertyValue('--details-shadow-summary-padding').trim(),
      top: styles.paddingTop,
      bottom: styles.paddingBottom
    }
  })

  expect(padding.customProperty).toBe('1.12em 0 1.12em')
  expect(padding.bottom).toBe(padding.top)
})
