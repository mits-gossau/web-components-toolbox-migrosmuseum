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
  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        display: inline-block;
        cursor: pointer;
        transition: var(--transition, 0.2s);
        margin: var(--margin, 0);
        transition: var(--transition, 0.2s);
        font-size: 14px;
      }
      .${this.barClass}1, .${this.barClass}2, .${this.barClass}3 {
        width: var(--width, 35px);
        height: var(--height, 5px);
        background-color: var(--background-color, white);
        margin: 0;
        transition: var(--transition, all 0.2s ease);
        border-radius: var(--border-radius, 0);
      }
      :host(:hover) .${this.barClass}1, :host(:hover) .${this.barClass}2, :host(:hover) .${this.barClass}3 {
        background-color: var(--background-color-hover, var(--background-color, white));
      }
      .${this.barClass}2 {
        margin: var(--spacing, var(--height, 5px)) 0;
        transition: var(--transition, 0.2s);
      }
      /* Rotate first ${this.barClass} */
      :host(.${this.openClass}) .${this.barClass}1, :host(.${this.openClass}) .${this.barClass}2 {
        transform: var(--one-transform, rotate(-45deg) translateY(calc(var(--height, 5px) * 5.5 / 2)));
      }
      /* Fade out the second ${this.barClass} */
      :host(.${this.openClass}) .${this.barClass}2 {
        opacity: 0;
      }
      /* Rotate last ${this.barClass} */
      :host(.${this.openClass}) .${this.barClass}3 {
        transform: var(--two-transform, rotate(45deg) translateY(calc(var(--height, 5px) * -5.5 / 2)));
      }
      :host([background])::before {
        --size-before: 3em;
        content: "";
        position: absolute;
        display: block;
        height: var(--height-before, var(--size-before));
        width: var(--width-before, var(--size-before));
        background: var(--background-before, var(--color-secondary, red));
        border-radius: var(--border-radius-before, 50%);
        outline: var(--outline-before, none);
        right: var(--right-before, unset);
        left: var(--left-before, calc(0.135 * var(--size-before)));
        top: var(--top-before, calc(-0.325 * var(--size-before)));
        bottom: var(--bottom-before, unset);
        transition: var(--transition-before, background-color 0.3s ease-out)
      }
      :host([background]:hover)::before {
        background: var(--background-before-hover, var(--background-before, var(--color-secondary, red)));
      }
    `
  }
}
