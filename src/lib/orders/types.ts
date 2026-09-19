import type { PesananTersimpan } from './schema';

/**
 * Kontrak penyimpanan pesanan. Semua adapter menerapkan antarmuka ini, jadi
 * pindah dari bridge PHP ke MySQL langsung (atau ke Postgres nanti) tidak
 * menyentuh endpoint API sama sekali.
 */
export interface RepositoriPesanan {
  nama: string;
  simpan(pesanan: PesananTersimpan): Promise<{ ok: true } | { ok: false; alasan: string }>;
}
