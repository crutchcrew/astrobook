declare module 'virtual:astrobook/story-modules.mjs' {
  const entries: import('./types').StoryModule[]
  export default entries
}

declare module 'virtual:astrobook/global-config.mjs' {
  const config: import('./types').GlobalConfig
  export default config
}

declare module 'virtual:astrobook/components/head.mjs' {
  const Head: (props: unknown) => unknown
  export default Head
}

declare module 'virtual:astrobook/components/home.mjs' {
  const Home: (props: unknown) => unknown
  export default Home
}

declare module 'virtual:astrobook/user-css.mjs' {}

declare module 'virtual:astrobook/decorators.mjs' {
  const decorators: import('./types').StoryDecorator['component'][]
  export default decorators
}

declare module 'virtual:astrobook/story-meta.mjs' {
  const meta: import('./types').StoryMeta
  export default meta
}
