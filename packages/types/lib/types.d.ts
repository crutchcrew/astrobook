export interface IntegrationOptions {
  /**
   * The directory to scan for stories.
   *
   * @default '.'
   *
   * @example
   *
   * ```js
   * astrobook({
   *  directory: './src/astrobook',
   * })
   * ```
   */
  directory?: string

  /**
   * The subpath to deploy Astrobook to relative to the [base
   * URL](https://docs.astro.build/en/reference/configuration-reference/#base)
   * of your Astro project. This is useful if you want to use Astrobook in your
   * existing Astro project.
   *
   * @example
   *
   * ```js
   * astrobook({
   *  subpath: '/docs/components',
   * })
   * ```
   */
  subpath?: string

  /**
   * The subpath for dashboard pages relative to the main subpath.
   * A dashboard page has a sidebar for navigation between components.
   *
   * @default '/dashboard/'
   *
   * @example
   *
   * ```js
   * astrobook({
   *  dashboardSubpath: '/components/',
   * })
   * ```
   */
  dashboardSubpath?: string

  /**
   * The subpath for preview pages relative to the main subpath.
   * A preview page displays an individual component without the sidebar.
   *
   * @default '/stories/'
   *
   * @example
   *
   * ```js
   * astrobook({
   *  previewSubpath: '/preview/',
   * })
   * ```
   */
  previewSubpath?: string

  /**
   * Set the title for your website. Will be used in metadata and in the browser tab title.
   *
   * @default 'Astrobook'
   *
   * @example
   *
   * ```js
   * astrobook({
   *  title: 'My Components Playground',
   * })
   * ```
   */
  title?: string

  /**
   * Provide CSS files to customize the look and feel of your Astrobook project.
   *
   * Supports local CSS files relative to the root of your project,
   * e.g. `'./src/custom.css'`, and CSS you installed as an npm
   * module, e.g. `'@fontsource/roboto'`.
   *
   * @example
   *
   * ```js
   * astrobook({
   *  css: ['./src/custom-styles.css', '@fontsource/roboto'],
   * })
   * ```
   */
  css?: string[]

  /**
   * The path to an Astro component to provide custom tags in the `<head>`.
   * It can be an `.astro` or `.html` file.
   *
   * @example
   *
   * ```js
   * astrobook({
   *  head: './src/components/CustomHead.astro',
   * })
   * ```
   *
   * ```astro
   * astrobook({
   *  head: './src/components/CustomHead.html',
   * })
   * ```
   */
  head?: string

  /**
   * Components to wrap every story, outside its own decorators. The first
   * entry is outermost. Relative paths resolve against the project root;
   * package identifiers are supported. Each component receives a `story` prop.
   *
   * @default []
   * @example
   * ```js
   * astrobook({ decorators: ['./src/decorators/StoryContext.astro'] })
   * ```
   */
  decorators?: string[]

  /**
   * Dashboard viewport presets in CSS pixels. Names must be non-empty and unique;
   * widths and optional heights must be positive integers. Use false or [] to hide
   * the toolbar. The selected name is saved locally between stories.
   * @default [{ name: 'Mobile', width: 375 }, { name: 'Tablet', width: 768 }, { name: 'Desktop', width: 1440 }]
   */
  viewports?: { name: string; width: number; height?: number }[] | false

  /**
   * Controls which Astro component is rendered on the dashboard homepage.
   *
   * - Pass a string (relative path or package identifier) to fully replace
   *   the built-in home page with a custom Astro component.
   * - Pass `false` to render an empty home page.
   * - Omit the option to use Astrobook's built-in home. Customize the content
   *   of that built-in home through {@link IntegrationOptions.homeContent}.
   *
   * @default 'astrobook/components/home.astro'
   *
   * @example
   *
   * ```js
   * // Replace the built-in home page with a custom Astro component
   * astrobook({
   *   home: './src/components/CustomHome.astro',
   * })
   * ```
   *
   * @example
   *
   * ```js
   * // Render an empty home page
   * astrobook({ home: false })
   * ```
   */
  home?: string | false

  /**
   * Customize the content of Astrobook's built-in home page (title, subtitle,
   * version badge, GitHub badge).
   *
   * This option is only consumed when {@link IntegrationOptions.home} is left
   * at its default value. If you provide a custom `home` component or set
   * `home: false`, this option is ignored.
   *
   * Each field can be set to a custom value to override it, set to `false`
   * to hide the corresponding section, or omitted to fall back to the
   * default.
   *
   * @example
   *
   * ```js
   * import { version } from './package.json'
   *
   * astrobook({
   *   homeContent: {
   *     title: 'Acme UI',
   *     subtitle: 'Internal component library',
   *     version: {
   *       label: `v${version}`,
   *       href: 'https://example.com/CHANGELOG',
   *     },
   *     repo: { href: 'https://github.com/acme/ui' },
   *   },
   * })
   * ```
   */
  homeContent?: HomeContentOptions
}

