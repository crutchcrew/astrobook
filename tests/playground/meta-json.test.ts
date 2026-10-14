import { expect, test } from '@playwright/test'

import { EXAMPLE_URLS } from '../example-urls'
import { testCounter } from '../helpers/counter'

const base = EXAMPLE_URLS['example-playground']
const ready = 'html[data-astrobook-story-loaded]'

interface ManifestStory {
  id: string
  name: string
  module: { id: string; name: string; title: string; directory: string }
  parameters: Record<string, unknown>
  url: string
  dashboardUrl: string
}

test('metadata matches sidebar order and links to ready previews', async ({
  request,
  page,
}) => {
  const response = await request.get(`${base}/meta.json`)
  expect(response.ok()).toBe(true)
  expect(response.headers()['content-type']).toContain('application/json')
  const { stories }: { stories: ManifestStory[] } = (await response.json()) as {
    stories: ManifestStory[]
  }
  const story = stories.find(
    ({ id }) => id === 'astro/astro-counter/large-step',
  )!
  expect(story).toEqual({
    id: 'astro/astro-counter/large-step',
    name: 'Count by five',
    module: {
      id: 'astro/astro-counter',
      name: 'AstroCounter',
      title: 'Astro Counter',
      directory: 'astro',
    },
    parameters: { theme: 'dark', layout: 'centered', screenshot: false },
    url: '/stories/astro/astro-counter/large-step',
    dashboardUrl: '/dashboard/astro/astro-counter/large-step',
  })
  await page.goto(base)
  expect(
    await page
      .locator('a[data-astrobook-story-link]')
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute('data-story-id')),
      ),
  ).toEqual(stories.map(({ id }) => id))
  await expect(page.locator(ready)).toHaveCount(0)
  await page.goto(`${base}${story.url}`)
  await expect(page.locator(ready)).toHaveCount(1)
})

test('dashboard navigation clears and restores readiness', async ({ page }) => {
  await page.goto(`${base}/dashboard/astro/astro-counter/default`)
  await expect(page.locator(ready)).toHaveCount(1)
  await page.evaluate(() => {
    const states: boolean[] = []
    Object.assign(window, { storyLoadedStates: states })
    document.addEventListener('astro:before-swap', () => {
      states.push(
        document.documentElement.hasAttribute('data-astrobook-story-loaded'),
      )
    })
    document.addEventListener('astro:page-load', () => {
      states.push(
        document.documentElement.hasAttribute('data-astrobook-story-loaded'),
      )
    })
  })
  await page
    .locator('a[data-story-id="astro/astro-counter/large-step"]')
    .click()
  await expect(page).toHaveURL(
    `${base}/dashboard/astro/astro-counter/large-step`,
  )
  await expect(page.locator(ready)).toHaveCount(1)
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { storyLoadedStates: boolean[] })
          .storyLoadedStates,
    ),
  ).toEqual([false, false])
})

test('readiness waits for React hydration', async ({ page }) => {
  let release!: () => void
  const blocked = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/ReactCounter.tsx*', async (route) => {
    await blocked
    await route.continue()
  })
  const navigation = page.goto(`${base}/stories/react/react-counter/default`, {
    waitUntil: 'commit',
  })
  await navigation
  const island = page.locator('astro-island[client="load"]')
  await expect(island).toHaveAttribute('ssr', '')
  await expect(page.locator(ready)).toHaveCount(0)
  release()
  await expect(page.locator(ready)).toHaveCount(1)
  await expect(island).not.toHaveAttribute('ssr')
  await testCounter(page, 1)
})
