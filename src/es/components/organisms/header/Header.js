// @ts-check
import Header from '../../web-components-toolbox/src/es/components/organisms/header/Header.js'

/* global self */
/* global MutationObserver */
/* global CustomEvent */

/**
 * Header migrosmuseum
 *
 * @export
 * @class Header
 * @type {CustomElementConstructor}
 */
export default class MigrosmuseumHeader extends Header {
  constructor (options = {}, ...args) {
    super(options, ...args)

    this.lastScrollY = Math.max(0, self.scrollY)
    this.upScrollDistance = 0
    this.downScrollDistance = 0
    this.lastUserScrollDirection = null
    this.lastUserScrollDirectionAt = 0
    this.suppressRevealUntil = 0
    this.lastTouchY = null
    this.scrollTicking = false
    this.wheelListener = event => {
      if (Math.abs(event.deltaY) < 2) return
      this.lastUserScrollDirection = event.deltaY > 0 ? 'down' : 'up'
      this.lastUserScrollDirectionAt = Date.now()
      if (this.lastUserScrollDirection === 'down') this.suppressRevealUntil = Date.now() + 1000
    }
    this.touchStartListener = event => {
      this.lastTouchY = event.touches?.[0]?.clientY ?? null
    }
    this.touchMoveListener = event => {
      const currentTouchY = event.touches?.[0]?.clientY
      if (currentTouchY == null || this.lastTouchY == null) return
      const touchDelta = currentTouchY - this.lastTouchY
      if (Math.abs(touchDelta) >= 3) {
        // Finger moves up => page scrolls down. Finger moves down => page scrolls up.
        this.lastUserScrollDirection = touchDelta < 0 ? 'down' : 'up'
        this.lastUserScrollDirectionAt = Date.now()
        if (this.lastUserScrollDirection === 'down') this.suppressRevealUntil = Date.now() + 1000
      }
      this.lastTouchY = currentTouchY
    }
    this.scrollListener = event => {
      if (this.scrollTicking) return
      this.scrollTicking = true
      self.requestAnimationFrame(() => {
        const currentScrollY = Math.max(0, self.scrollY)
        const delta = currentScrollY - this.lastScrollY
        const jitterThreshold = 2
        const hideDistance = 8
        const revealDistance = Math.max(72, Math.round(this.offsetHeight * 0.6))
        const now = Date.now()
        const hasRecentUserScrollDirection = now - this.lastUserScrollDirectionAt < 500
        const isRevealSuppressed = now < this.suppressRevealUntil
        const isUserScrollingDown = hasRecentUserScrollDirection && this.lastUserScrollDirection === 'down'
        const isUserScrollingUp = hasRecentUserScrollDirection && this.lastUserScrollDirection === 'up'

        this.setStickyOffsetHeight()

        if (this.header?.classList.contains('open')) {
          this.classList.add('show')
          this.classList.remove('top')
          this.lastScrollY = currentScrollY
          this.scrollTicking = false
          return
        }

        if (currentScrollY <= 1) {
          this.classList.add('top')
          this.classList.remove('show')
          this.upScrollDistance = 0
          this.downScrollDistance = 0
        } else if (this.classList.contains('top') && delta > jitterThreshold && currentScrollY <= this.offsetHeight + 5) {
          // Keep the header static while scrolling down from the top so it scrolls away naturally.
          this.classList.remove('show')
          this.upScrollDistance = 0
          this.downScrollDistance += delta
        } else {
          this.classList.remove('top')

          if (Math.abs(delta) > jitterThreshold) {
            if (delta > 0 || isUserScrollingDown) {
              this.downScrollDistance += Math.abs(delta)
              this.upScrollDistance = 0
              if (this.downScrollDistance >= hideDistance) this.classList.remove('show')
            } else if (delta < 0 && isUserScrollingUp && !isRevealSuppressed) {
              this.upScrollDistance += Math.abs(delta)
              this.downScrollDistance = 0
              if (currentScrollY > this.offsetHeight + 5 && this.upScrollDistance >= revealDistance) this.classList.add('show')
            } else {
              this.upScrollDistance = 0
            }
          }
        }

        this.lastScrollY = currentScrollY
        this.scrollTicking = false
      })
    }
  }

