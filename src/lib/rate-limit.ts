/**
 * Pembatas laju sederhana berbasis memori.
 * Cukup untuk menahan spam ringan pada satu instance. Bila trafik sudah tinggi,
 * ganti isi fungsi ini dengan Upstash Redis / Vercel KV tanpa mengubah pemanggil.
 */
const jejak = new Map<string, number[]>();
const JENDELA = 60 * 60 * 1000; // 1 jam

export function lewatBatas(kunci: string, maksimum: number): boolean {
  const sekarang = Date.now();
  const riwayat = (jejak.get(kunci) ?? []).filter((t) => sekarang - t < JENDELA);

  if (riwayat.length >= maksimum) {
    jejak.set(kunci, riwayat);
    return true;
  }

  riwayat.push(sekarang);
  jejak.set(kunci, riwayat);

  // Jaga peta tetap kecil.
  if (jejak.size > 5000) {
    for (const [k, v] of jejak) {
      if (v.every((t) => sekarang - t > JENDELA)) jejak.delete(k);
    }
  }

  return false;
}
