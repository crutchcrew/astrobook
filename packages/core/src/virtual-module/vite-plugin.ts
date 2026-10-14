import fs from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { GlobalConfig } from '@astrobook/types'
import type { AstroConfig, AstroIntegrationLogger } from 'astro'
import type { Plugin, ViteDevServer } from 'vite'

import { loadStoryModules } from './story-modules'
import {
  COMPONENT_HEAD_ID,
  COMPONENT_HEAD_RESOLVED_ID,
  COMPONENT_HOME_ID,
  COMPONENT_HOME_RESOLVED_ID,
  STORY_MODULES_ID,
  STORY_MODULES_RESOLVED_ID,
  GLOBAL_CONFIG_ID,
  GLOBAL_CONFIG_RESOLVED_ID,
  USER_CSS_RESOLVED_ID,
  USER_CSS_ID,
} from './virtual-module-ids'

export function createVirtualFilesPlugin(
  rootDir: string,
  manifestPath: string,
  initialStoryModules: string,
  config: GlobalConfig,
  astroConfig: AstroConfig,
  logger: AstroIntegrationLogger,
): Plugin {
  const root = astroConfig.root

  /**
   * Resolves module IDs to a usable format:
   * - Relative paths (e.g. `'./module.js'`) are resolved against `base` and formatted as an absolute path.
   * - Package identifiers (e.g. `'module'`) are returned unchanged.
   *
   * By default, `base` is the project root directory.
   */
  function resolveId(id: string, base = root) {
    return JSON.stringify(
      id.startsWith('.') ? resolve(fileURLToPath(base), id) : id,
    )
  }

  let storyModules = initialStoryModules

  /**
   * Astro injects one route per story when it sets up the integration, so a
   * story added, renamed or removed later needs Astro itself to restart; a Vite
   * restart only refreshes the sidebar and leaves the new story's route a 404.
   * Astro restarts when a file passed to `addWatchFile` changes, so rewrite it.
   */
  async function syncStoryModules() {
    const newStoryModules = await loadStoryModules(rootDir)
    if (newStoryModules === storyModules) return
    storyModules = newStoryModules
    logger.info(`Stories changed, restarting`)
    await fs.writeFile(manifestPath, storyModules, 'utf-8')
  }

  function isStoryFile(filePath: string) {
    return filePath.includes('.stories.')
  }

  return {
    name: 'astrobook/virtual-files',
    resolveId(id) {
      switch (id) {
        case STORY_MODULES_ID:
          return STORY_MODULES_RESOLVED_ID
        case GLOBAL_CONFIG_ID:
          return GLOBAL_CONFIG_RESOLVED_ID
        case COMPONENT_HEAD_ID:
          return COMPONENT_HEAD_RESOLVED_ID
        case COMPONENT_HOME_ID:
          return COMPONENT_HOME_RESOLVED_ID
        case USER_CSS_ID:
          return USER_CSS_RESOLVED_ID
      }
    },
    load(id) {
      switch (id) {
        case STORY_MODULES_RESOLVED_ID:
          return storyModules
        case GLOBAL_CONFIG_RESOLVED_ID:
          return `const config = ${JSON.stringify(config)}; export default config;`
        case COMPONENT_HEAD_RESOLVED_ID:
          return `export { default } from ${resolveId(config.head)};`
        case COMPONENT_HOME_RESOLVED_ID:
          return `export { default } from ${resolveId(config.home)};`
        case USER_CSS_RESOLVED_ID:
          return config.css.map((id) => `import ${resolveId(id)};`).join('')
      }
    },
    configureServer(server: ViteDevServer) {
      const onStoryFileChange = async (filePath: string) => {
        if (isStoryFile(filePath)) await syncStoryModules()
      }
      server.watcher.on('add', onStoryFileChange)
      server.watcher.on('unlink', onStoryFileChange)
    },
    async handleHotUpdate(ctx) {
      // An edited story file can add, rename or remove its named exports.
      if (isStoryFile(ctx.file)) await syncStoryModules()
    },
  }
}
