// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

/**
* @export
* @class Footer
* @type {CustomElementConstructor}
*/
export default class Footer extends Shadow() {
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
        --ul-list-style: none;
        --ul-margin: 0;
        --ul-margin-mobile: 0;
        --ul-padding-left: 0;
        --h6-font-size-mobile: 1rem;
        --p-margin: 0 auto;
        animation: shadow 3s ease-in forwards !important;
        content-visibility: auto;
        grid-area: footer;
      }
      :host > footer {
        --h1-margin: 0 auto;
        margin: 2.588em auto 1.24em;  /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
        width: var(--content-width, 55%);
      }
      :host > footer > section {
        --h6-margin: 0 auto;
        display: flex;
        justify-content: space-between;
      }
      :host > footer > section > #links {
        display: flex;
        flex-direction: row;
        gap: 1em;
        margin: 0;
        padding: 0;
      }
      :host > footer > section > #links > :not(.lang) + .lang {
        margin-left: 1em;
      }
      :host > footer > section > div > #times {
        margin: var(--content-spacing) 0;
      }
      :host > footer > section > div > address {
        --a-text-decoration: none;
        display: flex;
        flex-direction: column;
        font-size: var(--h6-font-size);
        font-style: normal;
        line-height: var(--line-height, normal);
        margin: 0 0 var(--content-spacing) 0;
      }
      :host > footer > section#sub {
        gap: 3em;
      }
      :host > footer > section#sub > #logo {
        flex-shrink: 0;
      }
      :host > footer > section#sub > p {
        flex-shrink: 1;
        text-align: justify;
      }
      :host > footer > section#sub > #logo > img {
        width: 10em;
      }
      :host > footer > section#sub > .links {
        display: flex;
        white-space: nowrap;
      }
      .today {
        --h6-color: var(--color-orange);
      }
      @media only screen and (max-width: 1000px) {
        :host > footer > section#sub {
          flex-wrap: wrap;
        }
        :host > footer > section#sub > p {
          order: -1;
          width: 100%;
        }
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          animation: shadow-mobile 3s ease-in forwards !important;
        }
        :host > footer {
          width: var(--content-width-mobile, calc(100% - var(--content-spacing-mobile, var(--content-spacing)) * 2));
          margin: 2em auto 1.231em;  /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
        }
        :host > footer > migrosmuseum-a-heading {
          margin-top: 1em;
        }
        :host > footer > section:not(#sub) {
          flex-direction: column;
        }
        :host > footer > section > div > #times {
          margin: 1.231em 0;
        }
        :host > footer > section > div > address {
          font-size: var(--h6-font-size-mobile);
          margin: 0 0 1.231em 0;
        }
        :host > footer > section > #links {
          margin-bottom: 2em;
        }
        :host > footer > section#sub {
          flex-wrap: wrap;
          gap: 1em;
          font-size: 0.769em;
          margin-top: 1em;
        }
        :host > footer > section#sub > p {
          order: -1;
          width: 100%;
        }
        :host > footer > section#sub > #logo > img {
          width: 9.2em;
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
}
