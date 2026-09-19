import type { PesananTersimpan } from '@/lib/orders/schema';
import { jenisSolusi, rentangAnggaran } from '@/lib/site';

const API = 'https://api.telegram.org';

/** Karakter yang wajib di-escape sebelum dikirim dengan parse_mode HTML. */
function aman(teks: string): string {
  return teks
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function labelSolusi(nilai: string): string {
  return jenisSolusi.find((s) => s.nilai === nilai)?.label ?? nilai;
}

function labelAnggaran(nilai: string): string {
  return rentangAnggaran.find((a) => a.nilai === nilai)?.label ?? nilai;
}

export function susunPesan(pesanan: PesananTersimpan): string {
  const waktu = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(pesanan.dibuatPada));

  const baris = [
    '🟡 <b>Permintaan aplikasi baru</b>',
    '',
    `<b>Nama</b>: ${aman(pesanan.nama)}`,
    pesanan.perusahaan ? `<b>Perusahaan</b>: ${aman(pesanan.perusahaan)}` : null,
    `<b>Kontak</b>: <code>${aman(pesanan.kontak)}</code>`,
    `<b>Solusi</b>: ${aman(labelSolusi(pesanan.jenisSolusi))}`,
    `<b>Anggaran</b>: ${aman(labelAnggaran(pesanan.anggaran))}`,
    '',
    '<b>Kebutuhan</b>',
    `<blockquote>${aman(pesanan.kebutuhan.slice(0, 900))}</blockquote>`,
    '',
    `<i>${waktu} WIB · ${aman(pesanan.sumber)} · ${pesanan.id}</i>`,
  ].filter(Boolean);

  return baris.join('\n');
}

type HasilKirim = { ok: boolean; alasan?: string };

/**
 * Kirim notifikasi ke satu atau beberapa chat id.
 * Gagal kirim TIDAK pernah membatalkan pesanan — pesanan sudah tersimpan,
 * notifikasi hanya lapisan kenyamanan.
 */
export async function kirimNotifikasi(
  pesanan: PesananTersimpan,
  env: Record<string, string | undefined>,
): Promise<HasilKirim> {
  const token = env.TELEGRAM_BOT_TOKEN;
  const tujuan = (env.TELEGRAM_CHAT_ID ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  if (!token || tujuan.length === 0) {
    return { ok: false, alasan: 'TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum diisi' };
  }

  const teks = susunPesan(pesanan);
  const tombolWa = pesanan.kontak.replace(/\D/g, '').replace(/^0/, '62');

  const hasil = await Promise.allSettled(
    tujuan.map((chat_id) =>
      fetch(`${API}/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          chat_id,
          text: teks,
          parse_mode: 'HTML',
          link_preview_options: { is_disabled: true },
          reply_markup: tombolWa.length >= 10
            ? {
                inline_keyboard: [[
                  { text: '💬 Balas via WhatsApp', url: `https://wa.me/${tombolWa}` },
                ]],
              }
            : undefined,
        }),
      }).then(async (r) => {
        if (!r.ok) throw new Error(`Telegram ${r.status}: ${await r.text()}`);
        return r;
      }),
    ),
  );

  const gagal = hasil.filter((h) => h.status === 'rejected');
  if (gagal.length === hasil.length) {
    const pertama = gagal[0] as PromiseRejectedResult | undefined;
    return { ok: false, alasan: String(pertama?.reason ?? 'semua tujuan gagal') };
  }

  return { ok: true };
}
