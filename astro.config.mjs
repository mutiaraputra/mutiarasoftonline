// @ts-check
import { defineConfig } from 'astro/config';
import alpinejs from '@astrojs/alpinejs';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://mutiarasoft.online',

  // Semua halaman marketing di-prerender jadi HTML statis (cepat + SEO).
  // Endpoint yang butuh server (mis. /api/order) memakai `export const prerender = false`.
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: false },
    imageService: true,
  }),

  integrations: [
    alpinejs({ entrypoint: '/src/alpine.entrypoint' }),
    sitemap({
      i18n: { defaultLocale: 'id', locales: { id: 'id-ID' } },
      filter: (page) => !page.includes('/terima-kasih'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  build: { inlineStylesheets: 'auto' },

  image: {
    // Format modern lebih dulu, fallback otomatis ditangani Astro.
    domains: ['mutiarakom.my.id'],
  },
});
