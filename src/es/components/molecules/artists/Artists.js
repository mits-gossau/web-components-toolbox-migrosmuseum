// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

/**
* @export
* @class Artists
* @type {CustomElementConstructor}
*/
export default class Artists extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, tabindex: 'no-tabindex-style', ...options }, ...args)

    this.requestArtistsFilterTextEventListener = (event, value) => {
      if (value || (value = event?.detail.value)) {
        Artists.filterFunction(value, this.divs)
        Artists.filterFunction(value, this.as)
        this.classList[this.divs.some(div => !div.classList.contains('hidden'))
          ? 'remove'
          : 'add'
        ]('empty')
        const url = new URL(self.location.href)
        url.searchParams.set('search', value)
        self.history.replaceState({ ...history.state, url: url.href }, document.title, url.href)
      } else {
        this.divs.forEach(div => div.classList.remove('hidden'))
        this.as.forEach(div => div.classList.remove('hidden'))
        this.classList.remove('empty')
        const url = new URL(self.location.href)
        url.searchParams.delete('search')
        self.history.replaceState({ ...history.state, url: url.href }, document.title, url.href)
      }
      this.dispatchEvent(new CustomEvent('artists-filter-text', {
        detail: {
          searchTerm: value
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) {
      showPromises.push(/** @type {Promise<void>} */(new Promise(resolve => this.addEventListener('grid-load', event => resolve(), { once: true }))))
      showPromises.push(this.renderHTML())
    }
    Promise.all(showPromises).then(() => {
      const searchName = new URL(self.location.href).searchParams.get('search') || ''
      if (searchName) this.requestArtistsFilterTextEventListener(undefined, searchName)
      this.hidden = false
    })
    document.body.addEventListener('request-artists-filter-text', this.requestArtistsFilterTextEventListener)
  }

  disconnectedCallback () {
    document.body.removeEventListener('request-artists-filter-text', this.requestArtistsFilterTextEventListener)
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
    return !this.grid
  }

  /**
   * renders the css
   * @returns Promise<void>
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        --h1-margin: 0;
        --h2-margin: 0;
        --h3-margin: 0;
        --h4-margin: 0;
        --h5-margin: 0;
        --h6-margin: 0;
        --picture-teaser-aspect-ratio: auto;
        --picture-teaser-aspect-ratio-mobile: var(--picture-teaser-aspect-ratio);
        --teaser-tile-figcaption-height: auto;
        --teaser-tile-figcaption-min-height: 6em;
        --teaser-tile-figcaption-flex-grow: 0;
        --teaser-tile-justify-content: flex-end;
        --teaser-tile-background-color-custom: transparent;
        --teaser-tile-figcaption-background-color-custom: transparent;
        --teaser-tile-figcaption-bg-color-equal-padding-custom: 0.6em 0;
        --teaser-tile-figcaption-bg-color-equal-padding-mobile-custom: var(--teaser-tile-figcaption-bg-color-equal-padding-custom);
        display: contents;
        width: 100% !important;
      }
      :host([hidden]) {
        min-height: var(--main-min-height, 75dvh);
      }
      :host > *.hidden, :host > *[hidden], :host > p.empty {
        display: none;
      }
      :host > p.empty {
        padding-top: 2.4em;
      }
      :host(.empty) > p.empty {
        display: block;
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          --teaser-tile-figcaption-min-height: 9em;
        }
        :host > p.empty {
          padding-top: 3.38em;
          width: var(--content-width-mobile, calc(100% - var(--content-spacing-mobile, var(--content-spacing)) * 2));
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
    return this.fetchModules([
      {
        path: `${this.importMetaUrl}'../../../../web-components-toolbox/src/es/components/organisms/grid/Grid.js`,
        name: 'o-grid'
      },
      {
        path: `${this.importMetaUrl}'../../../../web-components-toolbox/src/es/components/atoms/picture/Picture.js`,
        name: 'a-picture'
      },
      {
        path: `${this.importMetaUrl}'../../../../web-components-toolbox/src/es/components/atoms/spacer/Spacer.js`,
        name: 'a-spacer'
      },
      {
        path: `${this.importMetaUrl}'../../../../web-components-toolbox/src/es/components/molecules/teaser/Teaser.js`,
        name: 'm-teaser'
      }
    ]).then(() => {
      let json = null
      try {
        json = JSON.parse(this.template.content.textContent)
      } catch (error) {
        console.error('JSON corrupted at Artists.js component!', {error, json, target: this})
      }
      this.html = /* html */`
        <o-grid
          grid-load
          namespace="grid-12er-"
          width="100%"
        >
          <style protected>
            :host > section .hidden {
              display: none;
            }
            :host > section > div {
              display: flex;
              flex-direction: column;
            }
          </style>
          <section>
            ${json
              ? Array.from(Object.keys(json)).reduce((acc, key) => /* html */`${acc}
                <div
                  col-lg="3"
                  col-sm="12"
                  padding="2.4em 0.44em"
                  style="border-bottom: 2px solid var(--color-tertiary);"
                >
                  <h3>${key}</h3>
                  <a-spacer height=1.1em></a-spacer>
                  ${json[key].reduce((acc, curr) => {
                    const link = Object.keys(curr.link || {}).reduce((acc, key) => `${acc} ${key}="${curr.link[key]}"`, '')
                    return /* html */`${acc}<a ${link}>${curr.name}</a>`
                  }, '')}
                </div>
              `, '')
              : `JSON corrupted at Catalog.js component! ${JSON.stringify({json, target: this})}`
            }
          </section>
        </o-grid>
      `
    })
  }

  /**
   * add remove hidden class regarding if filter string is included in the node
   *
   * @method
   * @name filterFunction
   * @kind method
   * @static
   * @param {string} filter
   * @param {HTMLElement[]} nodes
   * @return {void}
   */
  static filterFunction (filter, nodes) {
    filter = filter.toUpperCase()
    // @ts-ignore
    nodes.forEach(node => node.classList[!filter || node.textContent.toUpperCase().includes(filter) ? 'remove' : 'add']('hidden'))
  }

  get grid () {
    return this.root.querySelector('o-grid')
  }

  get divs () {
    return Array.from(this.grid.root.querySelectorAll('section > div'))
  }

  get as () {
    return Array.from(this.grid.root.querySelectorAll('section > div:not(.hidden) > a'))
  }

  get template () {
    return this.root.querySelector('template')
  }
}
