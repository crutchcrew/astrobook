import AstroBadge from './AstroBadge.astro'
import AstroPanel from './AstroPanel.astro'

export default {
  component: AstroPanel,
}

export const DefaultSlot = {
  slots: {
    default: '<p>Panel <strong>body</strong></p>',
  },
}

export const NamedSlots = {
  args: { title: 'Named slots' },
  slots: {
    header: '<h2>Panel header</h2>',
    default: '<p>Panel body</p>',
    footer: '<small>Panel footer</small>',
  },
}

export const ComponentSlots = {
  slots: {
    header: AstroBadge,
    default: { component: AstroBadge, props: { label: 'Body badge' } },
  },
}

export const SlotArrays = {
  slots: {
    default: [
      { component: AstroBadge, props: { label: 'Icon' } },
      '<span class="label">Label</span>',
    ],
  },
}
