// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

/**
* @export
* @class Agenda
* @type {CustomElementConstructor}
*/
export default class Agenda extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, tabindex: 'no-tabindex-style', ...options }, ...args)
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
    return !this.grid
  }

  /**
   * renders the css
   * @returns Promise<void>
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        --a-color: 0;
        --h1-margin: 0;
        --h2-margin: 0;
        --h3-margin: 0;
        --h4-margin: 0;
        --h5-margin: 0;
        --h6-margin: 0;
        display: contents;
        width: 100% !important;
      }
      :host > a, :host > migrosmuseum-a-link {
        --a-margin-mobile: var(--grid-12er-section-child-padding-mobile);
        --a-margin: var(--grid-12er-section-child-padding);
        margin-top: 1.176rem !important;
        margin-bottom: 0 !important;
      }
      :host > o-grid::part(section) {
        min-height: 8em;
      }
      :host > o-grid::part(date), :host > o-grid::part(title), :host > o-grid::part(description) {
        padding: var(--grid-12er-section-child-padding);
        padding-top: 1.176rem;
        padding-bottom: 2.5rem;
        width: 100%;
      }
      :host > o-grid::part(description-one), :host > o-grid::part(description-two) {
        display: block;
        line-height: 1.5;
      }
      @media only screen and (max-width: _max-width_) {
        :host > a, :host > migrosmuseum-a-link {
          margin-top: 0.77rem !important;
        }
        :host > o-grid::part(section) {
          grid-template-rows: auto auto 1fr;
          min-height: 10em;
        }
        :host > o-grid::part(date), :host > o-grid::part(title), :host > o-grid::part(description) {
          padding: var(--grid-12er-section-child-padding-mobile);
          padding-top: 0.77rem;
        }
        :host > o-grid::part(date) {
          line-height: 1.2;
          padding-bottom: 0;
        }
        :host > o-grid::part(title) {
          padding-top: 0;
          padding-bottom: 0;
        }
        :host > o-grid::part(description) {
          padding-top: 0.7rem;
          padding-bottom: 1.15rem;
        }
        :host > o-grid::part(description-one), :host > o-grid::part(description-two) {
          display: inline;
        }
        :host > o-grid::part(description-two) {
          padding-left: 1rem;
        }
        :host > o-grid::part(description-three) {
          display: block;
        }
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
    let json = null
    try {
      json = JSON.parse(this.template.content.textContent)
    } catch (error) {
      console.error('JSON corrupted at Agenda.js component!', {error, json, target: this})
    }
    this.html = json
      ? json.reduce((acc, curr) => {
          const link = Object.keys(curr.link || {}).reduce((acc, key) => `${acc} ${key}="${curr.link[key]}"`, '')
          return /* html */`${acc}
            <o-grid namespace="grid-12er-" width="100%" color="${curr.color}" background="${curr.backgroundColor}" color-hover="${curr.colorHover}" background-hover="${curr.backgroundColorHover}">
              <style protected>
                :host > section {
                  --grid-12er-a-color: ${curr.color};
                }
                :host(:where(:hover, :focus)) > section {
                  --grid-12er-a-color: ${curr.colorHover};
                  --grid-12er-a-color-hover: ${curr.colorHover};
                }
              </style>
              <section part=section>
                <a ${link} part=date col-lg=2 col-sm=12>
                  <h5><time datetime="${curr.datetime}">${curr.date}</time></h5>
                </a>
                <a ${link} part=title col-lg=6 col-sm=12>
                  <h5>${curr.title}</h5>
                </a>
                <a ${link} part=description col-lg=4 col-sm=12>
                  <h6>${curr.descriptions.reduce((acc, description, i) => `${acc}<span part=description${i === 0 ? '-one' : i === 1 ? '-two' : '-three'}>${description}</span>`, '')}</h6>
                </a>
              </section>
            </o-grid>
          `
        }, '')
      : `JSON corrupted at Agenda.js component! ${JSON.stringify({json, target: this})}`
    if (this.a) this.root.appendChild(this.a)
    // keeping the above to be compatible but now using the migrosmuseum link component
    if (this.migrosmuseumALink) this.root.appendChild(this.migrosmuseumALink)
    return this.fetchModules([
      {
        path: `${this.importMetaUrl}'../../../../web-components-toolbox/src/es/components/organisms/grid/Grid.js`,
        name: 'o-grid'
      }
    ])
  }

  get a () {
    return this.root.querySelector('a')
  }

  get migrosmuseumALink () {
    return this.root.querySelector('migrosmuseum-a-link')
  }

  get grid () {
    return this.root.querySelector('o-grid')
  }

  get template () {
    return this.root.querySelector('template')
  }
}
