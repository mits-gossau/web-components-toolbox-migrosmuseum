// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'
import { Intersection } from '../../web-components-toolbox/src/es/components/prototypes/Intersection.js'

// Sensor is used when attribute is sticky
class IntersectionSensor extends Intersection() {
  constructor (intersectionFunction, options = {}, ...args) {
    super({
      intersectionObserverInit: {},
      tabindex: 'no-tabindex-style',
      ...options
    }, ...args)

    this.intersectionFunction = intersectionFunction
  }

  connectedCallback () {
    super.connectedCallback()
    if (this.shouldRenderCSS()) this.renderCSS()
  }

  intersectionCallback (entries, observer) {
    this.intersectionFunction(this.areEntriesIntersecting(entries))
  }

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
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        padding: 0;
        margin: 0 !important;
        height: 0;
        width: 100% !important;
      }
      :host([hidden]) {
        visibility: hidden;
      }
      :host([show][shadow]) {
        animation: shadow 3s ease-in forwards !important;
      }
      :host([shadow]) {
        height: 6.4em; /* matches the shadow spread */
        margin-top: -6.4em !important;
      }
      :host(:not([shadow])) {
        visibility: hidden;
      }
      @media only screen and (max-width: _max-width_) {
        :host([show][shadow]) {
          animation: shadow-mobile 3s ease-in forwards !important;
        }
        :host([shadow]) {
          height: 4.4em; /* matches the shadow spread */
          margin-top: -4.4em !important;
        }
      }
      @keyframes shadow {
        0% { box-shadow: none; }
        100% { box-shadow: var(--box-shadow-inset); }
      }
      @keyframes shadow-mobile {
        0% { box-shadow: none; }
        100% { box-shadow: var(--box-shadow-inset-mobile); }
      }
    `
  }
}

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
    // when sticky, this component is followed directly by the IntersectionSensor component, so we pick the siblings sibling
    const nextElementSibling = this.hasAttribute('sticky')
      ? this.nextElementSibling?.nextElementSibling || this.nextElementSibling
      : this.nextElementSibling
    if (this.hasAttribute('picture-load')) showPromises.push(/** @type {Promise<void>} */(new Promise(resolve => nextElementSibling.addEventListener('picture-load', event => resolve(), { once: true }))))
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
      this.setAttribute('show', '')
      if (this.hasAttribute('sticky')) {
        this.nextElementSibling.setAttribute('show', '')
        if (!fixZIndex(nextElementSibling)) setTimeout(() => fixZIndex(nextElementSibling), 50)
      }
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
        --show: none;
        display: flex !important;
        width: 100% !important;
        padding: 0 var(--content-spacing, unset);
      }
      :host(:not([sticky])) {
        padding-top: 5.4em; /* matches the shadow spread */
        margin-top: -5.4em !important;
      }
      :host([sticky]) {
        position: sticky;
        top: 0;
      }
      :host([hidden]) {
        display: none !important;
      }
      :host > * {
        margin-left: 0 !important;
        margin-right: 0 !important;
      }
      :host([crop]) > * {
        margin: 0 !important;
      }
      :host([crop]) > * {
        transform: translateY(0.35em);
        margin-top: -0.35em !important;
        clip-path: rect(0 100% calc(100% - 0.35em) 0);
      }
      :host([fix-first-letter-spacing]) > * {
        transform: translateX(-0.075em);
      }
      :host([crop][fix-first-letter-spacing]) > * {
        transform: translate(-0.075em, 0.35em);
      }
      :host([show][shadow]:not([sticky])) {
        animation: shadow 3s ease-in forwards !important;
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          padding: 0 var(--content-spacing-mobile, var(--content-spacing, unset));
        }
        :host([show][shadow]:not([sticky])) {
          animation: shadow-mobile 3s ease-in forwards !important;
        }
      }
      @keyframes shadow {
        0% { box-shadow: none; }
        100% { box-shadow: var(--box-shadow-inset); }
      }
      @keyframes shadow-mobile {
        0% { box-shadow: none; }
        100% { box-shadow: var(--box-shadow-inset-mobile); }
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
    // make a hidden element to track if this component would still be visible after scrolling (sticky does not scroll, so we don't know where we would be scrolled, if this components was static)
    if (this.hasAttribute('sticky')) {
      // @ts-ignore
      customElements.define('heading-intersection-sensor', IntersectionSensor)
      const intersectionSensor = new IntersectionSensor(isIntersecting => {
        if (isIntersecting) {
          this.removeAttribute('hidden')
          intersectionSensor.removeAttribute('hidden')
        } else {
          this.setAttribute('hidden', '')
          intersectionSensor.setAttribute('hidden', '')
        }
      })
      if (this.hasAttribute('shadow')) intersectionSensor.setAttribute('shadow', '')
      this.insertAdjacentElement('afterend', intersectionSensor)
    }
    return Promise.resolve()
  }
}
