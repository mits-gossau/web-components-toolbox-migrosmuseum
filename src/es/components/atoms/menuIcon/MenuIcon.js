// @ts-check
import MenuIcon from '../../web-components-toolbox/src/es/components/atoms/menuIcon/MenuIcon.js'

/* global self */

/**
 * MenuIcon is the mobile hamburger menu icon
 * Example at: /src/es/components/pages/Home.html
 * As an atom, this component can not hold further children (those would be quantum)
 *
 * @export
 * @class MenuIcon
 * @type {CustomElementConstructor}
 * @attribute {
 *  {string} [openClass=open]
 *  {string} [barClass=bar]
 *  {string} [transition=0.2s]
 * }
 * @css {
 *  --height [5px]
 *  --width [35px]
 *  --background-color [white]
 *  --transition [0.2s]
 * }
 */
export default class MigrosmuseumMenuIcon extends MenuIcon {
  constructor (...args) {
    super(...args)
  }

  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        --transition: 0.5s;
        --width: 40px;
        display: grid;
        cursor: pointer;
        position: relative;
      }
      :host(:not(.${this.openClass})) *:not(span):not(style), :host(.${this.openClass}) span {
        opacity: 0;
      }
      :host(.${this.openClass}) span {
        transform: scaleX(0) skewX(65deg) translateX(3em);
      }
      :host span {
        font-size: var(--menu-icon-font-size);
        text-transform: uppercase;
        vertical-align: middle;
        position: absolute;
        right: 0;
        top: 20%;
      }
      :host :where(.bar1, .bar2, .bar3) {
        justify-self: end;
      }
      :host div.hidden {
        visibility: hidden;
        font-size: var(--menu-icon-font-size);
        text-transform: uppercase;
        height: 0;
      }
      :host :not(style) {
        transition: all 0.3s ease-in-out;
      }
    `
    super.renderCSS()
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    super.renderHTML()
    this.html = /* html */`
      <span>${this.getAttribute('value') || 'Menu'}</span>
      <div class="hidden">${this.getAttribute('value') || 'Menu'}</div>
    `
  }
}
