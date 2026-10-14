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
      head: 'astrobook/components/head.astro',
      home: './MyCustomHome.astro',
      homeContent: defaultHomeContent,
    })
  })

  it('should preserve decorator order', () => {
    const decorators = ['./Outer.astro', 'package/Inner']
    expect(resolveOptions({ decorators }).decorators).toEqual(decorators)
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
