import { expect, test } from '@playwright/test'

import { EXAMPLE_URLS } from '../example-urls'

const BASE_URL = EXAMPLE_URLS['example-playground']

for (const mode of ['dashboard', 'stories']) {
  test(`global decorators provide merged story context in ${mode}`, async ({
    page,
  }) => {
    await page.goto(
      `${BASE_URL}/${mode}/decorators/decorators/multiple-decorators`,
    )

    const wrapper = page.getByTestId('global-decorator')
    await expect(wrapper).toHaveCount(1)
    await expect(wrapper).toHaveAttribute(
      'data-story-id',
      'decorators/decorators/multiple-decorators',
    )
    await expect(wrapper).toHaveAttribute(
      'data-story-name',
      'MultipleDecorators',
    )
    await expect(wrapper).toHaveAttribute(
      'data-story-params',
      JSON.stringify({
        theme: 'dark',
        layout: 'centered',
        nested: { story: true },
      }),
    )
    await expect(wrapper.locator('.decorator')).toHaveCount(2)
    await expect(wrapper.locator('.decorator').first()).toHaveAttribute(
      'data-label',
      'Outer Decorator',
    )
    await expect(
      wrapper.getByRole('button', { name: '+', exact: true }),
    ).toBeVisible()
    await expect(
      page.locator('.decorator [data-testid="global-decorator"]'),
    ).toHaveCount(0)
  })
}

test('global decorators inherit default parameters when the story has none', async ({
  page,
}) => {
  await page.goto(`${BASE_URL}/stories/decorators/decorators/single-decorator`)
  await expect(page.getByTestId('global-decorator')).toHaveAttribute(
    'data-story-params',
    JSON.stringify({
      theme: 'light',
      layout: 'centered',
      nested: { default: true },
    }),
  )
})
