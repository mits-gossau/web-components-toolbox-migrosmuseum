// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

/**
* @export
* @class Link
* @type {CustomElementConstructor}
*/
export default class Link extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, tabindex: 'no-tabindex', ...options }, ...args)

    this.initialTextContent = this.textContent
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    Promise.all(showPromises).then(() => (this.hidden = false))
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
    return !this.a
  }

  /**
   * renders the css
   * @returns Promise<void>
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        --h1-margin: 0;
        --h2-margin: 0;
        --h3-margin: 0;
        --h4-margin: 0;
        --h5-margin: 0;
        --h6-margin: 0;
        --a-text-decoration: none;
        display: block;
      }
      :host > a {
        margin-top: 0 !important;
        margin-bottom: 0 !important;
      }
      :host > a > ${this.getAttribute('tag-name') || 'h6'} {
        display: flex;
        align-items: center;
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
   * @returns Promise<void>
   */
  renderHTML () {
    this.html = /* html */`<a href="${this.getAttribute('href')}"${this.hasAttribute('target') ? ` target="${this.getAttribute('target')}"` : ''}><${this.getAttribute('tag-name') || 'h6'}><a-icon-mdx icon-name="${this.getAttribute('icon-name') || 'ArrowRight'}" size="${this.getAttribute('icon-size') || '1.5em'}" hover-on-parent-element></a-icon-mdx>${this.initialTextContent}</${this.getAttribute('tag-name') || 'h6'}></a>`
  }

  get a () {
    return this.root.querySelector('a')
  }
}
