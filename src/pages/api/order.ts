import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';
import { skemaPesanan, type PesananTersimpan } from '@/lib/orders/schema';
import { ambilRepositori } from '@/lib/orders';
import { kirimNotifikasi } from '@/lib/telegram';
import { lewatBatas } from '@/lib/rate-limit';

// Endpoint ini butuh server — jangan ikut di-prerender.
export const prerender = false;

function jawab(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // process.env dibaca saat permintaan masuk; import.meta.env dibekukan saat
  // build, sehingga token yang diubah di dasbor hosting tidak akan terbaca.
  const env: Record<string, string | undefined> = {
    ...(import.meta.env as unknown as Record<string, string | undefined>),
    ...process.env,
  };

  // 1. Baca payload (dukung JSON maupun form biasa, supaya tetap jalan tanpa JS).
  let mentah: Record<string, unknown>;
  try {
    const tipe = request.headers.get('content-type') ?? '';
    mentah = tipe.includes('application/json')
      ? await request.json()
      : Object.fromEntries(await request.formData());
  } catch {
    return jawab({ ok: false, pesan: 'Format data tidak terbaca.' }, 400);
  }

  // 2. Validasi bentuk data.
  const hasil = skemaPesanan.safeParse(mentah);
  if (!hasil.success) {
    const galatPerField: Record<string, string> = {};
    for (const isu of hasil.error.issues) {
      const field = String(isu.path[0] ?? 'form');
      galatPerField[field] ??= isu.message;
    }
    return jawab(
      { ok: false, pesan: 'Ada isian yang perlu diperbaiki.', galat: galatPerField },
      422,
    );
  }

  const data = hasil.data;

  // 3. Saringan bot: honeypot terisi, atau form dikirim kurang dari 3 detik.
  const terlaluCepat =
    typeof data.dibukaPada === 'number' && Date.now() - data.dibukaPada < 3000;
  if (data.situsWeb || terlaluCepat) {
    // Jawab seolah berhasil agar bot tidak belajar dari penolakan.
    return jawab({ ok: true, pesan: 'Permintaan diterima.' });
  }

  // 4. Pembatas laju per alamat IP.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? clientAddress;
  if (lewatBatas(ip ?? 'anon', Number(env.ORDER_RATE_LIMIT_PER_HOUR ?? 5))) {
    return jawab(
      {
        ok: false,
        pesan: 'Permintaan dari jaringan ini sudah terlalu banyak. Coba lagi satu jam lagi, atau hubungi kami lewat WhatsApp.',
      },
      429,
    );
  }

  const pesanan: PesananTersimpan = {
    ...data,
    id: `MS-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${randomUUID().slice(0, 6)}`,
    dibuatPada: new Date().toISOString(),
    ip: ip ?? null,
    userAgent: request.headers.get('user-agent'),
    sumber: new URL(request.url).origin,
  };

  // 5. Simpan dulu (sumber kebenaran), baru beri tahu.
  const repo = ambilRepositori(env);
  const tersimpan = await repo.simpan(pesanan);

  if (!tersimpan.ok) {
    console.error('[order] gagal menyimpan', repo.nama, tersimpan.alasan);
  }

  const notifikasi = await kirimNotifikasi(pesanan, env);
  if (!notifikasi.ok) {
    console.error('[order] gagal kirim Telegram', notifikasi.alasan);
  }

  // Selama salah satu jalur berhasil, permintaan pelanggan tidak hilang.
  if (!tersimpan.ok && !notifikasi.ok) {
    return jawab(
      {
        ok: false,
        pesan: 'Permintaan belum bisa kami terima karena gangguan server. Kirim ulang, atau hubungi kami lewat WhatsApp.',
      },
      503,
    );
  }

  return jawab({
    ok: true,
    id: pesanan.id,
    pesan: 'Permintaan terkirim. Kami balas dalam 1×24 jam kerja.',
  });
};

export const GET: APIRoute = () =>
  jawab({ ok: false, pesan: 'Gunakan metode POST.' }, 405);
