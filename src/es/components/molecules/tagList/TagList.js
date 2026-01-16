// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

/**
* @export
* @class TagList
* @type {CustomElementConstructor}
*/
export default class TagList extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, tabindex: 'no-tabindex', ...options }, ...args)
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
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
   * renders the css
   * @returns Promise<void>
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        --button-secondary-margin: 0 0.3em 0.3em 0;
        --button-secondary-padding: 0.4em 0.5em 0.15em;
      }
      :host > a-button::part(button) {
        white-space: nowrap;
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          --button-secondary-background-color-hover-custom: var(--background-color);
          --button-secondary-color-hover-custom: var(--color);
          display: flex !important;
          flex-wrap: nowrap;
          overflow-x: scroll;
        }
      }
    `
    return Promise.resolve()
  }
}
