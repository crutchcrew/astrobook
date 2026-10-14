import AstroDecorator from '../decorators/AstroDecorator.astro'

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

export const StepVariants = {
  args: { step: 99 } satisfies ReactCounterProps,
  variants: { step: { One: 1, Five: 5, Ten: 10 } },
  slots: { default: '<em class="variant-slot">Independent counter</em>' },
  decorators: [{ component: AstroDecorator, props: { label: 'Variant cell' } }],
}
