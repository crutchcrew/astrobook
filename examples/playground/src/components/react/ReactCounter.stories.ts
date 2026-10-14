import { ReactCounter, type ReactCounterProps } from './ReactCounter'

export default {
  component: ReactCounter,
}

export const Default = {
  args: {} satisfies ReactCounterProps,
}

export const LargeStep = {
  args: {
    step: 5,
  } satisfies ReactCounterProps,
}

export const WithSlot = {
  args: {
    step: 2,
  },
  slots: {
    default: '<em class="slot-content">Slot content</em>',
  },
}
