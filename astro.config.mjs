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

  redirects: {
    '/sitemap.xml': '/sitemap-index.xml',
    '/peta-situs': '/sitemap',
    '/produk/sistem-informasi-sekolah': '/produk/lms-learning-management-system',
  },

  integrations: [
    alpinejs({ entrypoint: '/src/alpine.entrypoint' }),
    sitemap({
      i18n: { defaultLocale: 'id', locales: { id: 'id-ID' } },
      filter: (page) => !page.includes('/terima-kasih'),
      serialize(item) {
        if (item.url === 'https://mutiarasoft.online/') {
          item.changefreq = 'daily';
          item.priority = 1.0;
        } else if (item.url.includes('/layanan/') || item.url.includes('/produk/')) {
          item.changefreq = 'weekly';
          item.priority = 0.9;
        } else if (item.url.includes('/layanan') || item.url.includes('/produk') || item.url.includes('/demo')) {
          item.changefreq = 'weekly';
          item.priority = 0.8;
        } else if (item.url.includes('/sitemap')) {
          item.changefreq = 'weekly';
          item.priority = 0.7;
        } else {
          item.changefreq = 'monthly';
          item.priority = 0.7;
        }
        item.lastmod = new Date().toISOString();
        return item;
      },
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
