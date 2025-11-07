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
        gap: 1em;
      }
      :host > header::before {
        display: none;
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
      :host > header > :where(h1,h2,h3,h4,h5,h6) {
        flex: 1;
        order: 2;
        text-align: center;
      }
      :host > header > a-logo {
        flex-grow: 0;
      }
    `
    return result
  }
}
