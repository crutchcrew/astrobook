import { expect, test } from '@playwright/test'

import { EXAMPLE_URLS } from '../example-urls'
import { testCounter } from '../helpers/counter'

const BASE_URL = EXAMPLE_URLS['example-playground']

for (const dir of ['dashboard', 'stories']) {
  for (const framework of [
    'astro',
    'preact',
    'react',
    'solid',
    'svelte',
    'vue',
  ]) {
    const url = `${BASE_URL}/${dir}/${framework}/${framework}-counter/with-slot`
    test(url, async ({ page }) => {
      await page.goto(url)

      await expect(page.locator('.counter-message .slot-content')).toHaveText(
        'Slot content',
      )
      await testCounter(page, 2)
    })
  }
}

test.describe('astro slots', () => {
  const url = (story: string) =>
    `${BASE_URL}/stories/slots/astro-panel/${story}`

  test('default slot', async ({ page }) => {
    await page.goto(url('default-slot'))

    await expect(page.locator('.panel-body')).toHaveText('Panel body')
    await expect(page.locator('.panel-body strong')).toHaveText('body')
    await expect(page.locator('.panel-header')).toBeEmpty()
  })

  test('named slots', async ({ page }) => {
    await page.goto(url('named-slots'))

    await expect(page.locator('.panel')).toHaveAttribute(
      'data-title',
      'Named slots',
    )
    await expect(page.locator('.panel-header h2')).toHaveText('Panel header')
    await expect(page.locator('.panel-body p')).toHaveText('Panel body')
    await expect(page.locator('.panel-footer small')).toHaveText('Panel footer')
  })

  test('component slots', async ({ page }) => {
    await page.goto(url('component-slots'))

    await expect(page.locator('.panel-header .badge')).toHaveText('Badge')
    await expect(page.locator('.panel-body .badge')).toHaveText('Body badge')
    await expect(page.locator('.panel-footer')).toBeEmpty()
  })
})
