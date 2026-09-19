import mysql from 'mysql2/promise';
import type { RepositoriPesanan } from './types';
import type { PesananTersimpan } from './schema';

type Konfigurasi = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
};

let kolam: mysql.Pool | null = null;

function ambilKolam(cfg: Konfigurasi): mysql.Pool {
  kolam ??= mysql.createPool({
    ...cfg,
    waitForConnections: true,
    connectionLimit: 4,
    connectTimeout: 8000,
    charset: 'utf8mb4_general_ci',
  });
  return kolam;
}

/** Adapter MySQL langsung — pakai bila server web dan MySQL berada di jaringan yang sama. */
export function mysqlRepository(cfg: Konfigurasi): RepositoriPesanan {
  return {
    nama: 'mysql',
    async simpan(pesanan: PesananTersimpan) {
      try {
        await ambilKolam(cfg).execute(
          `INSERT INTO pesanan_aplikasi
             (id, nama, perusahaan, kontak, jenis_solusi, anggaran, kebutuhan,
              ip, user_agent, sumber, dibuat_pada)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            pesanan.id,
            pesanan.nama,
            pesanan.perusahaan || null,
            pesanan.kontak,
            pesanan.jenisSolusi,
            pesanan.anggaran,
            pesanan.kebutuhan,
            pesanan.ip,
            pesanan.userAgent,
            pesanan.sumber,
            pesanan.dibuatPada.slice(0, 19).replace('T', ' '),
          ],
        );
        return { ok: true as const };
      } catch (galat) {
        return {
          ok: false as const,
          alasan: galat instanceof Error ? galat.message : 'gagal menulis ke MySQL',
        };
      }
    },
  };
}
