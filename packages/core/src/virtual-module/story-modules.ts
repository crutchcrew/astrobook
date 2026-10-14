import type { StoryModule } from '@astrobook/types'

import { getStoryModules } from './get-story-modules'

export function serializeStoryModules(modules: StoryModule[]): string {
  return `export default ${JSON.stringify(modules)}`
}

export async function loadStoryModules(rootDir: string): Promise<string> {
  return serializeStoryModules(await getStoryModules(rootDir))
}
