import { createHmac } from 'node:crypto';
import type { RepositoriPesanan } from './types';
import type { PesananTersimpan } from './schema';

/**
 * Adapter "bridge": menitipkan penulisan ke endpoint PHP di cPanel.
 * Dipakai karena MySQL shared hosting umumnya menolak koneksi dari IP
 * serverless yang berubah-ubah. Keaslian permintaan dijamin HMAC-SHA256.
 */
export function bridgeRepository(url: string, secret: string): RepositoriPesanan {
  return {
    nama: 'bridge-php',
    async simpan(pesanan: PesananTersimpan) {
      const badan = JSON.stringify(pesanan);
      const stempel = Date.now().toString();
      const tandaTangan = createHmac('sha256', secret)
        .update(`${stempel}.${badan}`)
        .digest('hex');

      const kontrol = AbortSignal.timeout(8000);

      try {
        const respons = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Signature': tandaTangan,
            'X-Timestamp': stempel,
          },
          body: badan,
          signal: kontrol,
        });

        if (!respons.ok) {
          return { ok: false as const, alasan: `bridge menjawab ${respons.status}` };
        }
        return { ok: true as const };
      } catch (galat) {
        return {
          ok: false as const,
          alasan: galat instanceof Error ? galat.message : 'bridge tidak terjangkau',
        };
      }
    },
  };
}