/**
 * Options for customizing the content of the built-in home page.
 *
 * Used as the object form of {@link IntegrationOptions.home}. Each field can
 * be set to `false` to hide the corresponding section, omitted to fall back to
 * the default value, or set to a custom value to override it.
 */
export interface HomeContentOptions {
  /**
   * The main title shown on the home page. Set to `false` to hide.
   * @default 'Astrobook'
   */
  title?: string | false

  /**
   * The subtitle shown beneath the title. Set to `false` to hide.
   * @default 'The minimal UI component playground'
   */
  subtitle?: string | false

  /**
   * Configuration for the version badge. Set to `false` to hide.
   */
  version?: HomeVersionOptions | false

  /**
   * Configuration for the GitHub repository badge. Set to `false` to hide.
   */
  repo?: HomeRepoOptions | false
}

export interface HomeVersionOptions {
  /**
   * The URL the version badge links to.
   * @default 'https://github.com/ocavue/astrobook/blob/master/packages/astrobook/CHANGELOG.md'
   */
  href?: string

  /**
   * The label rendered inside the version badge.
   *
   * Defaults to the current Astrobook version (e.g. `v0.12.7`).
   * Set a custom string to display your own project's version instead.
   *
   * @example
   *
   * ```js
   * import { version } from './package.json'
   *
   * astrobook({
   *   homeContent: {
   *     version: { label: `v${version}` },
   *   },
   * })
   * ```
   */
  label?: string
}

export interface HomeRepoOptions {
  /**
   * The URL the repository badge links to.
   * @default 'https://github.com/ocavue/astrobook'
   */
  href?: string

  /**
   * The label rendered inside the repository badge.
   * @default 'Star on GitHub'
   */
  label?: string
}

export interface StoryModule {
  /**
   * The id of the story module.
   *
   * @example 'components/ui/button'
   */
  id: string

  /**
   * The name of the story module.
   *
   * @example 'Button'
   */
  name: string

  /**
   * The directory of the story module. It might be an empty string.
   *
   * @example 'components/ui'
   */
  directory: string

  /**
   * The import path of the story module.
   *
   * @example '/Users/john/projects/my-project/components/ui/Button.stories.js'
   * @example '../ui/Button.stories.ts'
   */
  importPath: string

  /**
   * All stories in the story module.
   */
  stories: Story[]
}

export interface Story {
  /**
   * The id of the story.
   *
   * @example 'components/ui/button/primary-button'
   */
  id: string

  /**
   * The name of the story.
   *
   * @example 'PrimaryButton'
   */
  name: string
}

export interface StoryContext {
  /**
   * e.g. 'components/badge/default' — the URL segment of the story
   */
  id: string
  /**
   * The story's display label, falling back to its export name, e.g. 'Default'
   */
  name: string
  module: {
    id: string
    name: string
    directory: string
    /**
     * The module display label, falling back to its file name.
     */
    title: string
  }
  /**
   * The default export's parameters shallow-merged with the story's parameters (story wins).
   */
  parameters: Record<string, unknown>
}

export interface GlobalConfig {
  /**
   * Resolved dashboard viewport presets, or false to hide the toolbar.
   */
  viewports: { name: string; width: number; height?: number }[] | false

  /**
   * Components to wrap every story, in order with the first outermost.
   * Each receives a `story` prop containing its StoryContext.
   * @default []
   */
  decorators: string[]

