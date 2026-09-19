export const situs = {
  nama: 'Mutiara Software',
  merek: 'MutiaraSoft',
  induk: 'Mutiara Komputer (LPK Mutiara)',
  deskripsi:
    'Mutiara Software membangun aplikasi kasir, sistem informasi sekolah dan desa, serta website toko online untuk usaha di Indonesia — lengkap dengan integrasi akuntansi, payment gateway, dan cetak nota.',
  url: import.meta.env.PUBLIC_SITE_URL ?? 'https://mutiarasoft.online',
  whatsapp: import.meta.env.PUBLIC_WHATSAPP ?? '6285755080250',
  email: 'info@mutiarakomputer.my.id',
  alamat: {
    jalan: 'Jl. Raya Jogorogo – Ngawi Km. 1,5 (samping PDAM), Dsn. Genggong RT 003/003',
    desa: 'Ds./Kec. Jogorogo',
    kabupaten: 'Kabupaten Ngawi',
    provinsi: 'Jawa Timur',
    kodePos: '63262',
  },
  berdiri: 2008,
  mulaiTeknisi: 1996,
  facebook: 'https://www.facebook.com/mutiarajgrg',
  youtube: 'https://www.youtube.com/user/Mutiaraputra',
  github: 'https://github.com/mutiaraputra',
  linkedin: 'https://www.linkedin.com/in/mdwipatra',
  indukUrl: 'https://mutiarakom.my.id',
} as const;

/** Tiga nilai yang sudah dipakai merek induk — dipertahankan agar konsisten. */
export const nilai = [
  {
    judul: 'Kejujuran',
    isi: 'Apa yang bisa kami kerjakan kami sebut bisa; yang tidak, kami katakan sejak awal.',
  },
  {
    judul: 'Maksimal',
    isi: 'Setiap proyek dikerjakan dengan seluruh kemampuan yang kami punya, sekecil apa pun nilainya.',
  },
  {
    judul: 'Pengalaman',
    isi: `Menangani perangkat dan sistem sejak ${situs.mulaiTeknisi}, membangun perangkat lunak untuk usaha nyata sejak ${situs.berdiri}.`,
  },
] as const;

export const menuUtama = [
  { label: 'Layanan', href: '/layanan' },
  { label: 'Produk', href: '/produk' },
  { label: 'Demo', href: '/demo' },
  { label: 'Portofolio', href: '/portofolio' },
  { label: 'Tentang', href: '/tentang' },
] as const;

export const jenisSolusi = [
  {
    nilai: 'kasir',
    label: 'Aplikasi Kasir / POS',
    catatan: 'Termasuk varian Kasir Plus Akuntansi dengan jembatan ke Accurate.',
  },
  {
    nilai: 'ecommerce',
    label: 'Website Toko Online',
    catatan: 'Payment gateway, hitung ongkir otomatis, cetak nota pesanan.',
  },
  {
    nilai: 'sistem-informasi',
    label: 'Sistem Informasi',
    catatan: 'Sekolah, kantor desa, koperasi, toko, dan organisasi.',
  },
  {
    nilai: 'kustom',
    label: 'Aplikasi Kustom',
    catatan: 'Alur kerja khas yang belum tersedia di aplikasi jadi.',
  },
] as const;

export const rentangAnggaran = [
  { nilai: '<5jt', label: 'Di bawah Rp 5 juta' },
  { nilai: '5-15jt', label: 'Rp 5 – 15 juta' },
  { nilai: '15-40jt', label: 'Rp 15 – 40 juta' },
  { nilai: '>40jt', label: 'Di atas Rp 40 juta' },
  { nilai: 'belum-tahu', label: 'Belum tahu, mohon dibantu hitung' },
] as const;

export function tautanWhatsApp(pesan: string): string {
  return `https://wa.me/${situs.whatsapp}?text=${encodeURIComponent(pesan)}`;
}

export function rupiah(angka: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(angka || 0);
}
