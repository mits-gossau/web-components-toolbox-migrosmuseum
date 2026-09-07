// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

/* global self */

/**
 * Sample is an icon
 * https://jira.migros.net/browse/SPARX-55
 * Example at: /src/es/components/pages/Home.html
 * As an atom, this component can not hold further children (those would be quantum)
 *
 * @export
 * @class Sample
 * @type {CustomElementConstructor}
 * @attribute {
 *  {number} [animation-duration=15] example 15 seconds for an 800px text to cross the screen
 *  {string} [background-color: vars]
 *  {string} [color: vars]
 * }
 * @css {
 *  var(--background-color, red)'};
    var(--bottom, 0);
    var(--color, white)'};
    var(--font-size, 45px);
    var(--padding, 0.672em 0);
    var(--position, fixed);
    var(--a-color, var(--color-secondary, var(--color, pink)));
    var(--a-font-weight, var(--font-weight, normal));
    var(--a-text-align, unset);
    var(--a-text-decoration, var(--text-decoration, none));
    var(--a-text-underline-offset, unset);
    var(--a-display, inline);
    var(--a-margin, var(--content-spacing, unset)) auto;
    var(--a-color-hover, var(--color-hover-secondary, var(--color-hover, var(--color, green))));
    var(--a-text-decoration-hover, var(--text-decoration-hover, var(--a-text-decoration, var(--text-decoration, none))));
    var(--font-size-mobile, var(--font-size, 1rem));
    var(--a-margin-mobile, var(--a-margin, var(--content-spacing-mobile, var(--content-spacing, unset)))) auto;
 * }
 */