  /**
   * The computed base URL path for Astrobook, combining the Astro base URL with
   * the optional subpath. Used for generating correct URLs throughout the
   * Astrobook interface.
   */
  astrobookBase: string
  dashboardBase: string
  storyBase: string

  /**
   * The path to an Astro component to provide custom tags in the `<head>`.
   */
  head: string

  /**
   * The path to an Astro component to render on dashboard homepage.
   * @default astrobook/components/home.astro
   */
  home: string

  /**
   * The fully resolved content for the built-in home page. When the user
   * provides a custom `home` component path or `home: false`, this still
   * holds the default values but is not consumed by the rendered component.
   */
  homeContent: {
    title: string | false
    subtitle: string | false
    version: { href: string; label: string } | false
    repo: { href: string; label: string } | false
  }

  /**
   * Array of CSS file paths to import for customizing the look and feel
   * of the Astrobook project. Supports both local files and npm modules.
   */
  css: string[]

  /**
   * The title for the Astrobook website.
   */
  title: string

  trailingSlash: import('astro').AstroConfig['trailingSlash']
}

/**
 * @internal
 */
export interface StoryDecorator {
  /**
   * The component to use as a decorator.
   */
  component: unknown

  /**
   * The props to pass to the decorator.
   */
  props?: object | null | undefined
}

/**
 * The content of a slot: one {@link StorySlotItem}, or an array of them
 * rendered in order.
 */
export type StorySlot = StorySlotItem | StorySlotItem[]

/**
 * An HTML string, a component, or a component with its props as a
 * {@link StorySlotComponent}.
 */
// Components of every framework are objects or functions, so `object` covers them.
export type StorySlotItem = string | StorySlotComponent | object

/**
 * A component, and the props to pass to it, to render into a slot.
 */
export interface StorySlotComponent {
  /**
   * The component to render into the slot.
   */
  component: unknown

  /**
   * The props to pass to the component.
   */
  props?: object | null | undefined
}

/**
 * @internal
 */
export interface StoryNamedExport {
  /**
   * Display label for this story. URLs still use the export name.
   */
  name?: string

  /**
   * Free-form data for decorators and tooling. Shallow-merged over the default
   * export's parameters, with the story's values taking precedence.
   */
  parameters?: Record<string, unknown> | null | undefined

  /**
   * The decorators to apply to the story.
   */
  decorators?: StoryDecorator[] | null | undefined

  /**
   * The arguments to pass to the story.
   */
  args?: object | null | undefined

  /**
   * Prop values to render together as a cartesian product, in key order.
   * Each axis must be a non-empty array or a non-empty label-to-value record.
   * Array labels use String(value), or JSON.stringify for objects and arrays.
   * Cell values override args; slots are repeated in every cell. Global
   * decorators wrap the grid once, while story decorators wrap each cell.
   * One axis renders a wrapping row; multiple axes render a table with the
   * last axis as columns. An empty variants object renders the usual story.
   *
   * @example { size: ['sm', 'md', 'lg'] }
   * @example { size: { Small: 'sm', Large: 'lg' }, color: ['red', 'blue'] }
   */
  variants?: Record<string, unknown[] | Record<string, unknown>>

  /**
   * The slots to pass to the story, keyed by slot name. Use `default` for the
   * default slot.
   */
  slots?: Record<string, StorySlot> | null | undefined
}

declare global {
  interface Window {
    astrobook?: {
      setTheme?: (theme: 'dark' | 'light') => void
      getTheme?: () => 'dark' | 'light'
    }
  }
}

/**
 * Default export of a story file.
 */
export interface StoryDefaultExport {
  component: unknown
  /**
   * Display label for this module. URLs still use the file path.
   */
  title?: string
  /**
   * Free-form module data, shallow-merged with story parameters when rendered.
   */
  parameters?: Record<string, unknown> | null | undefined
}

/**
 * Runtime metadata with raw, unmerged parameters.
 */
export type StoryMeta = Record<
  string,
  {
    title?: string
    parameters: Record<string, unknown>
    stories: Record<
      string,
      {
        name?: string
        parameters: Record<string, unknown>
        variants?: Record<string, string[]>
      }
    >
  }
>
