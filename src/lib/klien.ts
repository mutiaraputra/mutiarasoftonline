/**
 * TODO(MutiaraSoft): ganti seluruh isi berkas ini dengan klien dan testimoni
 * yang sebenarnya, beserta izin tertulis untuk menyebut nama. Sampai itu ada,
 * bagian portofolio menampilkan industri saja tanpa mengaku-aku nama klien.
 */
export const industri = [
  { nama: 'Toko bahan bangunan', jumlah: 'ritel & grosir' },
  { nama: 'Sekolah dan madrasah', jumlah: 'administrasi & SPP' },
  { nama: 'Kantor desa', jumlah: 'data penduduk & layanan warga' },
  { nama: 'Koperasi', jumlah: 'simpan pinjam & laporan' },
  { nama: 'Bengkel & jasa servis', jumlah: 'order masuk & sparepart' },
  { nama: 'Salon dan perawatan', jumlah: 'reservasi & ulasan' },
] as const;

export type Testimoni = {
  kutipan: string;
  nama: string;
  peran: string;
  izinTampil: boolean;
};

/** Kosongkan bila belum ada izin — komponen otomatis menyembunyikan bagian ini. */
export const testimoni: Testimoni[] = [];
