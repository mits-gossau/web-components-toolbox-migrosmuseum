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
        --transition: var(--transition-speed);
        --width: 40px;
        --one-transform: translateY(calc(var(--height) + var(--spacing))) rotate(45deg);
        --two-transform: translateY(calc(-1 * (var(--height) + var(--spacing)))) rotate(-45deg);
        cursor: pointer;
        position: relative;
      }
      @media (hover: hover) {
        :host(:hover) {
          --header-default-a-menu-icon-background-color: var(--color-hover);
          color: var(--color-hover);
        }
      }
      @media (hover: none) {
        :host(:hover) {
          --header-default-a-menu-icon-background-color: var(--color);
          color: var(--color);
        }
      }
      :host :where(.bar1, .bar2, .bar3) {
        justify-self: end;
        margin-left: auto;
      }
      :host div.hidden {
        visibility: hidden;
        font-size: var(--menu-icon-font-size);
        text-transform: uppercase;
        height: 0;
      }
      :host :not(style) {
        transition: var(--transition, all 0.3s ease-in-out);
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
  }
}
