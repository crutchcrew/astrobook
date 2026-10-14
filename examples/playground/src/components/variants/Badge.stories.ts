import AstroDecorator from '../decorators/AstroDecorator.astro'

import Badge from './Badge.astro'

export default { component: Badge }

export const AllSizes = {
  args: { size: 'lg', color: 'accent', label: 'New' },
  variants: { size: ['sm', 'md', 'lg'] },
  slots: { default: '<em class="variant-slot">!</em>' },
  decorators: [{ component: AstroDecorator, props: { label: 'Variant cell' } }],
}

export const ColorsAndSizes = {
  args: { size: 'lg', color: 'neutral', label: 'New' },
  variants: {
    size: { Small: 'sm', Medium: 'md', Large: 'lg' },
    color: { Neutral: 'neutral', Accent: 'accent' },
  },
  decorators: [{ component: AstroDecorator, props: { label: 'Variant cell' } }],
}

export const AllCombinations = {
  variants: {
    size: { Small: 'sm', Large: 'lg' },
    outlined: [false, true],
    color: { Neutral: 'neutral', Accent: 'accent' },
  },
}
