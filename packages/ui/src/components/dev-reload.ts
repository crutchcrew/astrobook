const SERVER_META = 'meta[name="astrobook-server"]'

function readServerId(document: Document): string | undefined {
  return (
    document.querySelector<HTMLMetaElement>(SERVER_META)?.content || undefined
  )
}

// A restarting server closes within a moment of dropping the socket, so one
// that keeps answering this long dropped it for another reason.
const SAME_SERVER_MS = 5000

/**
 * Polls this page until a different server than the one that rendered it
 * answers. A page without the id counts too: it is a 404 for a removed story
 * or an error page, which only the new server sends. If the same server keeps
 * answering, it never restarted, and the page can reload from it.
 */
async function waitForServer(serverId: string): Promise<void> {
  let sameServerSince: number | undefined
  for (;;) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    try {
      const response = await fetch(location.href, { cache: 'no-store' })
      // A server that is shutting down can still answer with an error.
      if (response.status >= 500) {
        sameServerSince = undefined
        continue
      }
      const page = new DOMParser().parseFromString(
        await response.text(),
        'text/html',
      )
      if (readServerId(page) !== serverId) return
      sameServerSince ??= Date.now()
      if (Date.now() - sameServerSince >= SAME_SERVER_MS) return
    } catch {
      // The server is down between closing and listening again.
      sameServerSince = undefined
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
    await waitForServer(serverId)
    location.reload()
    // Vite awaits this listener before its own reload, so never resolving
    // keeps that reload from racing this one.
    await new Promise(() => {})
  })
}
