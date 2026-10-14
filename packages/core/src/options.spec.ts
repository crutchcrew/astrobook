import { version } from '@astrobook/core/package.json'
import { describe, expect, it } from 'vitest'

import { resolveOptions } from './options'

const defaultHomeContent = {
  title: 'Astrobook',
  subtitle: 'The minimal UI component playground',
  version: {
    href: 'https://github.com/ocavue/astrobook/blob/master/packages/astrobook/CHANGELOG.md',
    label: `v${version}`,
  },
  repo: {
    href: 'https://github.com/ocavue/astrobook',
    label: 'Star on GitHub',
  },
}

const defaultViewports = [
  { name: 'Mobile', width: 375 },
  { name: 'Tablet', width: 768 },
  { name: 'Desktop', width: 1440 },
]

describe('resolveOptions', () => {
  it('should return default values', () => {
    expect(resolveOptions()).toEqual({
      directory: '.',
      subpath: '',
      dashboardSubpath: 'dashboard',
      previewSubpath: 'stories',
      title: 'Astrobook',
      css: [],
      decorators: [],
      viewports: defaultViewports,
      head: 'astrobook/components/head.astro',
      home: 'astrobook/components/home.astro',
      homeContent: defaultHomeContent,
    })
  })

  it('should override options', () => {
    expect(
      resolveOptions({
        directory: './components',
        title: 'My Library',
        css: ['./styles/main.css'],
        home: './MyCustomHome.astro',
      }),
    ).toEqual({
      directory: './components',
      subpath: '',
      dashboardSubpath: 'dashboard',
      previewSubpath: 'stories',
      title: 'My Library',
      css: ['./styles/main.css'],
      decorators: [],
      viewports: defaultViewports,
      head: 'astrobook/components/head.astro',
      home: './MyCustomHome.astro',
      homeContent: defaultHomeContent,
    })
  })

  it('should preserve decorator order', () => {
    const decorators = ['./Outer.astro', 'package/Inner']
    expect(resolveOptions({ decorators }).decorators).toEqual(decorators)
  })

  it.each([false as const, []])(
    'should disable viewports with %j',
    (viewports) => {
      expect(resolveOptions({ viewports }).viewports).toEqual(viewports)
    },
  )

  it('should accept custom viewport widths and optional heights', () => {
    const viewports = [
      { name: 'Phone', width: 390, height: 844 },
      { name: 'Laptop', width: 1280 },
    ]
    expect(resolveOptions({ viewports }).viewports).toEqual(viewports)
  })

  it.each([
    null,
    true,
    'Mobile',
    [{ name: '', width: 375 }],
    [{ name: '  ', width: 375 }],
    [{ name: 'Phone' }],
    [{ name: 'Phone', width: 0 }],
    [{ name: 'Phone', width: -1 }],
    [{ name: 'Phone', width: 375.5 }],
    [{ name: 'Phone', width: Infinity }],
    [{ name: 'Phone', width: '375' }],
    [{ name: 'Phone', width: 375, height: 0 }],
    [{ name: 'Phone', width: 375, height: -1 }],
    [{ name: 'Phone', width: 375, height: 600.5 }],
    [{ name: 'Phone', width: 375, height: Infinity }],
    [{ name: 'Phone', width: 375, height: '600' }],
    [
      { name: 'Phone', width: 375 },
      { name: 'Phone', width: 768 },
    ],
  ])('should reject invalid viewports %j', (viewports) => {
    expect(() => {
      // @ts-expect-error - testing invalid options
      resolveOptions({ viewports })
    }).toThrow(/Invalid Astrobook options:/)
  })

  it.each([null, 'Decorator.astro', [123]])(
    'should reject invalid decorators %j',
    (decorators) => {
      expect(() => {
        // @ts-expect-error - testing invalid type
        resolveOptions({ decorators })
      }).toThrow(/Invalid Astrobook options:/)
    },
  )

  it('should treat `home: false` as the empty home component', () => {
    const resolved = resolveOptions({ home: false })
    expect(resolved.home).toBe('astrobook/components/empty.astro')
    expect(resolved.homeContent).toEqual(defaultHomeContent)
  })

  it('should accept a partial `homeContent` object', () => {
    const resolved = resolveOptions({
      homeContent: {
        title: 'Acme UI',
        repo: { href: 'https://github.com/acme/ui' },
      },
    })
    expect(resolved.home).toBe('astrobook/components/home.astro')
    expect(resolved.homeContent).toEqual({
      title: 'Acme UI',
      subtitle: 'The minimal UI component playground',
      version: defaultHomeContent.version,
      repo: {
        href: 'https://github.com/acme/ui',
        label: 'Star on GitHub',
      },
    })
  })

  it('should hide individual sections when set to false', () => {
    const resolved = resolveOptions({
      homeContent: {
        title: false,
        subtitle: false,
        version: false,
        repo: false,
      },
    })
    expect(resolved.home).toBe('astrobook/components/home.astro')
    expect(resolved.homeContent).toEqual({
      title: false,
      subtitle: false,
      version: false,
      repo: false,
    })
  })

  it('should throw error for invalid options', () => {
    expect(() => {
      // @ts-expect-error - testing invalid type
      resolveOptions({ directory: 111, css: [222, 333] })
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: Invalid Astrobook options:
      × Invalid type: Expected string but received 111
        → at directory
      × Invalid type: Expected string but received 222
        → at css.0
      × Invalid type: Expected string but received 333
        → at css.1]
    `)
  })

  it('should throw error for invalid `home` value', () => {
    expect(() => {
      // @ts-expect-error - testing invalid type
      resolveOptions({ home: 123 })
    }).toThrow(/Invalid Astrobook options:/)
  })
})
