import type { RepositoriPesanan } from './types';
import { bridgeRepository } from './bridge-repository';
import { mysqlRepository } from './mysql-repository';

/**
 * Pabrik repositori. Endpoint API tidak pernah tahu penyimpanan mana yang
 * dipakai — cukup ganti ORDER_STORAGE di environment.
 */
export function ambilRepositori(env: Record<string, string | undefined>): RepositoriPesanan {
  const mode = String(env.ORDER_STORAGE ?? 'bridge')
    .replace(/^["']+|["']+$/g, '')
    .trim()
    .toLowerCase();

  if (mode === 'mysql') {
    return mysqlRepository({
      host: (env.DB_HOST ?? 'localhost').replace(/^["']+|["']+$/g, '').trim(),
      port: Number((env.DB_PORT ?? '3306').replace(/[^0-9]/g, '')) || 3306,
      database: (env.DB_NAME ?? '').replace(/^["']+|["']+$/g, '').trim(),
      user: (env.DB_USER ?? '').replace(/^["']+|["']+$/g, '').trim(),
      password: (env.DB_PASSWORD ?? '').replace(/^["']+|["']+$/g, '').trim(),
    });
  }

  if (mode === 'none') {
    return { nama: 'none', async simpan() { return { ok: true as const }; } };
  }

  const bridgeUrl = (env.ORDER_BRIDGE_URL ?? '').replace(/^["']+|["']+$/g, '').trim();
  const bridgeSecret = (env.ORDER_BRIDGE_SECRET ?? '').replace(/^["']+|["']+$/g, '').trim();

  return bridgeRepository(bridgeUrl, bridgeSecret);
}

export type { RepositoriPesanan };
