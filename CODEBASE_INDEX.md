# CODEBASE_INDEX

Overview
- Purpose: Static, build-less front-end using native Web Components for Migros Museum. A thin skin over the “web-components-toolbox” library, with custom atoms/molecules/organisms and content pages assembled via a doc template and a dynamic component loader.
- Composition: Static HTML pages that load a template (TemplateMigrosmuseum.html) which fetches header/nav/content/footer fragments, injects CSS, then wc-config.js autoloads custom elements based on tag prefixes.

Tech stack
- Language: Vanilla JS (ES modules), HTML, CSS (CSS variables).
- Web components: web-components-toolbox (vendored as a submodule in src/es/components/web-components-toolbox).
- Dev tooling: live-server, standard (JS linter/formatter).
- Testing: Playwright.
- No bundler; runs in the browser via ES modules.

How to run
- Install: npm install
- Update submodule: npm run update
- Dev server: npm run serve (http://localhost:3000)
- Tests: npm test (spawns live-server in background, runs Playwright, then killall node)

Top-level structure (trimmed)
- index.html: Landing page listing links into TemplateMigrosmuseum.html with query params for content fragments.
- wc-config.js: Dynamic loader that resolves and defines custom elements based on tag prefix → directory mapping.
- package.json: Scripts, dev deps.
- README.md, LICENSE
- robots.txt: Disallow all (dev only).
- e2e/: Playwright screenshot snapshots.
- src/
  - css/
    - variablesCustom.css: design tokens, fonts, layout variables.
  - es/
    - helpers/
      - Environment.js: environment flags, language, CDN version strings; Trusted Types default policy; mobile breakpoint helper.
    - components/
      - atoms/
        - heading/Heading.js (custom)
        - link/Link.js (custom)
        - marquee/Marquee.js (custom)
        - logo/default-/default-.html (markup)
        - menuIcon/ (from toolbox)
      - molecules/
        - navigation/Navigation.js (custom extension of base m-navigation)
        - navigation/default-/default-.html (markup snippet)
      - organisms/
        - header/Header.js (custom extension)
        - footer/Footer.js (custom)
        - footer/default-/default-.html (markup snippet)
      - pages/
        - Home.html, Agenda.html, Ausstellungen.html, Sammlung.html, SammlungLoadTest.html, Kunstvermittlung.html, Besuch.html, Carousel.html, HomeDev.html
      - web-components-toolbox/ (vendored library incl. docs/ and src/)

Entry points and page composition
- index.html:
  - Loads Environment.js.
  - Renders a list of page links into web-components-toolbox/docs/TemplateMigrosmuseum.html with query params:
    - css=…/variablesCustom.css
    - logo=atoms/logo/default-/default-.html
    - nav=molecules/navigation/default-/default-.html
    - footer=organisms/footer/default-/default-.html
    - content=pages/<PageName>.html
- TemplateMigrosmuseum.html (from toolbox/docs):
  - Fetches CSS/HTML based on URL params and injects into the shell elements p-general, migrosmuseum-o-header, o-body.
  - After content injection it injects wc-config.js (from repo root) to auto-define components.
  - Provides a loading overlay that dismisses on CustomEvent wc-config-load.

Dynamic component loader (wc-config.js)
- Purpose: On window load (or immediately, if triggerImmediately=true), find all :not(:defined) elements, resolve their module URLs, import them, and customElements.define.
- URL params:
  - baseUrl: default './src/es/components/'
  - directories: optional custom mappings, complements or overwrites defaults.
  - useDefaultDirectories: true by default.
  - querySelector, urlAttributeName, urlAttributeLastTrumpsAll, wc-config-load (event/log name), debug, resolveImmediately, triggerImmediately, loadCustomElementsEventName, hash.
- Default directory mappings (selector → path; separateFolder controls kebab folder + PascalCase file resolution):
  - migrosmuseum-a- → atoms/ (separateFolder: true)
  - migrosmuseum-c- → controllers/ (separateFolder: true)
  - migrosmuseum-m- → molecules/ (separateFolder: true)
  - migrosmuseum-o- → organisms/ (separateFolder: true)
  - migrosmuseum-p- → pages/ (separateFolder: true)
  - a-/c-/m-/o-/p- → web-components-toolbox/src/es/components/* (base library; separateFolder: true)
  - Special case: m-navigation → molecules/navigation/Navigation.js
- Behavior:
  - For directory mappings with folders, tag names are converted (e.g., migrosmuseum-a-heading → atoms/heading/Heading.js, default export required).
  - Can also load via a url attribute on the element, which has priority (configurable).
  - Emits CustomEvent(wc-config-load) on document.body and sets body attribute wc-config-load="true".

Custom components (public API summary)
- migrosmuseum-a-heading (src/es/components/atoms/heading/Heading.js)
  - Extends Shadow + Intersection; supports attributes:
    - sticky (adds IntersectionSensor to hide/show based on scroll), shadow (animated box-shadow), picture-load (defers display until following a-picture fires picture-load), tag (heading tag), namespace/namespace-fallback.
  - Fetches base reset.css/style.css from toolbox; manages font-size variables for h1 … h6 via attributes.
- migrosmuseum-a-link (src/es/components/atoms/link/Link.js)
  - Extends Shadow; renders an anchor wrapping a heading tag with a leading a-icon-mdx ArrowRight.
  - Attributes: href, target, tag-name (default h6), align-items, namespace/namespace-fallback.
- migrosmuseum-a-marquee (src/es/components/atoms/marquee/Marquee.js)
  - Scrolling text banner with dynamic animation-duration based on measured content width; touch-drag support.
  - Attributes: animation-duration (seconds), background-color, color, and many CSS var hooks (font-size, padding, etc.).
- migrosmuseum-m-navigation (src/es/components/molecules/navigation/Navigation.js)
  - Extends base Navigation; adds a “file-drawer” hover animation shifting LIs using translateY and absolute positioning; listens for open/close to coordinate animations.
  - Responsive override disables absolute positioning under mobile breakpoint.
- migrosmuseum-o-header (src/es/components/organisms/header/Header.js)
  - Extends base Header; adjusts layout for logo, title, and menu icon; sticky behavior with large mobile-breakpoint to keep mobile mode always on.
  - When menu-icon=true, dynamically imports atoms/menuIcon/MenuIcon.js (from toolbox); toggles “open” classes; emits CustomEvent(no-scroll) with hasNoScroll state; updates aria-expanded on nav for mobile.
- migrosmuseum-o-footer (src/es/components/organisms/footer/Footer.js)
  - Styling and layout for footer sections, links, address, and logo; responsive adjustments; uses inset shadows on host.

Content pages (examples)
- pages/Home.html: Hero “Kommt rein” with picture tiles, a marquee ticker, agenda preview, and “Museum” section tiles.
- pages/Agenda.html: Tag filter buttons (a-button) emitting/consuming custom events; migrosmuseum-m-agenda uses embedded template JSON as data.
- Others: Ausstellungen.html, Sammlung.html, SammlungLoadTest.html, Kunstvermittlung.html, Besuch.html, Carousel.html – template fragments injected into o-body by TemplateMigrosmuseum.html.

Styling and tokens
- src/css/variablesCustom.css:
  - Fonts (PPMori family via CDN), many CSS custom properties for spacing, typography, colors, header/nav behavior, inputs, teasers, shadows, etc.
  - Mobile overrides at max-width: 767px (consistent with Environment.mobileBreakpoint()).
  - Note: header uses mobile-breakpoint="100000000px" to run in mobile mode; mobile overrides compensate.

Helpers
- src/es/helpers/Environment.js:
  - Globals: self.Environment with isTestingEnv, language, msrcBaseUrl/msrcVersion, mcsBaseUrl/mcsVersion, and mobileBreakpoint() returning '767px'.
  - Sets a Trusted Types default policy if CSP requires it; sanitizes potential XSS vectors (removes inline on* handlers and javascript: URLs).

Submodule/library
- src/es/components/web-components-toolbox:
  - Base component library with prototypes (Shadow, Intersection), atoms/molecules/organisms, icons, CSS, docs, and its own e2e.
  - Project maps a-/m-/o-/p- tags to these library components via wc-config mappings.

Testing
- package.json test script:
  - Starts live-server at 2200 (no browser), runs Playwright (@playwright/test) with config under src/es/components/web-components-toolbox/e2e/, then killall node.
  - Snapshots stored under e2e/screenshot.spec.js-snapshots/.

Notable decisions and gotchas
- Tag-to-file resolution relies on default export and folder + filename conventions (separateFolder: true → heading/Heading.js).
- Header runs in “mobile” mode by design via mobile-breakpoint="100000000px".
- wc-config tips:
  - Body attribute load-custom-elements is set ASAP to avoid flash.
  - Append ?hash=… to wc-config.js to bust caches; ?resolveImmediately=true defines components as imports resolve (may cause UI flash).
- robots.txt disallows crawling (dev default) – update for production.

Adding or modifying a component
- Create new component file:
  - Choose prefix migrosmuseum-a-/m-/o-/p- and place in corresponding folder with kebab folder + PascalCase file (e.g., atoms/my-component/MyComponent.js with default export).
  - If mapping isn’t covered by defaults, add a directory override (selector → url) or set url="…" on the element.
- Use it in markup:
  - <migrosmuseum-a-my-component …></migrosmuseum-a-my-component>
  - wc-config will resolve and define it automatically.
- For experiments, set a url attribute directly on the element to point to the module.

Common scripts
- Serve: npm run serve
- Update toolbox submodule: npm run update
- Lint/fix: npm run fix
- Test: npm test

Open TODOs / notes
- README TODO: Figma link.
- variablesCustom.css: replace font ref comment once confirmed on CDN.
- Environment.js: versions may be pinned later.
- e2e config is inside toolbox path; ensure it remains available for tests.
