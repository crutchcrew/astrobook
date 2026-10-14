import { getTheme } from 'astro-theme-toggle/client'

const STORAGE_KEY = 'astrobook-viewport'
let selectedName = ''

export function initViewportToolbar() {
  if (customElements.get('astrobook-viewport')) return

  class ViewportToolbar extends HTMLElement {
    controller?: AbortController
    observer?: MutationObserver

    connectedCallback() {
      const main = this.closest('main')!
      const inline = main.querySelector<HTMLElement>(
        '[data-astrobook-inline-story]',
      )!
      const stage = main.querySelector<HTMLElement>(
        '[data-astrobook-viewport-stage]',
      )!
      const buttons = Array.from(
        this.querySelectorAll<HTMLButtonElement>('button[data-viewport-name]'),
      )
      this.controller = new AbortController()
      const { signal } = this.controller

      const sendTheme = () => {
        stage
          .querySelector('iframe')
          ?.contentWindow?.postMessage(
            { type: 'astrobook:set-theme', theme: getTheme() },
            window.location.origin,
          )
      }

      const select = (name: string) => {
        const button =
          buttons.find((button) => button.dataset.viewportName === name) ??
          buttons[0]
        selectedName = button.dataset.viewportName!
        const width = button.dataset.viewportWidth
        for (const item of buttons) {
          item.setAttribute('aria-pressed', String(item === button))
        }
        inline.style.display = width ? 'none' : 'contents'
        stage.style.display = width ? 'flex' : 'none'
        stage.style.minWidth = width ? `${Number(width) + 2}px` : ''
        main.toggleAttribute('data-astrobook-viewport-active', !!width)
        stage.replaceChildren()
        if (width) {
          const iframe = document.createElement('iframe')
          iframe.src = this.dataset.previewUrl!
          iframe.title = `${this.dataset.storyLabel} — ${selectedName}`
          iframe.width = width
          iframe.style.cssText =
            'display: block; box-sizing: content-box; border: 1px solid; border-color: inherit; min-height: 0; max-width: none;'
          iframe.style.width = `${width}px`
          if (button.dataset.viewportHeight) {
            iframe.style.height = `${button.dataset.viewportHeight}px`
            iframe.style.flex = 'none'
          } else {
            iframe.style.height = '0'
            iframe.style.flex = '1'
          }
          iframe.addEventListener('load', sendTheme, { signal })
          stage.append(iframe)
        }
      }

      try {
        selectedName = localStorage.getItem(STORAGE_KEY) ?? ''
      } catch {
        // Keep the in-memory choice when storage is unavailable.
      }
      select(selectedName)
      this.addEventListener(
        'click',
        (event) => {
          const button = (event.target as Element).closest('button')
          if (!button || !buttons.includes(button)) return
          select(button.dataset.viewportName!)
          try {
            if (selectedName) localStorage.setItem(STORAGE_KEY, selectedName)
            else localStorage.removeItem(STORAGE_KEY)
          } catch {
            // Viewport selection still works when storage is unavailable.
          }
        },
        { signal },
      )

      this.observer = new MutationObserver(sendTheme)
      this.observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      })
    }

    disconnectedCallback() {
      this.controller?.abort()
      this.observer?.disconnect()
    }
  }

  customElements.define('astrobook-viewport', ViewportToolbar)
}
