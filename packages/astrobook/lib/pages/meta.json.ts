import type { StoryContext } from '@astrobook/types'
import {
  buildTree,
  type TreeNode,
} from '@astrobook/ui/components/build-tree.ts'
import type { APIRoute } from 'astro'
import {
  createPathBuilder,
  getStoryLabels,
  mergeStoryParameters,
} from 'astrobook/client'
import config from 'virtual:astrobook/global-config.mjs'
import meta from 'virtual:astrobook/story-meta.mjs'
import modules from 'virtual:astrobook/story-modules.mjs'

export const prerender = true

export const GET: APIRoute = () => {
  const buildPath = createPathBuilder(config)
  const entries = new Map(
    modules.flatMap((module) => {
      const moduleMeta = meta[module.id]
      return module.stories.map((story) => {
        const storyMeta = moduleMeta?.stories[story.id]
        const labels = getStoryLabels(
          { name: module.name, title: moduleMeta?.title },
          storyMeta ?? {},
          story.name,
        )
        let parameters: StoryContext['parameters'] = {}
        try {
          // JSON serialization intentionally drops values that cannot appear in the manifest.
          // eslint-disable-next-line unicorn/prefer-structured-clone
          parameters = JSON.parse(
            JSON.stringify(
              mergeStoryParameters(
                moduleMeta?.parameters,
                storyMeta?.parameters,
              ),
            ),
          ) as StoryContext['parameters']
        } catch (error) {
          console.warn(
            `[astrobook] Unable to serialize parameters for '${story.id}'; using {}`,
            error,
          )
        }
        return [
          story.id,
          {
            id: story.id,
            name: labels.name,
            module: {
              id: module.id,
              name: module.name,
              title: labels.title,
              directory: module.directory,
            },
            parameters,
            url: buildPath(config.storyBase, story.id),
            dashboardUrl: buildPath(config.dashboardBase, story.id),
          },
        ] as const
      })
    }),
  )
  const stories: unknown[] = []
  function visit(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (node.type === 'story') {
        stories.push({ ...entries.get(node.id), name: node.name })
      } else {
        visit(node.children)
      }
    }
  }
  visit(buildTree(modules, meta))
  return new Response(JSON.stringify({ stories }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
