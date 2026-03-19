import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Engram',
  description: 'Immune system for AI agents — architecture docs',
  lang: 'en-US',
  cleanUrls: true,

  head: [
    ['meta', { name: 'theme-color', content: '#1a1a2e' }],
  ],

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Engram', link: '/engram/overview' },
    ],

    sidebar: {
      '/engram/': [
        {
          text: 'Engram',
          items: [
            { text: 'Overview', link: '/engram/overview' },
            { text: 'Receptor Architecture', link: '/engram/receptor-architecture' },
            { text: 'Shadow Index', link: '/engram/shadow-index' },
            { text: 'Predictive Inference', link: '/engram/predictive-inference' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hiatamaworkshop/engram' }
    ],

    footer: {
      message: 'Designed by Hiatama Workshop · <a href="mailto:hiatamaworkshop@gmail.com">hiatamaworkshop@gmail.com</a>',
      copyright: '<a href="https://github.com/hiatamaworkshop/engram">Source Repository</a>'
    },

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3]
    }
  }
})