  /**
   * renders the o-header css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    const result = super.renderCSS()
    this.css = /* css */`
      :host > header {
        --details-shadow-icon-justify-content: flex-start;
        --a-menu-icon-align-self-mobile: center;
        gap: 2.23em;
      }
      :host > header::before {
        display: none;
      }
      :host > header > * {
        flex-grow: 0;
        flex-shrink: 0;
      }
      :host > header > a-logo {
        display: block;
        order: 1;
        position: static;
        left: auto;
        z-index: auto;
        transform: none;
        top: auto;
        transition: none;
      }
      :host > header > a-menu-icon {
        order: 3;
      }
      @media only screen and (min-width: 768px) {
        :host > header > a-logo {
          flex-basis: var(--logo-width, 198px);
          flex-grow: 0;
          flex-shrink: 0;
          max-width: var(--logo-width, 198px);
          min-width: var(--logo-width, 198px);
        }
        :host > header > a-menu-icon {
          box-sizing: border-box;
          font-size: var(--font-size, 1rem) !important;
          flex-basis: var(--logo-width-custom, var(--logo-width, 198px));
          flex-grow: 0;
          flex-shrink: 0;
          max-width: var(--logo-width-custom, var(--logo-width, 198px));
          min-width: var(--logo-width-custom, var(--logo-width, 198px));
          width: var(--logo-width-custom, var(--logo-width, 198px));
        }
      }
      :host > header > :where(h1,h2,h3,h4,h5,h6,time) {
        line-height: var(--h6-line-height);
        flex-grow: 1;
        flex-shrink: 1;
        order: 2;
        text-align: center;
        font-size: var(--h6-font-size);
        margin: 0;
      }
      /* :host([sticky]) {
        position: sticky !important;
        top: 0 !important;
        transition: none !important;
      }
      :host([sticky]:not(.top)) > header {
        transform: none !important;
        border-bottom: none !important;
      } */
      :host > header > a-menu-icon.open {
        position: static;
        right: auto;
      }
      @media only screen and (max-width: _max-width_) {
        :host([sticky].show:not(.top)) > header,
        :host([sticky]:not(.top)) > header {
          transform: var(--sticky-transform-mobile, none);
        }
        :host > header > a-logo {
          flex-grow: 0;
        }
        :host > header > m-navigation {
          animation: none !important;
        }
        :host > header.open > m-navigation {
          animation: none !important;
          max-width: none !important;
          min-width: calc(100% + var(--scrollbar-width, 0px)) !important;
          overflow-y: auto !important;
          width: calc(100% + var(--scrollbar-width, 0px)) !important;
        }
      }
    `
    return result
  }

  connectedCallback () {
    super.connectedCallback()
    if (this.hasAttribute('sticky')) {
      self.removeEventListener('scroll', this.scrollListener)
      this.lastScrollY = Math.max(0, self.scrollY)
      self.addEventListener('wheel', this.wheelListener, { passive: true })
      self.addEventListener('touchstart', this.touchStartListener, { passive: true })
      self.addEventListener('touchmove', this.touchMoveListener, { passive: true })
      self.addEventListener('scroll', this.scrollListener, { passive: true })
    }
    // #7: Override Escape to focus MenuIcon instead of body
    document.removeEventListener('keyup', this.keyupListener)
    this.escapeListener = event => {
      if (event.key === 'Escape') {
        if (this.header.classList.contains('open')) {
          this.MenuIcon.click()
          this.MenuIcon.focus()
        }
      }
    }
    document.addEventListener('keyup', this.escapeListener)
    // #5: Sync aria-expanded on details toggle
    if (this.mNavigation) {
      this.mNavigation.addEventListener('toggle', event => {
        const details = event.target
        if (details && details.tagName === 'DETAILS') {
          const summary = details.querySelector('summary')
          if (summary && summary.hasAttribute('aria-expanded')) {
            summary.setAttribute('aria-expanded', details.hasAttribute('open') ? 'true' : 'false')
          }
        }
      }, true)
    }
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    self.removeEventListener('wheel', this.wheelListener)
    self.removeEventListener('touchstart', this.touchStartListener)
    self.removeEventListener('touchmove', this.touchMoveListener)
    document.removeEventListener('keyup', this.escapeListener)
  }

  focusFirstNavigationItem () {
    const firstListItem = this.mNavigation?.root.querySelector('nav > ul > li:first-child')
    const firstDetails = firstListItem?.querySelector('m-details')
    const focusTarget = firstDetails?.root.querySelector('summary a, summary') || firstListItem?.querySelector('a')

    focusTarget?.focus()
  }

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  renderHTML () {
    this.header = this.root.querySelector(this.cssSelector + ' > header') || document.createElement('header')
    Array.from(this.root.children).forEach(node => {
      if (node === this.header || node.getAttribute('slot') || node.nodeName === 'STYLE') return false
      this.header.appendChild(node)
    })
    this.html = this.header
    if (this.hasAttribute('sticky')) this.classList.add('top')
    self.addEventListener('resize', event => this.dispatchEvent(new CustomEvent(this.getAttribute('no-scroll') || 'no-scroll', {
      detail: {
        hasNoScroll: false,
        origEvent: event,
        this: this
      },
      bubbles: true,
      cancelable: true,
      composed: true
    })))
    return this.getAttribute('menu-icon')
      ? this.fetchModules([
        {
          path: `${this.importMetaUrl}'../../../../../../../../atoms/menuIcon/MenuIcon.js`,
          name: 'a-menu-icon'
        }
      ]).then(children => {
        this.MenuIcon = new children[0].constructorClass({ namespace: this.getAttribute('namespace') ? `${this.getAttribute('namespace')}a-menu-icon-` : '', namespaceFallback: this.hasAttribute('namespace-fallback'), mobileBreakpoint: this.mobileBreakpoint }) // eslint-disable-line
        this.MenuIcon.setAttribute('value', this.getAttribute('menu-icon-value'))
        this.MenuIcon.setAttribute('aria-expanded', 'false')
        this.MenuIcon.setAttribute('aria-controls', 'navigation')
        this.MenuIcon.setAttribute('aria-haspopup', 'true')
        this.MenuIcon.addEventListener('click', event => {
          event.stopPropagation()
          this.header.classList.toggle('open')
          this.MenuIcon.setAttribute('aria-expanded', this.header.classList.contains('open') ? 'true' : 'false')
          const prop = this.header.classList.contains('open') ? 'add' : 'remove'
          if (this.getMedia() !== 'desktop') this.mNavigation.setAttribute('aria-expanded', this.header.classList.contains('open') ? 'true' : 'false')
          this.dispatchEvent(new CustomEvent(this.getAttribute('no-scroll') || 'no-scroll', {
            detail: {
              hasNoScroll: this.header.classList.contains('open'),
              origEvent: event,
              this: this
            },
            bubbles: true,
            cancelable: true,
            composed: true
          }))

          if (this.mNavigation) this.mNavigation.classList[prop]('open')

          // #2: Focus first menuitem when opening
          if (this.header.classList.contains('open') && this.mNavigation) {
            setTimeout(() => this.focusFirstNavigationItem(), 100)
          }

          Array.from(this.header.children).forEach(node => {
            node.classList[prop](this.getAttribute('no-scroll') || 'no-scroll')
          })
        })
        this.header.appendChild(this.MenuIcon)
        this.html = this.style
      })
      : Promise.resolve()
  }
}
