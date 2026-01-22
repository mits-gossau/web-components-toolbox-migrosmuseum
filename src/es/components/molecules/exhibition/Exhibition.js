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

    this.exhibitionFilterYearEventListener = event => {
      console.log('*****year****', event)
      // this.grids.forEach(grid => grid.classList[grid.getAttribute('tag-names')?.split(',').some(gridTagName => tagName === gridTagName)
      //   ? 'remove'
      //   : 'add'
      // ]('hidden'))
    }
    this.exhibitionFilterTextEventListener = event => {
      console.log('*****text****', event)
    }
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    Promise.all(showPromises).then(() => (this.hidden = false))
    document.body.addEventListener('request-exhibition-filter-year', this.exhibitionFilterYearEventListener)
    document.body.addEventListener('request-exhibition-filter-text', this.exhibitionFilterTextEventListener)
  }

  disconnectedCallback () {
    document.body.removeEventListener('request-exhibition-filter-year', this.exhibitionFilterYearEventListener)
    document.body.removeEventListener('request-exhibition-filter-text', this.exhibitionFilterTextEventListener)
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
      :host > o-grid.hidden {
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
          const start = clusterBy !== curr.clusterBy ? /* html */`
            ${i > 0
              ? /* html */`</section></o-grid>`
              : ''
            }
            <div class="spacer-four"></div>
            <migrosmuseum-a-heading shadow><h3>${curr.clusterBy}</h3></migrosmuseum-a-heading>
            <o-grid
              namespace="grid-12er-"
              width="100%"
              background="var(--color-scheme-four-background-color);"
            >
              <section>
          ` : ''
          const end = i === json.length ? /* html */`
              </section>
            </o-grid>
          ` : ''
          clusterBy = curr.clusterBy
          return /* html */`${acc}
            ${start}
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
                    <time datetime="${curr.datetimeFrom}">${curr.dateFrom}</time>–<time datetime="${curr.datetimeTo}">${curr.dateTo}</time>–
                  </p>
                  <h5>${curr.title}</h5>
                  <p>${curr.description}</p>
                </figcaption>
              </figure>
            </m-teaser>
            ${end}
          `
        }, '')
        : `JSON corrupted at Exhibition.js component! ${JSON.stringify({json, target: this})}`
      if (this.a) this.root.appendChild(this.a)
      // keeping the above to be compatible but now using the migrosmuseum link component
      if (this.migrosmuseumALink) this.root.appendChild(this.migrosmuseumALink)
    })
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

  get grids () {
    return this.root.querySelectorAll('o-grid')
  }

  get template () {
    return this.root.querySelector('template')
  }
}
