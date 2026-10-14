import type { StoryModule } from '@astrobook/types'

/**
 * Each import is isolated so a broken story module cannot break the sidebar.
 */
export function serializeStoryMeta(modules: StoryModule[]): string {
  return [
    `import { getVariantAxes, parseStoryDefaultExport, parseStoryNamedExport } from 'astrobook/client';`,
    'const meta = {};',
    ...modules.map(
      (module) => `
      meta[${JSON.stringify(module.id)}] = { parameters: {}, stories: {} };
      try {
        const module = await import(${JSON.stringify(module.importPath)});
        const { title, parameters } = parseStoryDefaultExport(module, ${JSON.stringify(module.importPath)});
        const stories = {};
        ${module.stories
          .map(
            (story) => `
          {
            const { name, parameters, variants } = parseStoryNamedExport(module, ${JSON.stringify(module.importPath)}, ${JSON.stringify(story.name)});
            stories[${JSON.stringify(story.id)}] = {
              name,
              parameters: parameters ?? {},
              ...(variants === undefined ? {} : {
                variants: Object.fromEntries(getVariantAxes(variants).map(({ name, entries }) => [name, entries.map(({ label }) => label)])),
              }),
            };
          }
        `,
          )
          .join('')}
        meta[${JSON.stringify(module.id)}] = { title, parameters: parameters ?? {}, stories };
      } catch (error) {
        console.warn(${JSON.stringify(`[astrobook] Unable to load story metadata from '${module.importPath}'; falling back to raw names`)}, error);
      }
    `,
    ),
    'export default meta;',
  ].join('\n')
}
