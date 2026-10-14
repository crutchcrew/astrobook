import { describe, expect, it } from 'vitest'

import { parseStoryDefaultExport, parseStoryNamedExport } from './client'

const importPath = '/src/Button.stories.ts'

describe('story parameters', () => {
  it.each([undefined, null, {}, { theme: 'dark', nested: { value: 1 } }])(
    'accepts parameters %j in both exports',
    (parameters) => {
      const module = {
        default: { component: {}, parameters },
        Default: { parameters },
      }
      expect(parseStoryDefaultExport(module, importPath).parameters).toBe(
        parameters,
      )
      expect(
        parseStoryNamedExport(module, importPath, 'Default').parameters,
      ).toBe(parameters)
    },
  )

  it('accepts exports with no parameters property', () => {
    const module = { default: { component: {} }, Default: {} }
    expect(
      parseStoryDefaultExport(module, importPath).parameters,
    ).toBeUndefined()
    expect(
      parseStoryNamedExport(module, importPath, 'Default').parameters,
    ).toBeUndefined()
  })

  it.each(['dark', 123, true, () => {}])(
    'rejects invalid parameters %j',
    (parameters) => {
      const module = {
        default: { component: {}, parameters },
        Default: { parameters },
      }
      expect(() => parseStoryDefaultExport(module, importPath)).toThrow(
        new TypeError(
          `[astrobook] The 'parameters' property of the default export from '${importPath}' should be an object or undefined, but got ${typeof parameters}`,
        ),
      )
      expect(() =>
        parseStoryNamedExport(module, importPath, 'Default'),
      ).toThrow(
        new TypeError(
          `[astrobook] The 'parameters' property of the named export 'Default' from '${importPath}' should be an object or undefined, but got ${typeof parameters}`,
        ),
      )
    },
  )
})

describe('display name validation', () => {
  it.each([undefined, '', 'Human label'])('accepts %j', (label) => {
    const module = {
      default: { component: {}, title: label },
      Default: { name: label },
    }
    expect(parseStoryDefaultExport(module, importPath).title).toBe(label)
    expect(parseStoryNamedExport(module, importPath, 'Default').name).toBe(
      label,
    )
  })

  it.each([null, 123, true, {}, [], () => {}])('rejects %j', (label) => {
    const module = {
      default: { component: {}, title: label },
      Default: { name: label },
    }
    expect(() => parseStoryDefaultExport(module, importPath)).toThrow(
      new TypeError(
        `[astrobook] The 'title' property of the default export from '${importPath}' should be a string or undefined, but got ${typeof label}`,
      ),
    )
    expect(() => parseStoryNamedExport(module, importPath, 'Default')).toThrow(
      new TypeError(
        `[astrobook] The 'name' property of the named export 'Default' from '${importPath}' should be a string or undefined, but got ${typeof label}`,
      ),
    )
  })
})