export default class Marquee extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, tabindex: 'no-tabindex', ...options }, ...args)

    // resize listeners
    let timeout = null
    this.resizeListener = event => {
      clearTimeout(timeout)
      timeout = setTimeout(() => this.renderCSSByChildrenOffsetWidth(), 200)
    }
    // touch listeners
    const css = document.createElement('style')
    css.setAttribute('protected', 'true')
    this.html = css
    let clientX = 0
    let lastClientX = 0
    let touchTimeout = null
    this.touchstartListener = event => {
      clearTimeout(touchTimeout)
      clientX = event.changedTouches[0].clientX - lastClientX
    }
    this.touchmoveListener = event => {
      css.textContent = /* css */`
        :host > section {
          transform: translateX(${event.changedTouches[0].clientX - clientX}px);
        }
      `
    }
    this.touchendListener = event => {
      touchTimeout = setTimeout(() => {
        css.textContent = ''
        lastClientX = 0
      }, 3000)
      lastClientX = event.changedTouches[0].clientX - clientX
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    self.addEventListener('resize', this.resizeListener)
    this.addEventListener('touchstart', this.touchstartListener)
    this.addEventListener('touchmove', this.touchmoveListener)
    this.addEventListener('touchend', this.touchendListener)
  }

  disconnectedCallback () {
    self.removeEventListener('resize', this.resizeListener)
    this.removeEventListener('touchstart', this.touchstartListener)
    this.removeEventListener('touchmove', this.touchmoveListener)
    this.removeEventListener('touchend', this.touchendListener)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML () {
    return !this.root.querySelector('section')
  }

  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        ${this.hasAttribute('background-color') ? `--background-color: ${this.getAttribute('background-color')};` : ''}
        ${this.hasAttribute('color') ? `--color: ${this.getAttribute('color')};--h-color: ${this.getAttribute('color')};` : ''}
        background-color: var(--background-color, red);
        top: var(--top, unset);
        right: var(--right, unset);
        bottom: var(--bottom, 0);
        left: var(--left, unset);
        color: var(--color, white);
        font-size: var(--font-size, 1rem);
        padding: var(--padding, 0.672em 0);
        position: var(--position, relative);
        visibility: hidden;
        margin: 0 !important;
        z-index: var(--z-index, 100);
        width: var(--width, 100%) !important;
        max-width: 100%;
        box-sizing: border-box;
        white-space: nowrap;
        overflow-x: hidden;
      }:host > section {
        transition: transform .3s ease;
      }
      :host > section > .marquee-track {
        display: flex;
        column-gap: 50vw;
        width: max-content;
        animation: marquee ${this._animationDuration = this.getAttribute('animation-duration') || 15}s linear infinite;
      }
      :host > section > .marquee-track > .marquee-copy {
        flex: 0 0 auto;
      }
      :host > section > .marquee-track > .marquee-copy > * a {
        color: var(--a-color, var(--color-secondary, var(--color, pink)));
        font-weight: var(--a-font-weight, var(--font-weight, normal));
        text-align: var(--a-text-align, unset);
        text-decoration: var(--a-text-decoration, var(--text-decoration, none));
        text-underline-offset: var(--a-text-underline-offset, unset);
        display: var(--a-display, inline);
        margin: var(--a-margin, var(--content-spacing, unset)) auto;
      }
      :host > section > .marquee-track > .marquee-copy > * a:hover,
      :host > section > .marquee-track > .marquee-copy > * a:active,
      :host > section > .marquee-track > .marquee-copy > * a:focus {
        color: var(--a-color-hover, var(--color-hover-secondary, var(--color-hover, var(--color, green))));
        text-decoration: var(--a-text-decoration-hover, var(--text-decoration-hover, var(--a-text-decoration, var(--text-decoration, none))));
      }
      :host > section > .marquee-track > .marquee-copy > * {
        margin: 0 !important;
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          font-size: var(--font-size-mobile, var(--font-size, 1rem));
          padding: var(--padding-mobile, var(--padding, 0.672em 0));
        }
        :host > section > .marquee-track > .marquee-copy > * a {
          margin: var(--a-margin-mobile, var(--a-margin, var(--content-spacing-mobile, var(--content-spacing, unset)))) auto;
        }
      }
    `
    this.html = this._css = this._css.cloneNode() // set the clone as this.css reference and by that safe the original away to never be overwritten by the this.css setter
    this.renderCSSByChildrenOffsetWidth()
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
   * Sets the host visible after reading the overflowing content width in an animation frame.
   * Keeps the live marquee in document flow while generating its animation duration and keyframes.
   *
   * @return {void}
   */
  renderCSSByChildrenOffsetWidth () {
    new Promise(resolve => {
      self.requestAnimationFrame(timeStamp => {
        const content = this.root.querySelector('.marquee-copy:not([aria-hidden])') ||
          Array.from(this.root.children).find(node => node.tagName !== 'STYLE')
        resolve(content.clientWidth)
      })
    }).then(offsetWidth => {
      this.css = ''
      this.css = /* css */`
        :host {
          visibility: visible;
        }
        ${this.generateAnimationDuration((Number(this.getAttribute('animation-duration')) || 15) * (offsetWidth / 800))}
        ${this.generateKeyframesMarquee('50vw', `-${offsetWidth}px`)}
      `
    })
  }

  /**
   * generates the keyframes css
   *
   * @param {number} [animationDuration = this._animationDuration || 15]
   * @return {string}
   */
  generateAnimationDuration (animationDuration = this._animationDuration || 15) {
    this._animationDuration = animationDuration = Math.round(animationDuration)
    return /* css */`
      :host > section > .marquee-track {
        animation-duration: ${animationDuration}s;
      }
      :host(:hover) > section > .marquee-track, :host(:focus) > section > .marquee-track {
        animation-play-state: paused;
      }
    `
  }

  /**
   * generates the keyframes css
   *
   * @param {string} [from = '100vw']
   * @param {string} [to = '-100vw']
   * @return {string}
   */
  generateKeyframesMarquee (from = '100vw', to = '-100vw') {
    return `@keyframes marquee{
      from{
        transform: translateX(${from});
      }
      to{
        transform: translateX(${to});
      }
    }`
  }

  /**
   * renders the a-link html
   *
   * @return {void}
   */
  renderHTML () {
    this.section = this.root.appendChild(document.createElement('section'))
    const track = this.section.appendChild(document.createElement('div'))
    const copy = track.appendChild(document.createElement('div'))
    track.classList.add('marquee-track')
    copy.classList.add('marquee-copy')
    Array.from(this.root.children).forEach(node => {
      if (node === this.section || node.getAttribute('slot') || node.nodeName === 'STYLE') return false
      copy.appendChild(node)
    })
    const repeatedCopy = copy.cloneNode(true)
    repeatedCopy.setAttribute('aria-hidden', 'true')
    repeatedCopy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'))
    repeatedCopy.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(node => node.setAttribute('tabindex', '-1'))
    track.appendChild(repeatedCopy)
  }
}
