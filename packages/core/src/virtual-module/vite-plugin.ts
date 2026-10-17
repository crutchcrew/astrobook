import fs from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { GlobalConfig, StoryModule } from '@astrobook/types'
import type { AstroConfig, AstroIntegrationLogger } from 'astro'
import type { Plugin, ViteDevServer } from 'vite'

import { serializeStoryMeta } from './story-meta'
import { loadStoryModules } from './story-modules'
import {
  DECORATORS_ID,
  DECORATORS_RESOLVED_ID,
  COMPONENT_HEAD_ID,
  COMPONENT_HEAD_RESOLVED_ID,
  COMPONENT_HOME_ID,
  COMPONENT_HOME_RESOLVED_ID,
  STORY_META_ID,
  STORY_META_RESOLVED_ID,
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

  // Astro sets the integration up again on every restart, so each dev server
  // gets its own id.
  let serverId: string | undefined

  /**
   * Astro injects one route per story when it sets up the integration, so a
   * story added, renamed or removed later needs Astro itself to restart; a Vite
   * restart only refreshes the sidebar and leaves the new story's route a 404.
   * Astro restarts when a file passed to `addWatchFile` changes, so rewrite it.
   */
  async function rescanStoryModules() {
    const newStoryModules = await loadStoryModules(rootDir)
    if (newStoryModules === storyModules) return
    storyModules = newStoryModules
    restartPending = true
    logger.info(`Stories changed, restarting`)
    await fs.writeFile(manifestPath, storyModules, 'utf-8')
  }

  // Astro sets the integration up again on restart, so this plugin never sees
  // the flag cleared.
  let restartPending = false
  let syncing: Promise<void> | undefined
  let rescanAgain = false

  /**
   * Runs one rescan at a time, so an older scan can never finish last and
   * write a stale list. A change during a scan queues one more. It never
   * rejects: a half-written story that fails to parse keeps the previous list
   * until the next save, instead of an unhandled rejection in the watcher.
   */
  function syncStoryModules(): Promise<void> {
    if (syncing) {
      rescanAgain = true
      return syncing
    }
    syncing = (async () => {
      do {
        rescanAgain = false
        try {
          await rescanStoryModules()
        } catch (error) {
          logger.warn(`Unable to scan stories: ${String(error)}`)
        }
      } while (rescanAgain)
    })().finally(() => {
      syncing = undefined
    })
    return syncing
  }

  let storyUpdate:
    { file: string; timestamp: number; synced: Promise<void> } | undefined

  /**
   * Vite calls `hotUpdate` once per environment for the same change, so they
   * share one rescan.
   */
  function syncStoryUpdate(file: string, timestamp: number) {
    if (storyUpdate?.file !== file || storyUpdate.timestamp !== timestamp) {
      storyUpdate = { file, timestamp, synced: syncStoryModules() }
    }
    return storyUpdate.synced
  }

  function isStoryFile(filePath: string) {
    return filePath.includes('.stories.')
  }

  return {
    name: 'astrobook/virtual-files',
    resolveId(id) {
      switch (id) {
        case DECORATORS_ID:
          return DECORATORS_RESOLVED_ID
        case STORY_META_ID:
          return STORY_META_RESOLVED_ID
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
    load(id, options) {
      switch (id) {
        case DECORATORS_RESOLVED_ID:
          return [
            ...config.decorators.map(
              (id, index) => `import Decorator${index} from ${resolveId(id)};`,
            ),
            `export default [${config.decorators.map((_, index) => `Decorator${index}`).join(', ')}];`,
          ].join('\n')
        case STORY_META_RESOLVED_ID:
          if (!options?.ssr) {
            throw new Error(
              '[astrobook] Story metadata is only available on the server',
            )
          }
          return serializeStoryMeta(
            JSON.parse(
              storyModules.slice('export default '.length),
            ) as StoryModule[],
          )
        case STORY_MODULES_RESOLVED_ID:
          return storyModules
        case GLOBAL_CONFIG_RESOLVED_ID:
          return `const config = ${JSON.stringify({ ...config, serverId } satisfies GlobalConfig)}; export default config;`
        case COMPONENT_HEAD_RESOLVED_ID:
          return `export { default } from ${resolveId(config.head)};`
        case COMPONENT_HOME_RESOLVED_ID:
          return `export { default } from ${resolveId(config.home)};`
        case USER_CSS_RESOLVED_ID:
          return config.css.map((id) => `import ${resolveId(id)};`).join('')
      }
    },
    configureServer(server: ViteDevServer) {
      serverId = crypto.randomUUID()
      const onStoryFileChange = async (filePath: string) => {
        if (isStoryFile(filePath)) await syncStoryModules()
      }
      server.watcher.on('add', onStoryFileChange)
      server.watcher.on('unlink', onStoryFileChange)
    },
    hotUpdate: {
      order: 'pre',
      /**
       * An edited story file can add, rename or remove its named exports. When
       * it does, the update is dropped: Astro would reload the page right away,
       * the old server would render it during the restart, and the page would
       * keep the old stories. Without the reload the page stays on the old
       * server's socket, which the restart closes, and the page reloads once
       * the new server answers (see `dev-reload.ts` in `@astrobook/ui`). The
       * flag also covers a story added or removed, whose rescan the watcher
       * may have finished before this hook runs.
       */
      async handler({ file, timestamp }) {
        if (!isStoryFile(file)) return
        await syncStoryUpdate(file, timestamp)
        if (restartPending) return []
      },
    },
  }
}
