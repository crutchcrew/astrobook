import SolidCounter, { type SolidCounterProps } from './SolidCounter'

export default {
  component: SolidCounter,
}

export const Default = {
  args: {} satisfies SolidCounterProps,
}

export const LargeStep = {
  args: {
    step: 5,
  } satisfies SolidCounterProps,
}

export const WithSlot = {
  args: {
    step: 2,
  },
  slots: {
    default: '<em class="slot-content">Slot content</em>',
  },
}
