const { defineConfig } = require('@vue/cli-service')
const SitemapPlugin = require('sitemap-webpack-plugin').default
// You can write the paths as an array of strings or an array of objects
const paths = [
  {
      path: '/',
      lastmod: '2023-01-27',
      priority: 1.0,
      changefreq: 'yearly'
  }
]

module.exports = defineConfig({
  configureWebpack: {
      plugins: [
          new SitemapPlugin({ base: 'https://gpt-audiobook.jyroneparker.com', paths })
      ]
  },
  transpileDependencies: true,
  pwa: {
    name: 'GPT Audiobooks',
    themeColor: '#9C0414',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',

    // configure the workbox plugin
    workboxPluginMode: 'GenerateSW'
  }
})
