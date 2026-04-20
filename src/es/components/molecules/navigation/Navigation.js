// @ts-check
import Navigation from '../../web-components-toolbox/src/es/components/molecules/navigation/Navigation.js'

/* global self */
/* global CustomEvent */

/**
 * Navigation hosts uls
 * Example at: /src/es/components/pages/Home.html
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class Navigation
 * @type {CustomElementConstructor}
 * @attribute {
 *  {boolean} [hover=false]
 *  {boolean} [hit-area=true] this lets you define a hit-area of your link, to avoid too large focus (hit-area) by fonts too large line-height, which can't be overwritten with css: https://github.com/mits-gossau/web-components-cms-template/issues/53
 *  {boolean} [focus-lost-close=false] tell it to close when focus is lost
 * }
 * @css {
 *  --content-spacing [40px]
 *  --a-link-content-spacing [0]
 *  --a-link-font-size [1rem]
 *  --background-color [black]
 *  --list-style [none]
 *  --align-items [start]
 *  --min-width [100px] of list items at second level
 *  --padding-top [6px] first list item at second level
 *  --hr-color [white]
 *  --a-link-font-size-mobile [2rem]
 *  --font-weight-mobile [normal]
 *  --a-link-text-align-mobile [center]
 *  --justify-content-mobile [center]
 *  --a-arrow-color-hover [--color-hover, white]
 *  --a-arrow-color [#777]
 *  --min-height-mobile [50px]
 *  --min-width-mobile [50px]
 * }
 */
export default class MigrosmuseumNavigation extends Navigation {
  constructor (options = {}, ...args) {
    super(options, ...args)

    let mouseoutListenerTimeoutId = null
    this.mouseoverListener = event => {
      clearTimeout(mouseoutListenerTimeoutId)
      if (!this.hasAttribute('mouse-over')) {
        this.customStyle.textContent = Array.from(this.root.querySelectorAll('nav > ul:first-of-type > li')).reduce((acc, curr, i) => {
          const currBoundingClientRect = curr.getBoundingClientRect()
          return /* css */`
            ${acc}
            :host > nav > ul:first-of-type > li:nth-child(${i + 1}) {
              bottom: ${(self.innerHeight - currBoundingClientRect.bottom).toFixed(2)}px;
              left: ${currBoundingClientRect.left.toFixed(2)}px;
            }
          `
        }, '') + Array.from(this.root.querySelectorAll('nav > ul')).reduce((acc, curr, i) => {
          const currBoundingClientRect = curr.getBoundingClientRect()
          return /* css */`
            ${acc}
            :host > nav > ul:nth-child(${i + 1}) {
              bottom: ${(self.innerHeight - currBoundingClientRect.bottom).toFixed(2)}px;
              left: ${currBoundingClientRect.left.toFixed(2)}px;
            }
          `
        }, '')
        this.setAttribute('mouse-over', '')
        console.log('***mouseoverListener******', event, this.customStyle.textContent)
      }
    }

    this.mouseoutListener = event => {
      clearTimeout(mouseoutListenerTimeoutId)
      mouseoutListenerTimeoutId = setTimeout(() => {
        console.log('***mouseoutListener******', event)
        this.customStyle.textContent = ''
        this.removeAttribute('mouse-over')
      }, 50)
    }
  }

  connectedCallback () {
    super.connectedCallback()
    this.root.querySelector('nav > ul').addEventListener('mouseover', this.mouseoverListener)
    this.root.querySelector('nav > ul').addEventListener('mouseout', this.mouseoutListener)
    this.html = this.customStyle
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    this.root.querySelector('nav > ul').removeEventListener('mouseover', this.mouseoverListener)
    this.root.querySelector('nav > ul').removeEventListener('mouseout', this.mouseoutListener)
  }

  /**
   * renders the m-navigation css
   *
   * @return {Promise<void>|void}
   */
  renderCSS () {
    const result = super.renderCSS()
    this.css = /* css */`
      :host {
        --details-shadow-summary-transform-hover: none;
      }
      :host > nav > ul:first-of-type {
        --color-hover: var(--color);
      }
      :host([mouse-over]) nav > ul:not(:first-of-type) {
        position: absolute;
        width: 100%;
      }
      :host([mouse-over]) nav > ul:first-of-type > li {
        position: absolute;
      }
      :host([mouse-over]) nav > ul:first-of-type > li, :host([mouse-over]) nav > ul:first-of-type > li > *::part(summary) {
        transition: transform 0.25s ease-in-out;
      }
      :host([mouse-over]) nav > ul:first-of-type > li:has(+ li:hover), :host([mouse-over]) nav > ul:first-of-type > li:hover > *::part(summary) {
        transform: translateY(-1em);
      }
      :host([mouse-over]) nav > ul:first-of-type > li > *::part(summary) {
        transition: transform 0.25s ease-in-out;
      }
      :host([mouse-over]) nav > ul:first-of-type > li:has(+ li:hover) > *::part(summary) {
        transform: translateY(1em);
      }
    `
    return result
  }

  get customStyle () {
    return this._customStyle || (this._customStyle = (() => {
      const style = document.createElement('style')
      style.setAttribute('protected', 'true')
      return style
    })())
  }
}
