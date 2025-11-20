// @ts-check
import Header from '../../web-components-toolbox/src/es/components/organisms/header/Header.js'

/* global self */
/* global MutationObserver */
/* global CustomEvent */

/**
 * Header migrosmuseum
 *
 * @export
 * @class Header
 * @type {CustomElementConstructor}
 */
export default class MigrosmuseumHeader extends Header {
  /**
   * renders the o-header css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    const result = super.renderCSS()
    this.css = /* css */`
      :host > header {
        --details-shadow-icon-justify-content: flex-start;
        --a-menu-icon-align-self-mobile: center;
        gap: 2.23em;
      }
      :host > header::before {
        display: none;
      }
      :host > header > * {
        flex-grow: 0;
        flex-shrink: 0;
      }
      :host > header > a-logo {
        display: block;
        position: static;
        left: auto;
        z-index: auto;
        transform: none;
        top: auto;
        transition: none;
      }
      :host > header > :where(h1,h2,h3,h4,h5,h6,time) {
        flex-grow: 1;
        flex-shrink: 1;
        order: 2;
        text-align: center;
        font-size: var(--h6-font-size);
        margin: 0;
      }
      :host > header > a-menu-icon.open {
        margin-right: 5px;
      }
      @media only screen and (max-width: _max-width_) {
        :host > header > a-logo {
          flex-grow: 0;
        }
      }
    `
    return result
  }

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  renderHTML () {
    this.header = this.root.querySelector(this.cssSelector + ' > header') || document.createElement('header')
    Array.from(this.root.children).forEach(node => {
      if (node === this.header || node.getAttribute('slot') || node.nodeName === 'STYLE') return false
      this.header.appendChild(node)
    })
    this.html = this.header
    if (this.hasAttribute('sticky')) this.classList.add('top')
    self.addEventListener('resize', event => this.dispatchEvent(new CustomEvent(this.getAttribute('no-scroll') || 'no-scroll', {
      detail: {
        hasNoScroll: false,
        origEvent: event,
        this: this
      },
      bubbles: true,
      cancelable: true,
      composed: true
    })))
    return this.getAttribute('menu-icon')
      ? this.fetchModules([
        {
          path: `${this.importMetaUrl}'../../../../../../../../atoms/menuIcon/MenuIcon.js`,
          name: 'a-menu-icon'
        }
      ]).then(children => {
        this.MenuIcon = new children[0].constructorClass({ namespace: this.getAttribute('namespace') ? `${this.getAttribute('namespace')}a-menu-icon-` : '', namespaceFallback: this.hasAttribute('namespace-fallback'), mobileBreakpoint: this.mobileBreakpoint }) // eslint-disable-line
        this.MenuIcon.setAttribute('value', this.getAttribute('menu-icon-value'))
        this.MenuIcon.addEventListener('click', event => {
          this.header.classList.toggle('open')
          const prop = this.header.classList.contains('open') ? 'add' : 'remove'
          if (this.getMedia() !== 'desktop') this.mNavigation.setAttribute('aria-expanded', this.header.classList.contains('open') ? 'true' : 'false')
          this.dispatchEvent(new CustomEvent(this.getAttribute('no-scroll') || 'no-scroll', {
            detail: {
              hasNoScroll: this.header.classList.contains('open'),
              origEvent: event,
              this: this
            },
            bubbles: true,
            cancelable: true,
            composed: true
          }))

          Array.from(this.header.children).forEach(node => {
            node.classList[prop](this.getAttribute('no-scroll') || 'no-scroll')
          })
        })
        this.header.appendChild(this.MenuIcon)
        this.html = this.style
      })
      : Promise.resolve()
  }
}
