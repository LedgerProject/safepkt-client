import { NuxtConfig } from '@nuxt/types'

const twitter_handle = '@pkt_cash'
const title = 'SafePKT'
const description = 'Static analysis tools for rust-based smart contracts.'

type Route = {
  name: string,
  path: string,
  component: string,
}

const config: NuxtConfig = {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title,
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { hid: 'author', name: 'author', content: twitter_handle },
      {
        hid: 'og:url',
        property: 'og:url',
        content: 'https://pkt.cash'
      },
      {
        hid: 'twitter:creator',
        name: 'twitter:creator',
        content: twitter_handle
      },
      {
        hid: 'twitter:title',
        name: 'twitter:title',
        content: title
      },
      {
        hid: 'twitter:description',
        name: 'twitter:description',
        content: description
      },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    noscript: [
      {
        innerHTML:
            'SafePKT requires JavaScript to work as intended.'
      }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['./styles/variables.scss'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    '@nuxtjs/dotenv',
    '@nuxtjs/pwa',
    '@nuxtjs/router',
    '@nuxtjs/svg',
    'nuxt-lazysizes'
  ],

  pwa: {
    icon: {
      source: '~assets/safepkt.png'
    },
    manifest: {
      name: title,
      lang: 'fr',
      short_name: title,
      useWebmanifestExtension: false
    },
    meta: {
      theme_color: '#3CADEF'
    }
  },

  lazySizes: {
    extendAssetUrls: {
      img: 'data-src'
    }
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/style-resources'
  ],

  env: {
    API_HOST: process.env.API_HOST || '',
    NODE_ENV: process.env.NODE_ENV || ''
  },

  router: {
    extendRoutes (routes: Route[], resolve: (dir: string, path: string) => string): void {
      routes.push({
        name: 'homepage',
        path: '/',
        component: resolve(__dirname, 'pages/index.vue')
      })
    }
  },

  generate: {
    routes: ['/']
  },

  styleResources: {
    scss: ['./styles/variables.scss', './styles/global.scss']
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    babel: {
      plugins: [['@babel/plugin-proposal-private-property-in-object', { loose: true }]]
    }
  },

  typescript: {
    typeCheck: {
      eslint: {
        files: './**/*.{ts,js,vue}'
      }
    }
  }
}

export default config
