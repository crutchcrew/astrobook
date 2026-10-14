import { expect, test } from '@playwright/test'

import { EXAMPLE_URLS } from '../example-urls'

const base = EXAMPLE_URLS['example-playground']
const story = 'viewport/responsive/default'
const another = 'viewport/responsive/another'

test('toolbar is keyboard reachable and presets use real media queries', async ({
  page,
}) => {
  await page.goto(`${base}/dashboard/${story}`)
  const toolbar = page.getByRole('group', { name: 'Story viewport' })
  await expect(toolbar.getByRole('button')).toHaveText([
    'Full',
    'Mobile 375',
    'Tablet 768',
    'Desktop 1440',
  ])
  const full = toolbar.getByRole('button', { name: 'Full', exact: true })
  await expect(full).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('main .viewport-wide')).toBeVisible()
  await expect(page.locator('main iframe')).toHaveCount(0)
  await full.focus()
  await page.keyboard.press('Tab')
  const mobile = toolbar.getByRole('button', { name: 'Mobile 375' })
  await expect(mobile).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(mobile).toHaveAttribute('aria-pressed', 'true')
  await expect(full).toHaveAttribute('aria-pressed', 'false')
  const iframe = page.locator('main iframe')
  await expect(iframe).toHaveAttribute('src', `/stories/${story}`)
  await expect(iframe).toHaveAttribute('title', /Default.*Mobile/)
  await expect(iframe).toHaveCSS('width', '375px')
  const preview = page.frameLocator('main iframe')
  await expect(
    preview.locator('html[data-astrobook-story-loaded]'),
  ).toHaveCount(1)
  await expect(preview.getByText('narrow', { exact: true })).toBeVisible()
  await expect(preview.getByText('wide', { exact: true })).toBeHidden()
  expect(
    await iframe.evaluate(
      (element) => (element as HTMLIFrameElement).contentWindow!.innerWidth,
    ),
  ).toBe(375)
  expect(
    await iframe.evaluate((element) => element.getBoundingClientRect().bottom),
  ).toBeCloseTo(await page.evaluate(() => window.innerHeight), 0)
  await expect(page.locator('main .viewport-wide')).toBeHidden()
  await toolbar.getByRole('button', { name: 'Tablet 768' }).click()
  await expect(iframe).toHaveCSS('width', '768px')
  await expect(preview.getByText('wide', { exact: true })).toBeVisible()
  await toolbar.getByRole('button', { name: 'Desktop 1440' }).click()
  await expect(iframe).toHaveCSS('width', '1440px')
  expect(
    await page
      .locator('main')
      .evaluate((main) => main.scrollWidth > main.clientWidth),
  ).toBe(true)
  await full.click()
  await expect(full).toHaveAttribute('aria-pressed', 'true')
  await expect(iframe).toHaveCount(0)
  await expect(page.locator('main .viewport-wide')).toBeVisible()
  await expect(page.locator('html[data-astrobook-story-loaded]')).toHaveCount(1)
  await page.reload()
  await expect(full).toHaveAttribute('aria-pressed', 'true')
  await expect(iframe).toHaveCount(0)
})

test('selection survives ClientRouter navigation and reload', async ({
  page,
}) => {
  await page.goto(`${base}/dashboard/${story}`)
  await page.getByRole('button', { name: 'Mobile 375' }).click()
  await page.evaluate(() =>
    Object.assign(window, { viewportNavigationMarker: true }),
  )
  await page.locator(`a[data-story-id="${another}"]`).click()
  await expect(page).toHaveURL(`${base}/dashboard/${another}`)
  expect(await page.evaluate(() => 'viewportNavigationMarker' in window)).toBe(
    true,
  )
  await expect(
    page.getByRole('button', { name: 'Mobile 375' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('main iframe')).toHaveAttribute(
    'src',
    `/stories/${another}`,
  )
  await expect(
    page.frameLocator('main iframe').getByText('narrow', { exact: true }),
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Mobile 375' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('main iframe')).toHaveCSS('width', '375px')
  expect(
    await page.evaluate(() => localStorage.getItem('astrobook-viewport')),
  ).toBe('Mobile')
})

test('unknown saved names fall back to Full', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('astrobook-viewport', 'Removed preset'),
  )
  await page.goto(`${base}/dashboard/${story}`)
  await expect(
    page.getByRole('button', { name: 'Full', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('main iframe')).toHaveCount(0)
  await expect(page.locator('main .viewport-wide')).toBeVisible()
})

test('blocked viewport storage still allows selection and navigation', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const getItem = Storage.prototype.getItem.bind(localStorage)
    const setItem = Storage.prototype.setItem.bind(localStorage)
    const removeItem = Storage.prototype.removeItem.bind(localStorage)
    Storage.prototype.getItem = function (key) {
      if (key === 'astrobook-viewport') throw new Error('Storage blocked')
      return getItem(key)
    }
    Storage.prototype.setItem = function (key, value) {
      if (key === 'astrobook-viewport') throw new Error('Storage blocked')
      setItem(key, value)
    }
    Storage.prototype.removeItem = function (key) {
      if (key === 'astrobook-viewport') throw new Error('Storage blocked')
      removeItem(key)
    }
  })
  await page.goto(`${base}/dashboard/${story}`)
  await page.getByRole('button', { name: 'Mobile 375' }).click()
  await expect(
    page.frameLocator('main iframe').getByText('narrow', { exact: true }),
  ).toBeVisible()
  await page.locator(`a[data-story-id="${another}"]`).click()
  await expect(page.locator('main iframe')).toHaveAttribute(
    'src',
    `/stories/${another}`,
  )
  await page.getByRole('button', { name: 'Full', exact: true }).click()
  await expect(page.locator('main iframe')).toHaveCount(0)
})

test('iframe receives the dashboard theme on load and after changes', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
  await page.goto(`${base}/dashboard/${story}`)
  await page.locator('astro-theme-toggle').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('button', { name: 'Mobile 375' }).click()
  const preview = page.frameLocator('main iframe')
  await expect(preview.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.locator('astro-theme-toggle').click()
  await expect(preview.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.locator('astro-theme-toggle').click()
  await expect(preview.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('home and preview pages have no viewport toolbar', async ({ page }) => {
  await page.goto(base)
  await expect(page.getByRole('group', { name: 'Story viewport' })).toHaveCount(
    0,
  )
  await page.goto(`${base}/stories/${story}`)
  await expect(page.getByRole('group', { name: 'Story viewport' })).toHaveCount(
    0,
  )
  await expect(page.locator('iframe')).toHaveCount(0)
  await expect(page.locator('html[data-astrobook-story-loaded]')).toHaveCount(1)
})
