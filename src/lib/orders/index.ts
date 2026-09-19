import type { RepositoriPesanan } from './types';
import { bridgeRepository } from './bridge-repository';
import { mysqlRepository } from './mysql-repository';

/**
 * Pabrik repositori. Endpoint API tidak pernah tahu penyimpanan mana yang
 * dipakai — cukup ganti ORDER_STORAGE di environment.
 */
export function ambilRepositori(env: Record<string, string | undefined>): RepositoriPesanan {
  const mode = env.ORDER_STORAGE ?? 'bridge';

  if (mode === 'mysql') {
    return mysqlRepository({
      host: env.DB_HOST ?? 'localhost',
      port: Number(env.DB_PORT ?? 3306),
      database: env.DB_NAME ?? '',
      user: env.DB_USER ?? '',
      password: env.DB_PASSWORD ?? '',
    });
  }

  if (mode === 'none') {
    return { nama: 'none', async simpan() { return { ok: true as const }; } };
  }

  return bridgeRepository(env.ORDER_BRIDGE_URL ?? '', env.ORDER_BRIDGE_SECRET ?? '');
}

export type { RepositoriPesanan };
