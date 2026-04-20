// @ts-check
import Navigation from '../../web-components-toolbox/src/es/components/molecules/navigation/Navigation.js'

/* global self */
/* global CustomEvent */

/**
 * MigrosmuseumNavigation is mainly for the li hover up animation like file drawer
 */
export default class MigrosmuseumNavigation extends Navigation {
  constructor (options = {}, ...args) {
    super(options, ...args)

    this.translateY = '1em'

    // timeout because the mouse-over reacts on each li element hover separately even though we listen on the ul
    let mouseoverListenerTimeoutId = null
    let mouseoutListenerTimeoutId = null
    this.mouseoverListener = event => {
      clearTimeout(mouseoverListenerTimeoutId)
      clearTimeout(mouseoutListenerTimeoutId)
      mouseoverListenerTimeoutId = setTimeout(() => {
        if (!this.hasAttribute('mouse-over') && !this.hasAttribute('mouse-over-dialog-opening-closing')) {
          this.setCustomStyle() // set all li elements position absolute with current coordinates to make them static for hover animation
          this.setAttribute('mouse-over', '')
        }
      }, 50)
    }

    this.mouseoutListener = event => {
      clearTimeout(mouseoutListenerTimeoutId)
      clearTimeout(mouseoverListenerTimeoutId)
      mouseoutListenerTimeoutId = setTimeout(() => {
        this.customStyle.textContent = ''
        this.removeAttribute('mouse-over')
      }, 50)
    }

    let animationendListener
    this.dialogOpenCloseListener = event => {
      const hasAttributeMouseOver = this.hasAttribute('mouse-over')
      if (hasAttributeMouseOver) {
        this.setAttribute('mouse-over-dialog-opening-closing', '')
        this.removeAttribute('mouse-over')
      }
      this.customStyle.textContent = ''
      if (animationendListener) this.removeEventListener('animationend', animationendListener)
      this.addEventListener('animationend', (animationendListener = event => {
        let thisLi
        if ((thisLi = event.composedPath().find(el => el.tagName === 'LI')) && thisLi.previousElementSibling) {
          this.setCustomStyle({ adjust: this.translateY, target: thisLi.previousElementSibling })
        } else {
          this.setCustomStyle()
        }
        if (hasAttributeMouseOver) {
          this.setAttribute('mouse-over', '')
          this.removeAttribute('mouse-over-dialog-opening-closing')
        }
      }, {once: true}))
    }
  }

  connectedCallback () {
    super.connectedCallback()
    const ul = this.root.querySelector('nav > ul')
    ul.addEventListener('mouseover', this.mouseoverListener)
    ul.addEventListener('mouseout', this.mouseoutListener)
    this.addEventListener('open', this.dialogOpenCloseListener)
    this.addEventListener('close', this.dialogOpenCloseListener)
    this.html = this.customStyle
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    const ul = this.root.querySelector('nav > ul')
    ul.removeEventListener('mouseover', this.mouseoverListener)
    ul.removeEventListener('mouseout', this.mouseoutListener)
    this.removeEventListener('open', this.dialogOpenCloseListener)
    this.removeEventListener('close', this.dialogOpenCloseListener)
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
      :host nav > ul:first-of-type > li,
      :host nav > ul:first-of-type > li > *::part(summary),
      :host nav > ul:first-of-type > li > *::part(content),
      :host nav > ul:first-of-type > li > *::part(content-child) {
        transition: transform 0.25s ease-in-out;
      }
      :host(:where([mouse-over], [mouse-over-dialog-opening-closing])) nav > ul:first-of-type > li:has(+ li:hover),
      :host(:where([mouse-over], [mouse-over-dialog-opening-closing])) nav > ul:first-of-type > li:hover > *::part(summary) {
        transform: translateY(-${this.translateY});
      }
      :host(:where([mouse-over], [mouse-over-dialog-opening-closing])) nav > ul:first-of-type > li:has(+ li:hover) > *::part(summary),
      :host(:where([mouse-over], [mouse-over-dialog-opening-closing])) nav > ul:first-of-type > li:has(+ li:hover) > *::part(content) {
        transform: translateY(${this.translateY});
      }
      :host(:where([mouse-over], [mouse-over-dialog-opening-closing])) nav > ul:first-of-type > li:hover > *::part(content-child):hover {
        transform: translateY(-0.15em);
      }
    `
    return result
  }

  setCustomStyle (options = {}) {
    const { adjust, target } = options
    this.customStyle.textContent = Array.from(this.root.querySelectorAll('nav > ul:first-of-type > li')).reduce((acc, curr, i) => {
      const currBoundingClientRect = curr.getBoundingClientRect()
      return /* css */`
        ${acc}
        :host > nav > ul:first-of-type > li:nth-child(${i + 1}) {
          bottom: calc(${(self.innerHeight - currBoundingClientRect.bottom).toFixed(2)}px - ${curr === target ? adjust || '0px' : '0px'});
          left: 0;
        }
      `
    }, '') + Array.from(this.root.querySelectorAll('nav > ul')).reduce((acc, curr, i) => {
      const currBoundingClientRect = curr.getBoundingClientRect()
      return /* css */`
        ${acc}
        :host > nav > ul:nth-child(${i + 1}) {
          bottom: ${(self.innerHeight - currBoundingClientRect.bottom).toFixed(2)}px;
          left: 0;
        }
      `
    }, '')
  }

  get customStyle () {
    return this._customStyle || (this._customStyle = (() => {
      const style = document.createElement('style')
      style.setAttribute('protected', 'true')
      return style
    })())
  }
}
