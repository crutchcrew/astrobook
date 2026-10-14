import type { StoryNamedExport } from '@astrobook/types'

export interface VariantAxis {
  name: string
  entries: { label: string; value: unknown }[]
}

export interface VariantCell {
  labels: string[]
  values: Record<string, unknown>
}

/**
 * Normalize array values and label-to-value records in axis key order.
 */
export function getVariantAxes(
  variants: StoryNamedExport['variants'],
): VariantAxis[] {
  return Object.entries(variants ?? {}).map(([name, axis]) => ({
    name,
    entries: Array.isArray(axis)
      ? axis.map((value) => ({
          label:
            value !== null && typeof value === 'object'
              ? JSON.stringify(value)
              : String(value),
          value,
        }))
      : Object.entries(axis).map(([label, value]) => ({ label, value })),
  }))
}

/**
 * The last axis varies fastest; zero axes have one empty combination.
 */
export function getVariantCells(axes: VariantAxis[]): VariantCell[] {
  return axes.reduce<VariantCell[]>(
    (cells, axis) =>
      cells.flatMap((cell) =>
        axis.entries.map(({ label, value }) => ({
          labels: [...cell.labels, label],
          values: { ...cell.values, [axis.name]: value },
        })),
      ),
    [{ labels: [], values: {} }],
  )
}
