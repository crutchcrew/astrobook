import { expect, test } from '@playwright/test'

import { EXAMPLE_URLS } from '../example-urls'

const base = EXAMPLE_URLS['example-playground']

for (const mode of ['dashboard', 'stories']) {
  test(`one axis renders labeled figures with props, slots and decorators in ${mode}`, async ({
    page,
  }) => {
    await page.goto(`${base}/${mode}/variants/badge/all-sizes`)
    const grid = page.locator('div.astrobook-variants')
    const cells = grid.locator('figure.astrobook-variants-cell')
    await expect(cells).toHaveCount(3)
    await expect(grid.locator('figcaption')).toHaveText(['sm', 'md', 'lg'])
    for (const [index, size] of ['sm', 'md', 'lg'].entries()) {
      const cell = cells.nth(index)
      await expect(cell.locator('.variant-badge')).toHaveAttribute(
        'data-size',
        size,
      )
      await expect(cell.locator('.variant-badge')).toHaveAttribute(
        'data-color',
        'accent',
      )
      await expect(cell.locator('.variant-badge')).toHaveText('New!')
      await expect(cell.locator('.variant-slot')).toHaveText('!')
      await expect(cell.locator('.decorator')).toHaveCount(1)
      await expect(cell.locator('.decorator')).toHaveAttribute(
        'data-label',
        'Variant cell',
      )
      await expect(cell.locator('.decorator .variant-badge')).toHaveCount(1)
    }
    await expect(page.getByTestId('global-decorator')).toHaveCount(1)
    await expect(
      page.getByTestId('global-decorator').locator('.astrobook-variants'),
    ).toHaveCount(1)
    await expect(cells.getByTestId('global-decorator')).toHaveCount(0)
  })

  test(`two axes render an accessible table with the last axis as columns in ${mode}`, async ({
    page,
  }) => {
    await page.goto(`${base}/${mode}/variants/badge/colors-and-sizes`)
    const grid = page.getByRole('table')
    await expect(grid.locator('.astrobook-variants-cell')).toHaveCount(6)
    await expect(grid.locator('thead th').first()).toHaveText('size × color')
    await expect(grid.locator('th[scope="col"]')).toHaveText([
      'Neutral',
      'Accent',
    ])
    await expect(grid.locator('th[scope="row"]')).toHaveText([
      'Small',
      'Medium',
      'Large',
    ])
    for (const [index, size] of ['sm', 'md', 'lg'].entries()) {
      const cells = grid.locator('tbody tr').nth(index).locator('td')
      for (const [column, color] of ['neutral', 'accent'].entries()) {
        const badge = cells.nth(column).locator('.variant-badge')
        await expect(badge).toHaveAttribute('data-size', size)
        await expect(badge).toHaveAttribute('data-color', color)
      }
      await expect(cells.locator('.decorator')).toHaveCount(2)
    }
    await expect(page.getByTestId('global-decorator')).toHaveCount(1)
    await expect(grid.getByTestId('global-decorator')).toHaveCount(0)
  })

  test(`framework cells hydrate and update independently in ${mode}`, async ({
    page,
  }) => {
    await page.goto(`${base}/${mode}/react/react-counter/step-variants`)
    await expect(page.locator('html[data-astrobook-story-loaded]')).toHaveCount(
      1,
    )
    const cells = page.locator('.astrobook-variants-cell')
    await expect(cells).toHaveCount(3)
    await expect(cells.locator('figcaption')).toHaveText(['One', 'Five', 'Ten'])
    await expect(cells.locator('astro-island[client="load"]')).toHaveCount(3)
    await expect(cells.locator('astro-island[ssr]')).toHaveCount(0)
    await expect(cells.locator('.variant-slot')).toHaveText(
      Array.from({ length: 3 }, () => 'Independent counter'),
    )
    await expect(cells.locator('.decorator')).toHaveCount(3)
    await expect(page.getByTestId('global-decorator')).toHaveCount(1)
    await expect(cells.locator('pre')).toHaveText(['0', '0', '0'])
    await cells.nth(1).getByRole('button', { name: '+', exact: true }).click()
    await expect(cells.locator('pre')).toHaveText(['0', '5', '0'])
    await cells.nth(0).getByRole('button', { name: '+', exact: true }).click()
    await cells.nth(2).getByRole('button', { name: '+', exact: true }).click()
    await expect(cells.locator('pre')).toHaveText(['1', '5', '10'])
  })
}

test('three axes combine row labels in axis order', async ({ page }) => {
  await page.goto(`${base}/stories/variants/badge/all-combinations`)
  const grid = page.getByRole('table')
  await expect(grid.locator('thead th').first()).toHaveText(
    'size / outlined × color',
  )
  await expect(grid.locator('th[scope="row"]')).toHaveText([
    'Small / false',
    'Small / true',
    'Large / false',
    'Large / true',
  ])
  await expect(grid.locator('th[scope="col"]')).toHaveText([
    'Neutral',
    'Accent',
  ])
  await expect(grid.locator('.astrobook-variants-cell')).toHaveCount(8)
  for (const [index, size] of ['sm', 'sm', 'lg', 'lg'].entries()) {
    const badges = grid.locator('tbody tr').nth(index).locator('.variant-badge')
    for (const [column, color] of ['neutral', 'accent'].entries()) {
      await expect(badges.nth(column)).toHaveAttribute('data-size', size)
      await expect(badges.nth(column)).toHaveAttribute('data-color', color)
      await expect(badges.nth(column)).toHaveAttribute(
        'data-outlined',
        String(index % 2 === 1),
      )
    }
  }
})

test('ordinary stories have no variant markup', async ({ page }) => {
  await page.goto(`${base}/stories/react/react-counter/default`)
  await expect(page.locator('.counter')).toHaveCount(1)
  await expect(
    page.locator(
      '.astrobook-variants, .astrobook-variants-cell, .astrobook-variants-label',
    ),
  ).toHaveCount(0)
})

test('metadata includes the displayed axis labels only for variant stories', async ({
  request,
}) => {
  const response = await request.get(`${base}/meta.json`)
  expect(response.ok()).toBe(true)
  const { stories } = (await response.json()) as {
    stories: { id: string; variants?: Record<string, string[]> }[]
  }
  expect(
    stories.find(({ id }) => id === 'variants/badge/all-sizes')?.variants,
  ).toEqual({ size: ['sm', 'md', 'lg'] })
  expect(
    stories.find(({ id }) => id === 'variants/badge/colors-and-sizes')
      ?.variants,
  ).toEqual({
    size: ['Small', 'Medium', 'Large'],
    color: ['Neutral', 'Accent'],
  })
  expect(
    stories.find(({ id }) => id === 'variants/badge/all-combinations')
      ?.variants,
  ).toEqual({
    size: ['Small', 'Large'],
    outlined: ['false', 'true'],
    color: ['Neutral', 'Accent'],
  })
  expect(
    stories.find(({ id }) => id === 'react/react-counter/step-variants')
      ?.variants,
  ).toEqual({ step: ['One', 'Five', 'Ten'] })
  expect(
    stories.find(({ id }) => id === 'react/react-counter/default'),
  ).not.toHaveProperty('variants')
})
