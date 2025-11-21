// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

/**
* @export
* @class Heading
* @type {CustomElementConstructor}
*/
export default class Heading extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, tabindex: 'no-tabindex', ...options }, ...args)
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    if (this.hasAttribute('picture-load')) showPromises.push(/** @type {Promise<void>} */(new Promise(resolve => this.nextElementSibling.addEventListener('picture-load', event => resolve(), { once: true }))))
    Promise.all(showPromises).then(() => {
      // fix z-index covering this heading to a part (height)
      const fixZIndex = node => {
        const isWebComponent = typeof node?.setCss === 'function'
        if (isWebComponent) node.css =  /* css */`
          :host {
            position: relative;
          }
        `
        return isWebComponent
      }
      if (this.hasAttribute('shadow') && !fixZIndex(this.nextElementSibling)) setTimeout(() => fixZIndex(this.nextElementSibling), 50)
      // set box-shadow late for slow transition, looks better with elements below building up
      this.css = /* css */`
        :host([shadow]) {
          box-shadow: var(--box-shadow);
        }
        @media only screen and (max-width: _max-width_) {
          :host([shadow]) {
            box-shadow: var(--box-shadow-mobile);
          }
        }
      `
      this.hidden = false
    })
  }

  disconnectedCallback () {}

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.heading
  }

  /**
   * renders the css
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        width: 100% !important;
        padding: 0 var(--content-spacing, unset);
        transition: box-shadow 3s ease-in;
      }
      :host > * {
        margin: 0 !important;
      }
      :host([crop]) > * {
        transform: translateY(0.35em);
        margin-top: -0.35em !important;
        clip-path: rect(0 100% 82.5% 0);
      }
      :host([fix-first-letter-spacing]) > * {
        transform: translateX(-0.075em);
      }
      :host([crop][fix-first-letter-spacing]) > * {
        transform: translate(-0.075em, 0.35em);
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          padding: 0 var(--content-spacing-mobile, var(--content-spacing, unset));
        }
        :host([crop]) > * {
          clip-path: rect(0 100% 66% 0);
        }
      }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   */
  fetchTemplate () {
    /** @type {import("../../web-components-toolbox/src/es/components/prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${this.importMetaUrl}../../web-components-toolbox/src/css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${this.importMetaUrl}../../web-components-toolbox/src/css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      default:
        return this.fetchCSS(styles, false)
    }
  }

  /**
   * Render HTML
   * @returns void
   */
  renderHTML () {
    this.heading = this.root.querySelector('h1, h2, h3, h4, h5') || document.createElement(this.getAttribute('tag') || 'h1')
    if (this.getAttribute('style-as')) this.heading.setAttribute('class', this.getAttribute('style-as'))
    // copy attributes to heading
    for (const attribute of this.attributes) {
      if (attribute.name !== 'tag' && attribute.name !== 'style-as') this.heading.setAttribute(attribute.name, attribute.value)
    }
    // fix font letter-spacing manually, since css does not yet support extended font letter-spacing
    if (['b', 'B', 'D', 'E', 'F', 'h', 'H', 'i', 'I', 'k', 'K', 'l', 'L', 'm', 'M', 'n', 'N', 'p', 'P', 'r', 'R', 'u', 'U'].includes(this.heading.textContent.substring(0, 1))) this.setAttribute('fix-first-letter-spacing', '')
    this.html = this.heading
  }
}
