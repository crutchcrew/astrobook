---
'@astrobook/core': patch
'@astrobook/types': patch
'@astrobook/ui': patch
'astrobook': patch
---

An open dashboard or story page now reloads by itself once `astro dev` has restarted for an added, renamed or removed story, and shows the new stories. Before, editing a story file's exports reloaded the page while the old server was still answering, which left the old sidebar on screen (or a browser error page) until you reloaded by hand.
