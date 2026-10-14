import { expect, test } from '@playwright/test'

import { EXAMPLE_URLS } from '../example-urls'

const base = EXAMPLE_URLS['example-playground']
const id = 'astro/astro-counter/large-step'

for (const mode of ['dashboard', 'stories']) {
  test(`display labels and context in ${mode}`, async ({ page }) => {
    await page.goto(`${base}/${mode}/${id}`)
    await expect(page).toHaveTitle('Count by five · Astrobook')
    await expect(page.getByTestId('global-decorator')).toHaveAttribute(
      'data-story-name',
      'Count by five',
    )
    await expect(page.getByTestId('global-decorator')).toHaveAttribute(
      'data-module-title',
      'Astro Counter',
    )
    if (mode === 'dashboard') {
      await expect(
        page.locator('[data-id="module:astro/astro-counter"] > summary'),
      ).toHaveText('Astro Counter')
      const link = page.getByRole('link', {
        name: 'Count by five',
        exact: true,
      })
      await expect(link).toHaveAttribute('href', `/dashboard/${id}`)
      await page.locator('#astrobook-search-toggle').click()
      await page.locator('#astrobook-search-input').fill('Count by five')
      await expect(link).toBeVisible()
      await expect(
        page.locator('a[data-story-id="astro/astro-counter/default"]'),
      ).not.toBeVisible()
      await link.click()
      await expect(page).toHaveURL(`${base}/dashboard/${id}`)
    }
  })
}

test('fallback story title and home title', async ({ page }) => {
  await page.goto(`${base}/stories/astro/astro-counter/default`)
  await expect(page).toHaveTitle('Default · Astrobook')
  await page.goto(base)
  await expect(page).toHaveTitle('Astrobook')
})
