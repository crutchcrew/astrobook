import type { ComponentProps } from 'astro/types'

import AstroCounter from './AstroCounter.astro'

type AstroCounterProps = ComponentProps<typeof AstroCounter>

export default {
  component: AstroCounter,
  title: 'Astro Counter',
  parameters: { theme: 'light', layout: 'centered' },
}

export const Default = {
  args: {} satisfies AstroCounterProps,
}

export const LargeStep = {
  name: 'Count by five',
  parameters: { theme: 'dark', screenshot: false },
  args: {
    step: 5,
  } satisfies AstroCounterProps,
}

export const WithSlot = {
  args: {
    step: 2,
  },
  slots: {
    default: '<em class="slot-content">Slot content</em>',
  },
}
