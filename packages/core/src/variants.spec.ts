import { describe, expect, it } from 'vitest'

import { parseStoryNamedExport } from './client'
import { getVariantAxes, getVariantCells } from './variants'

const importPath = '/src/Badge.stories.ts'
function parse(variants: unknown) {
  return parseStoryNamedExport({ All: { variants } }, importPath, 'All')
}

describe('variant validation', () => {
  it.each([
    undefined,
    {},
    { size: ['sm', 'md'] },
    { size: { Small: 'sm' }, color: ['red'] },
    { value: [null, undefined, false, { nested: [1] }] },
    {
      size: Object.assign(Object.create(null) as Record<string, unknown>, {
        Small: 'sm',
      }),
    },
  ])('accepts %j', (variants) => {
    expect(parse(variants).variants).toBe(variants)
  })

  it('accepts an omitted variants property', () => {
    expect(
      parseStoryNamedExport({ All: {} }, importPath, 'All').variants,
    ).toBeUndefined()
  })

  it.each([null, [], 'sm', 1, true, () => {}, new Date(), new Map()])(
    'rejects invalid variants %j',
    (variants) => {
      expect(() => parse(variants)).toThrow(TypeError)
      expect(() => parse(variants)).toThrow(
        `The 'variants' property of the named export 'All' from '${importPath}' should be an object or undefined`,
      )
    },
  )

  it.each([
    undefined,
    null,
    [],
    {},
    'sm',
    1,
    true,
    () => {},
    new Date(),
    new Map(),
    Object.create({ Small: 'sm' }) as unknown,
  ])('rejects invalid or empty axes %j', (size) => {
    expect(() => parse({ size })).toThrow(TypeError)
    expect(() => parse({ size })).toThrow(
      `The 'size' variant axis of the named export 'All' from '${importPath}' should be a non-empty array or non-empty plain object`,
    )
  })
})

describe('variant labels and products', () => {
  it('labels primitive values with String and objects and arrays with JSON', () => {
    const values = [
      'sm',
      2,
      true,
      false,
      null,
      undefined,
      { size: 'sm' },
      ['a', 1],
    ]
    const [axis] = getVariantAxes({ value: values })
    expect(axis.name).toBe('value')
    expect(axis.entries.map(({ label }) => label)).toEqual([
      'sm',
      '2',
      'true',
      'false',
      'null',
      'undefined',
      '{"size":"sm"}',
      '["a",1]',
    ])
    expect(axis.entries.map(({ value }) => value)).toEqual(values)
    expect(axis.entries[6].value).toBe(values[6])
  })

  it('preserves record labels and values in key order', () => {
    const value = { nested: true }
    expect(
      getVariantAxes({
        size: { Small: 'sm', 'Large size': 'lg' },
        config: { Named: value },
      }),
    ).toEqual([
      {
        name: 'size',
        entries: [
          { label: 'Small', value: 'sm' },
          { label: 'Large size', value: 'lg' },
        ],
      },
      { name: 'config', entries: [{ label: 'Named', value }] },
    ])
  })

  it('builds every combination with the last axis varying fastest', () => {
    const axes = getVariantAxes({
      size: { Small: 'sm', Large: 'lg' },
      outlined: [false, true],
      color: ['red', 'blue'],
    })
    const cells = getVariantCells(axes)
    expect(cells).toEqual([
      {
        labels: ['Small', 'false', 'red'],
        values: { size: 'sm', outlined: false, color: 'red' },
      },
      {
        labels: ['Small', 'false', 'blue'],
        values: { size: 'sm', outlined: false, color: 'blue' },
      },
      {
        labels: ['Small', 'true', 'red'],
        values: { size: 'sm', outlined: true, color: 'red' },
      },
      {
        labels: ['Small', 'true', 'blue'],
        values: { size: 'sm', outlined: true, color: 'blue' },
      },
      {
        labels: ['Large', 'false', 'red'],
        values: { size: 'lg', outlined: false, color: 'red' },
      },
      {
        labels: ['Large', 'false', 'blue'],
        values: { size: 'lg', outlined: false, color: 'blue' },
      },
      {
        labels: ['Large', 'true', 'red'],
        values: { size: 'lg', outlined: true, color: 'red' },
      },
      {
        labels: ['Large', 'true', 'blue'],
        values: { size: 'lg', outlined: true, color: 'blue' },
      },
    ])
    expect(new Set(cells.map(({ values }) => values)).size).toBe(8)
    expect(axes[0].entries).toEqual([
      { label: 'Small', value: 'sm' },
      { label: 'Large', value: 'lg' },
    ])
  })

  it('renders one cell per value for a single axis', () => {
    expect(getVariantCells(getVariantAxes({ size: ['sm', 'lg'] }))).toEqual([
      { labels: ['sm'], values: { size: 'sm' } },
      { labels: ['lg'], values: { size: 'lg' } },
    ])
  })

  it('has one empty combination for zero axes', () => {
    expect(getVariantAxes(undefined)).toEqual([])
    expect(getVariantCells(getVariantAxes({}))).toEqual([
      { labels: [], values: {} },
    ])
  })
})
