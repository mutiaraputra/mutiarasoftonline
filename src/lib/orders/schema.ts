import { z } from 'zod';
import { jenisSolusi, rentangAnggaran } from '@/lib/site';

const nilaiSolusi = jenisSolusi.map((s) => s.nilai) as [string, ...string[]];
const nilaiAnggaran = rentangAnggaran.map((a) => a.nilai) as [string, ...string[]];

/** Skema tunggal yang dipakai bersama oleh form (pesan error) dan endpoint API. */
export const skemaPesanan = z.object({
  nama: z
    .string()
    .trim()
    .min(2, 'Nama minimal 2 karakter.')
    .max(120, 'Nama terlalu panjang.'),
  perusahaan: z.string().trim().max(160).optional().or(z.literal('')),
  kontak: z
    .string()
    .trim()
    .min(6, 'Isi nomor WhatsApp atau alamat email yang aktif.')
    .max(160)
    .refine(
      (v) => /^[\d+()\s-]{8,}$/.test(v) || /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v),
      'Gunakan format nomor WhatsApp (08xx…) atau email (nama@domain.com).',
    ),
  jenisSolusi: z.enum(nilaiSolusi, {
    errorMap: () => ({ message: 'Pilih salah satu jenis solusi.' }),
  }),
  anggaran: z.enum(nilaiAnggaran, {
    errorMap: () => ({ message: 'Pilih rentang anggaran.' }),
  }),
  kebutuhan: z
    .string()
    .trim()
    .min(20, 'Ceritakan kebutuhan Anda minimal 20 karakter agar bisa diperkirakan.')
    .max(4000, 'Deskripsi maksimal 4000 karakter.'),
  // Honeypot: diisi bot, disembunyikan dari manusia.
  situsWeb: z.string().max(0, 'Permintaan ditolak.').optional().or(z.literal('')),
  // Waktu render form, dipakai menolak submit instan (< 3 detik).
  dibukaPada: z.coerce.number().optional(),
});

export type Pesanan = z.infer<typeof skemaPesanan>;

export type PesananTersimpan = Pesanan & {
  id: string;
  dibuatPada: string;
  ip: string | null;
  userAgent: string | null;
  sumber: string;
};
