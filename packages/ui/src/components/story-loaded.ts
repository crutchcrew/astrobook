export function initStoryLoaded() {
  let generation = 0
  let controller: AbortController | undefined

  function clearStoryLoaded() {
    generation++
    controller?.abort()
    document.documentElement.removeAttribute('data-astrobook-story-loaded')
  }

  function waitForHydration(
    island: Element,
    signal: AbortSignal,
  ): Promise<void> {
    return new Promise((resolve) => {
      const observer = new MutationObserver(check)
      function finish() {
        observer.disconnect()
        signal.removeEventListener('abort', finish)
        resolve()
      }
      function check() {
        if (!island.hasAttribute('ssr')) finish()
      }
      observer.observe(island, { attributes: true, attributeFilter: ['ssr'] })
      signal.addEventListener('abort', finish, { once: true })
      check()
    })
  }

  async function markStoryLoaded() {
    clearStoryLoaded()
    const current = generation
    const root = document.documentElement
    if (!root.dataset.activeStory) return
    controller = new AbortController()
    const { signal } = controller
    await Promise.all([
      document.fonts.ready,
      ...Array.from(
        document.querySelectorAll(
          'astro-island[client="load"], astro-island[client="idle"], astro-island[client="only"]',
        ),
        (island) => waitForHydration(island, signal),
      ),
    ])
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    if (current === generation && root === document.documentElement) {
      root.setAttribute('data-astrobook-story-loaded', '')
    }
  }

  clearStoryLoaded()
  document.addEventListener('astro:before-swap', clearStoryLoaded)
  document.addEventListener('astro:page-load', markStoryLoaded)
}
