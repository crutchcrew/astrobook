import SvelteCounter from './SvelteCounter.svelte'

type SvelteCounterProps = {
  step?: number
}

export default {
  component: SvelteCounter,
}

export const Default = {
  args: {} satisfies SvelteCounterProps,
}

export const LargeStep = {
  args: {
    step: 5,
  } satisfies SvelteCounterProps,
}

export const WithSlot = {
  args: {
    step: 2,
  },
  slots: {
    default: '<em class="slot-content">Slot content</em>',
  },
}
