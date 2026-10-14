const SERVER_META = 'meta[name="astrobook-server"]'

function readServerId(document: Document): string | undefined {
  return (
    document.querySelector<HTMLMetaElement>(SERVER_META)?.content || undefined
  )
}

/**
 * Polls this page until a different server than the one that rendered it
 * answers. A page without the id counts too: it is a 404 for a removed story
 * or an error page, which only the new server sends.
 */
async function waitForNewServer(serverId: string): Promise<void> {
  for (;;) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    try {
      const response = await fetch(location.href, { cache: 'no-store' })
      // A server that is shutting down can still answer with an error.
      if (response.status >= 500) continue
      const page = new DOMParser().parseFromString(
        await response.text(),
        'text/html',
      )
      if (readServerId(page) !== serverId) return
    } catch {
      // The server is down between closing and listening again.
    }
  }
}

/**
 * Astro restarts its dev server in place when stories are added, renamed or
 * removed. Vite reloads the page as soon as a WebSocket handshake succeeds,
 * which can land while the old server is still closing, and leave the page on
 * a browser error page. This reloads once the restarted server has rendered
 * this page instead.
 */
export function initDevReload(): void {
  const hot = import.meta.hot
  const serverId = readServerId(document)
  if (!hot || !serverId) return

  hot.on('vite:ws:disconnect', async () => {
    await waitForNewServer(serverId)
    location.reload()
    // Vite awaits this listener before its own reload, so never resolving
    // keeps that reload from racing this one.
    await new Promise(() => {})
  })
}
