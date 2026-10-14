import { PreactCounter, type PreactCounterProps } from './PreactCounter'

export default {
  component: PreactCounter,
}

export const Default = {
  args: {} satisfies PreactCounterProps,
}

export const LargeStep = {
  args: {
    step: 5,
  } satisfies PreactCounterProps,
}

export const WithSlot = {
  args: {
    step: 2,
  },
  slots: {
    default: '<em class="slot-content">Slot content</em>',
  },
}
