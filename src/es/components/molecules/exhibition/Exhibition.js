// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

/**
* @export
* @class Exhibition
* @type {CustomElementConstructor}
*/
export default class Exhibition extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, tabindex: 'no-tabindex-style', ...options }, ...args)

    this.requestExhibitionFilterYearEventListener = (event, value) => {
      if (value || (value = event?.detail.value)) {
        this.clusterByEls.forEach(clusterByEl => clusterByEl.classList[value === clusterByEl.getAttribute('cluster-by')
          ? 'remove'
          : 'add'
        ]('hidden'))
        const url = new URL(self.location.href)
        url.searchParams.set('year', value)
        self.history.replaceState({ ...history.state, url: url.href }, document.title, url.href)
      } else {
        this.clusterByEls.forEach(clusterByEl => clusterByEl.classList.remove('hidden'))
        const url = new URL(self.location.href)
        url.searchParams.delete('year')
        self.history.replaceState({ ...history.state, url: url.href }, document.title, url.href)
      }
      this.dispatchEvent(new CustomEvent('exhibition-filter-year', {
        detail: {
          selectedValue: value
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }

    this.requestExhibitionFilterTextEventListener = (event, value) => {
      if (value || (value = event?.detail.value)) {
        Exhibition.filterFunction(value, this.teasers)
        this.headingsAndSpacers.forEach(el => el[Array.from(this.root.querySelectorAll(`o-grid[cluster-by="${el.getAttribute('cluster-by')}"]`)).some(grid => Array.from(grid.section.children).some(child => !child.classList.contains('hidden') && !child.children?.[0].classList.contains('hidden')))
          ? 'removeAttribute'
          : 'setAttribute'
        ]('hidden', ''))
        const url = new URL(self.location.href)
        url.searchParams.set('search', value)
        self.history.replaceState({ ...history.state, url: url.href }, document.title, url.href)
      } else {
        this.teasers.forEach(teaser => teaser.classList.remove('hidden'))
        this.headingsAndSpacers.forEach(el => el.removeAttribute('hidden'))
        const url = new URL(self.location.href)
        url.searchParams.delete('search')
        self.history.replaceState({ ...history.state, url: url.href }, document.title, url.href)
      }
      this.dispatchEvent(new CustomEvent('exhibition-filter-text', {
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
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    Promise.all(showPromises).then(() => {
      const yearName = new URL(self.location.href).searchParams.get('year') || ''
      if (yearName) this.requestExhibitionFilterYearEventListener(undefined, yearName)
      const searchName = new URL(self.location.href).searchParams.get('search') || ''
      if (searchName) this.requestExhibitionFilterTextEventListener(undefined, searchName)
      this.hidden = false
    })
    document.body.addEventListener('request-exhibition-filter-year', this.requestExhibitionFilterYearEventListener)
    document.body.addEventListener('request-exhibition-filter-text', this.requestExhibitionFilterTextEventListener)
  }

  disconnectedCallback () {
    document.body.removeEventListener('request-exhibition-filter-year', this.requestExhibitionFilterYearEventListener)
    document.body.removeEventListener('request-exhibition-filter-text', this.requestExhibitionFilterTextEventListener)
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
      :host > *.hidden, :host > *[hidden] {
        display: none;
      }
      @media only screen and (max-width: _max-width_) {
        :host > div.spacer-four:first-of-type {
          --spacer-four-height-mobile: 3.38em;
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
        path: `${this.importMetaUrl}'../../../../web-components-toolbox/src/es/components/molecules/teaser/Teaser.js`,
        name: 'm-teaser'
      },
      {
        path: `${this.importMetaUrl}'../../../../web-components-toolbox/src/es/components/molecules/loadTemplateTag/LoadTemplateTag.js`,
        name: 'm-load-template-tag'
      },
      {
        path: `${this.importMetaUrl}'../../../../atoms/heading/Heading.js`,
        name: 'migrosmuseum-a-heading'
      }
    ]).then(() => {
      let json = null
      try {
        json = JSON.parse(this.template.content.textContent)
      } catch (error) {
        console.error('JSON corrupted at Exhibition.js component!', {error, json, target: this})
      }
      let clusterBy
      this.html = json
        ? json.reduce((acc, curr, i) => {
          const link = Object.keys(curr.link || {}).reduce((acc, key) => `${acc} ${key}="${curr.link[key]}"`, '')
          const start = curr.clusterBy && clusterBy !== curr.clusterBy ? /* html */`
            ${i > 0
              ? /* html */`</section></o-grid>`
              : ''
            }
            <div class="spacer-four" cluster-by="${curr.clusterBy}"></div>
            <migrosmuseum-a-heading shadow cluster-by="${curr.clusterBy}"><h3>${curr.clusterBy}</h3></migrosmuseum-a-heading>
            <o-grid
              namespace="grid-12er-"
              width="100%"
              background="var(--color-scheme-four-background-color);"
              cluster-by="${curr.clusterBy}"
            >
              <style protected>
                :host > section > *:has(> .hidden), :host > section .hidden {
                  display: none;
                }
                :host > section > m-load-template-tag {
                  min-height: 25em;
                }
              </style>
              <section>
          ` : ''
          const end = i === json.length ? /* html */`
              </section>
            </o-grid>
          ` : ''
          clusterBy = curr.clusterBy
          return /* html */`${acc}
            ${start}
            <m-load-template-tag
              no-css
              col-lg="4"
              col-sm="6"
              padding="0"
            >
              <template>
                <m-teaser
                  namespace=teaser-tile-
                  ${link}
                  col-lg="4"
                  col-sm="6"
                  padding="0"
                >
                  <figure>
                    <a-picture namespace="picture-teaser-" picture-load defaultSource="${curr.defaultSource}"></a-picture>
                    <figcaption>
                      <p>
                        <time datetime="${curr.datetimeFrom}">${curr.dateFrom}</time>–<time datetime="${curr.datetimeTo}">${curr.dateTo}</time>
                      </p>
                      <h5>${curr.title}</h5>
                      <p>${curr.description}</p>
                    </figcaption>
                  </figure>
                </m-teaser>
              </template>
            </m-load-template-tag>
            ${end}
          `
        }, '')
        : `JSON corrupted at Exhibition.js component! ${JSON.stringify({json, target: this})}`
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
    nodes.forEach(node => node.classList[!filter || (node.template?.content.textContent || node.figcaption.textContent).toUpperCase().includes(filter) ? 'remove' : 'add']('hidden'))
  }

  get grid () {
    return this.root.querySelector('o-grid')
  }

  get grids () {
    return Array.from(this.root.querySelectorAll('o-grid'))
  }

  get teasers () {
    return this.grids.reduce((acc, grid) => [...acc, ...Array.from(grid.root.querySelectorAll('m-teaser')), ...Array.from(grid.root.querySelectorAll('m-load-template-tag'))], [])
  }

  get clusterByEls () {
    return Array.from(this.root.querySelectorAll('[cluster-by]'))
  }

  get headingsAndSpacers () {
    return Array.from(this.root.querySelectorAll('migrosmuseum-a-heading,div.spacer-four'))
  }

  get template () {
    return this.root.querySelector('template')
  }
}
