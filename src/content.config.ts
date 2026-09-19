import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Katalog produk & demo disimpan sebagai Markdown, bukan di dalam komponen.
 * Menambah produk baru = menambah satu berkas .md, tanpa menyentuh kode.
 */
const produk = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/produk' }),
  schema: z.object({
    nama: z.string(),
    ringkas: z.string().max(180),
    platform: z.array(z.enum(['desktop', 'web', 'mobile'])).min(1),
    kategori: z.enum(['kasir', 'sekolah', 'desa', 'toko', 'ai', 'lainnya']),
    fitur: z.array(z.string()).min(3),
    unggulan: z.boolean().default(false),
    demo: z.string().optional(),
    urutan: z.number().default(50),
  }),
});

const demo = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/demo' }),
  schema: z.object({
    nama: z.string(),
    ringkas: z.string().max(180),
    tautan: z.string(),
    akun: z.string().optional(),
    gratis: z.boolean().default(true),
    // false = demo belum hidup; kartunya tampil sebagai "segera", tidak bisa diklik.
    siap: z.boolean().default(false),
    urutan: z.number().default(50),
  }),
});

const layanan = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/layanan' }),
  schema: z.object({
    nama: z.string(),
    ringkas: z.string().max(200),
    cocokUntuk: z.array(z.string()).min(2),
    termasuk: z.array(z.string()).min(3),
    urutan: z.number().default(50),
  }),
});

export const collections = { produk, demo, layanan };
