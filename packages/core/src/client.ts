import type { StoryNamedExport } from '@astrobook/types'
import type { AstroComponentFactory } from 'astro/runtime/server/index.js'

export { createPathBuilder, type PathBuilder } from './utils/path-builder'
export { StoryComponent } from './story-component'
export { getVariantAxes, getVariantCells } from './variants'

// Copy from https://github.com/withastro/astro/blob/astro@5.0.0/packages/astro/src/runtime/server/render/astro/factory.ts#L15
function isAstroComponentFactory(obj: unknown): obj is AstroComponentFactory {
  return obj == null
    ? false
    : (obj as Record<string, unknown>).isAstroComponentFactory === true
}

/**
 * @internal
 */
export function parseStoryDefaultExport(
  module: Record<string, unknown>,
  importPath: string,
): {
  isAstroComponent: boolean
  title?: string
  parameters: StoryNamedExport['parameters']
} {
  const defaultExport = 'default' in module ? module['default'] : undefined
  if (!defaultExport) {
    throw new TypeError(
      `[astrobook] '${importPath}' should have a default export`,
    )
  }
  if (typeof defaultExport !== 'object') {
    throw new TypeError(
      `[astrobook] '${importPath}' default export should be an object, but got ${typeof defaultExport}`,
    )
  }

  const title = 'title' in defaultExport ? defaultExport.title : undefined
  if (title !== undefined && typeof title !== 'string') {
    throw new TypeError(
      `[astrobook] The 'title' property of the default export from '${importPath}' should be a string or undefined, but got ${typeof title}`,
    )
  }

  const component =
    'component' in defaultExport ? defaultExport.component : undefined
  if (!component) {
    throw new TypeError(
      `[astrobook] '${importPath}' default export should have a component property`,
    )
  }

  // Whether the component is an Astro component or not (e.g. React, Vue, etc.)
  const isAstroComponent: boolean = isAstroComponentFactory(component)

  const parameters =
    'parameters' in defaultExport ? defaultExport.parameters : undefined
  if (parameters != null && typeof parameters !== 'object') {
    throw new TypeError(
      `[astrobook] The 'parameters' property of the default export from '${importPath}' should be an object or undefined, but got ${typeof parameters}`,
    )
  }

  return {
    isAstroComponent,
    title,
    parameters: parameters as StoryNamedExport['parameters'],
  }
}

/**
 * @internal
 */
export function parseStoryNamedExport(
  module: Record<string, unknown>,
  importPath: string,
  storyName: string,
): StoryNamedExport {
  const storyObject: unknown =
    module && typeof module === 'object' ? module[storyName] : undefined
  if (!storyObject) {
    throw new Error(
      `[astrobook] Unable to find named export '${storyName}' from '${importPath}'`,
    )
  }
  if (typeof storyObject !== 'object') {
    throw new TypeError(
      `[astrobook] Named export '${storyName}' from '${importPath}' should be an object, but got ${typeof storyObject}`,
    )
  }

  const name = 'name' in storyObject ? storyObject.name : undefined
  if (name !== undefined && typeof name !== 'string') {
    throw new TypeError(
      `[astrobook] The 'name' property of the named export '${storyName}' from '${importPath}' should be a string or undefined, but got ${typeof name}`,
    )
  }

  const decorators =
    'decorators' in storyObject ? storyObject.decorators : undefined

  if (decorators != null && !Array.isArray(decorators)) {
    throw new TypeError(
      `[astrobook] The 'decorators' property of the named export '${storyName}' from '${importPath}' should be an array or undefined, but got ${typeof decorators}`,
    )
  }

  const args = 'args' in storyObject ? storyObject.args : undefined
  if (args != null && typeof args !== 'object') {
    throw new TypeError(
      `[astrobook] The 'args' property of the named export '${storyName}' from '${importPath}' should be an object or undefined, but got ${typeof args}`,
    )
  }

  const parameters =
    'parameters' in storyObject ? storyObject.parameters : undefined
  if (parameters != null && typeof parameters !== 'object') {
    throw new TypeError(
      `[astrobook] The 'parameters' property of the named export '${storyName}' from '${importPath}' should be an object or undefined, but got ${typeof parameters}`,
    )
  }

  const variants = 'variants' in storyObject ? storyObject.variants : undefined
  if (variants !== undefined && !isPlainObject(variants)) {
    throw new TypeError(
      `[astrobook] The 'variants' property of the named export '${storyName}' from '${importPath}' should be an object or undefined, but got ${Array.isArray(variants) ? 'an array' : describe(variants)}`,
    )
  }
  for (const [axis, values] of Object.entries(variants ?? {})) {
    if (
      !(Array.isArray(values) && values.length > 0) &&
      !(isPlainObject(values) && Object.keys(values).length > 0)
    ) {
      throw new TypeError(
        `[astrobook] The '${axis}' variant axis of the named export '${storyName}' from '${importPath}' should be a non-empty array or non-empty plain object, but got ${values === null ? 'null' : Array.isArray(values) ? 'an array' : typeof values}`,
      )
    }
  }

  const slots = 'slots' in storyObject ? storyObject.slots : undefined
  if (slots != null && typeof slots !== 'object') {
    throw new TypeError(
      `[astrobook] The 'slots' property of the named export '${storyName}' from '${importPath}' should be an object or undefined, but got ${typeof slots}`,
    )
  }
  for (const [name, slot] of Object.entries(slots ?? {})) {
    const items: unknown[] = Array.isArray(slot) ? slot : [slot]
    for (const item of items) {
      if (
        item == null ||
        Array.isArray(item) ||
        !['string', 'object', 'function'].includes(typeof item)
      ) {
        throw new TypeError(
          `[astrobook] The '${name}' slot of the named export '${storyName}' from '${importPath}' should be an HTML string, a component, or an array of them, but got ${describe(item)}`,
        )
      }
    }
  }

  return {
    name,
    decorators,
    args,
    variants: variants as StoryNamedExport['variants'],
    parameters: parameters as StoryNamedExport['parameters'],
    slots: slots as StoryNamedExport['slots'],
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false
  const prototype: unknown = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function describe(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'a nested array'
  return typeof value
}

/**
 * Shared display labels for rendered stories and runtime sidebar metadata.
 */
export function getStoryLabels(
  module: { name: string; title?: string },
  story: { name?: string },
  exportName: string,
  hoisted = false,
): { name: string; title: string } {
  const title = module.title ?? module.name
  return { title, name: story.name ?? (hoisted ? title : exportName) }
}

/**
 * Shallow-merge module defaults with a story's parameters.
 */
export function mergeStoryParameters(
  defaults: StoryNamedExport['parameters'],
  story: StoryNamedExport['parameters'],
): Record<string, unknown> {
  return { ...defaults, ...story }
}
