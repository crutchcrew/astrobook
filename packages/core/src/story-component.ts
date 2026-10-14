import type { StorySlot, StorySlotItem } from '@astrobook/types'
import {
  createComponent,
  render,
  renderComponent,
  unescapeHTML,
} from 'astro/runtime/server/index.js'

type SSRResult = Parameters<typeof renderComponent>[0]

interface StoryComponentProps {
  component: unknown
  props?: object | null | undefined
  slots?: Record<string, StorySlot> | null | undefined
}

function renderSlotItem(result: SSRResult, name: string, item: StorySlotItem) {
  if (typeof item === 'string') {
    return render`${unescapeHTML(item)}`
  }
  const { component, props } =
    'component' in item ? item : { component: item, props: undefined }
  return render`${renderComponent(result, name, component, props ?? {})}`
}

function renderSlot(result: SSRResult, name: string, slot: StorySlot) {
  const items: StorySlotItem[] = [slot].flat()
  return render`${items.map((item) => renderSlotItem(result, name, item))}`
}

/**
 * Renders a story's component with its slots.
 *
 * Astro's compiler only accepts slot names written in the template, and a
 * story's slot names are known only at runtime, so this component renders
 * through Astro's runtime instead of a template.
 */
export const StoryComponent = createComponent(
  (result: SSRResult, { component, props, slots }: StoryComponentProps) => {
    const slotRenderers = Object.fromEntries(
      Object.entries(slots ?? {}).map(([name, slot]) => [
        name,
        () => renderSlot(result, name, slot),
      ]),
    )
    return render`${renderComponent(result, 'Story', component, { ...props }, slotRenderers)}`
  },
)
