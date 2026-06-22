// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

/* global self */

/**
 * ZvvWidget embeds the ZVV "Fahrplan-Widget" (connection search) from the ZVV Widget-Baukasten.
 * Baukasten snippet:
 *   <script src="https://fpcdn.zvv.ch/cdn/v1/widget.min.js"></script>
 *   <div id="zvv-connectionsearch-widget" data-to="Zürich, Löwenbräu" data-tolat="47.388434" data-tolon="8.526008"></div>
 *
 * WHY AN IFRAME:
 * The ZVV widget is a React app that resolves its container via document.getElementById('zvv-connectionsearch-widget')
 * and injects its styles into the document <head>. Within this toolbox the page content lives inside the shadow DOM
 * of o-body (and o-grid), so neither document.getElementById nor the head styles reach a widget rendered inline
 * (this caused "React error #299: Target container is not a DOM element"). To isolate it we render the widget inside
 * a same-origin iframe (molecules/zvvWidget/widget.html) where getElementById and the widget's CSS work as intended.
 * The iframe reports its content height via postMessage so the component can grow with it.
 *
 * Any data-* attribute set on the host is forwarded to the widget (data-to, data-tolat, data-tolon, data-from, ...).
 * Without data-* attributes it defaults to the Migros Museum / Löwenbräu location.
 *
 * @export
 * @class ZvvWidget
 * @type {CustomElementConstructor}
 * @attribute {
 *  {string} [data-to="Zürich, Löwenbräu"] destination label shown in the widget
 *  {string} [data-tolat="47.388434"] destination latitude
 *  {string} [data-tolon="8.526008"] destination longitude
 *  {string} [data-*] any further ZVV data attribute is forwarded as is
 *  {string} [src="https://fpcdn.zvv.ch/cdn/v1/widget.min.js"] widget script url
 *  {string} [height="480px"] initial iframe height (auto-grows to the content height)
 *  {string} [namespace] css namespace
 * }
 * @css {
 *  var(--display, block);
 *  var(--width, 100%);
 *  var(--margin, 0);
 *  var(--height, 480px);
 * }
 */
export default class ZvvWidget extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, tabindex: 'no-tabindex-style', ...options }, ...args)

    // grow the iframe to the height reported by its content, but never below the configured
    // floor: the ZVV autocomplete dropdown is absolutely positioned (doesn't add to scrollHeight)
    // and would be clipped if we shrank the iframe to the bare input height.
    this.messageListener = event => {
      if (!this.iframe || event.source !== this.iframe.contentWindow) return
      const data = event.data
      if (!data || data.type !== 'zvv-widget-height' || !data.height) return
      this.iframe.style.height = `${Math.max(data.height, this.minHeight)}px`
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
    self.addEventListener('message', this.messageListener)
  }

  disconnectedCallback () {
    self.removeEventListener('message', this.messageListener)
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
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.iframe
  }

  /**
   * renders the css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        display: var(--display, block);
        width: 320px;
        margin: var(--margin, 0);
        box-sizing: border-box;
      }
      :host > iframe {
        border: 0 none;
        width: 320px;
        height: var(--height, 480px);
        display: block;
        color-scheme: light;
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          width: var(--width-mobile, 100%);
          margin: var(--margin-mobile, var(--margin, 0));
        }
        :host > iframe {
          width: 100%;
        }
      }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate () {
    /** @type {import("../../web-components-toolbox/src/es/components/prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
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
   * renders the iframe hosting the ZVV widget
   *
   * @return {void}
   */
  renderHTML () {
    const iframe = document.createElement('iframe')
    iframe.setAttribute('src', `${this.importMetaUrl}widget.html${this.query}`)
    iframe.setAttribute('title', 'ZVV Fahrplan')
    iframe.setAttribute('loading', 'lazy')
    iframe.setAttribute('scrolling', 'no')
    if (this.hasAttribute('height')) iframe.style.height = this.getAttribute('height')
    this.html = iframe
  }

  /**
   * builds the query string forwarded to widget.html (data-* attributes + optional script src)
   *
   * @return {string}
   */
  get query () {
    const params = new self.URLSearchParams()
    for (const attribute of Array.from(this.attributes)) {
      if (attribute.name.startsWith('data-')) params.set(attribute.name, attribute.value)
    }
    if (this.hasAttribute('src')) params.set('src', this.getAttribute('src'))
    const query = params.toString()
    return query ? `?${query}` : ''
  }

  get iframe () {
    return this.root.querySelector('iframe')
  }

  /**
   * the minimum iframe height in px (floor for the auto-grow), derived from the height attribute
   *
   * @return {number}
   */
  get minHeight () {
    return parseInt(this.getAttribute('height'), 10) || 480
  }
}
