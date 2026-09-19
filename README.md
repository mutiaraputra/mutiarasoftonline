# Mutiara Software — Website Perusahaan

Fondasi awal website profil perusahaan, etalase layanan, dan katalog produk
Mutiara Software. Dibangun dengan **Astro 5 + Tailwind CSS 4 + Alpine.js**,
di-deploy sebagai HTML statis dengan satu endpoint server untuk formulir.

---

## Menjalankan di lokal

```bash
npm install
cp .env.example .env      # isi token Telegram & kredensial penyimpanan
npm run dev               # http://localhost:4321
```

Perintah lain: `npm run build` (produksi), `npm run preview`, `npm run check`
(pemeriksaan tipe & template).

---

## Struktur folder

```
mutiarasoft-web/
├─ astro.config.mjs          Adapter Vercel, sitemap, Tailwind, Alpine
├─ package.json
├─ tsconfig.json             Alias "@/*" → "src/*"
├─ .env.example              Cetakan environment (jangan commit .env asli)
│
├─ db/
│  └─ 001_pesanan_aplikasi.sql   Migrasi tabel pesanan
│
├─ bridge/
│  └─ order-bridge.php       Endpoint penulis MySQL di cPanel (HMAC-SHA256)
│
└─ src/
   ├─ styles/global.css      Design token (@theme) + komponen dasar
   ├─ alpine.entrypoint.ts   Magic $rupiah dan store global Alpine
   │
   ├─ layouts/
   │  └─ BaseLayout.astro    <head>, meta SEO, Open Graph, JSON-LD, skip-link
   │
   ├─ components/
   │  ├─ Header.astro        Navigasi responsif + CTA
   │  ├─ Hero.astro          Headline + struk yang "tercetak" saat halaman dibuka
   │  ├─ Footer.astro
   │  └─ OrderForm.astro     Formulir pemesanan (Alpine, validasi, status live)
   │
   ├─ lib/
   │  ├─ site.ts             Sumber tunggal identitas, menu, opsi form
   │  ├─ rate-limit.ts       Pembatas laju berbasis memori
   │  ├─ telegram.ts         Penyusun & pengirim notifikasi bot
   │  └─ orders/
   │     ├─ schema.ts        Skema Zod (dipakai bersama form & API)
   │     ├─ types.ts         Antarmuka RepositoriPesanan
   │     ├─ bridge-repository.ts   Adapter → endpoint PHP cPanel
   │     ├─ mysql-repository.ts    Adapter → MySQL langsung
   │     └─ index.ts         Pabrik pemilih adapter (ORDER_STORAGE)
   │
   └─ pages/
      ├─ index.astro         Beranda
      ├─ pesan.astro         Halaman formulir pemesanan
      └─ api/order.ts        POST /api/order (server, tidak di-prerender)
```

### Halaman yang menyusul

`tentang.astro`, `layanan/index.astro`, `layanan/[slug].astro`,
`produk/index.astro`, `produk/[slug].astro`, `demo/index.astro`,
`demo/[slug].astro`, `portofolio.astro`,
`edukasi/website-sendiri-vs-marketplace.astro`, `kontak.astro`,
`terima-kasih.astro`.

---

## Alur data formulir pemesanan

```
Pengunjung
   │  POST JSON
   ▼
/api/order  (Astro, berjalan di server)
   │
   ├─ 1. Parse JSON atau FormData
   ├─ 2. Validasi Zod  ──────────► 422 + galat per-field
   ├─ 3. Saringan bot: honeypot + submit < 3 detik
   ├─ 4. Rate limit per IP  ─────► 429
   │
   ├─ 5. repo.simpan()            ORDER_STORAGE menentukan adapter
   │        ├─ "bridge" → POST ke order-bridge.php (HMAC) → MySQL cPanel
   │        ├─ "mysql"  → INSERT langsung lewat mysql2
   │        └─ "none"   → lewati (mode uji)
   │
   ├─ 6. kirimNotifikasi()        api.telegram.org/bot<TOKEN>/sendMessage
   │        parse_mode HTML + tombol "Balas via WhatsApp"
   │
   └─ 7. Jawab { ok, id, pesan }
```

Penyimpanan dan notifikasi berjalan **independen**: kegagalan Telegram tidak
membatalkan pesanan yang sudah tersimpan, dan sebaliknya. Permintaan hanya
ditolak bila keduanya gagal.

---

## Menyiapkan Bot Telegram

1. Chat **@BotFather** → `/newbot` → salin token ke `TELEGRAM_BOT_TOKEN`.
2. Buat grup internal, undang bot, jadikan admin.
3. Kirim satu pesan di grup, lalu buka
   `https://api.telegram.org/bot<TOKEN>/getUpdates` dan salin `chat.id`
   (grup diawali tanda minus) ke `TELEGRAM_CHAT_ID`.
4. Uji tanpa membuka browser:

```bash
curl -X POST http://localhost:4321/api/order \
  -H 'Content-Type: application/json' \
  -d '{"nama":"Uji Coba","kontak":"081234567890","jenisSolusi":"kasir",
       "anggaran":"5-15jt","kebutuhan":"Uji kiriman notifikasi dari endpoint lokal ke Telegram."}'
```

---

## Menyiapkan penyimpanan di cPanel (mode `bridge`)

1. Jalankan `db/001_pesanan_aplikasi.sql` lewat phpMyAdmin.
2. Unggah `bridge/order-bridge.php` ke `public_html/api/`.
3. Buat `config/mutiarasoft.php` **di luar** `public_html` berisi kredensial DB
   dan `secret` (lihat komentar di bagian atas berkas PHP).
4. Isi `ORDER_BRIDGE_URL` dan `ORDER_BRIDGE_SECRET` di `.env`; nilai secret
   harus identik di kedua sisi.

Bila nanti pindah ke VPS satu jaringan dengan MySQL, cukup ubah
`ORDER_STORAGE="mysql"` — kode endpoint tidak berubah sama sekali.

---

## Catatan aksesibilitas & performa

- Seluruh halaman marketing di-prerender; tidak ada JavaScript framework yang
  dikirim kecuali Alpine (~15 KB) untuk navigasi dan formulir.
- Formulir tetap dapat divalidasi server-side bila JavaScript mati — endpoint
  menerima `FormData` maupun JSON.
- Fokus keyboard terlihat di semua kontrol, status formulir diumumkan lewat
  `role="status"`, dan seluruh animasi dihormati `prefers-reduced-motion`.

---

## Struktur lanjutan (tahap 2 pembangunan)

```
src/
├─ content.config.ts            Skema koleksi produk & demo (Zod)
├─ content/
│  ├─ produk/*.md               Satu berkas = satu produk di katalog
│  └─ demo/*.md                 Satu berkas = satu demo yang bisa dicoba
├─ lib/
│  ├─ site.ts                   Identitas, menu, nilai perusahaan, opsi form
│  └─ klien.ts                  Industri & testimoni (isi masih placeholder)
├─ components/
│  ├─ Profil.astro              Ringkas identitas + tiga nilai
│  ├─ KatalogProduk.astro       Grid, bisa dibatasi jumlahnya
│  ├─ KartuProduk.astro
│  ├─ SorotanKasir.astro        Kasir Plus Akuntansi + alur ke Accurate
│  ├─ KomparasiMarketplace.astro  Tabel + kalkulator margin
│  ├─ DemoInteraktif.astro
│  └─ PortofolioKlien.astro
└─ pages/
   ├─ tentang.astro
   ├─ layanan/index.astro
   ├─ produk/index.astro · produk/[slug].astro
   ├─ demo/index.astro
   ├─ portofolio.astro
   └─ edukasi/website-sendiri-vs-marketplace.astro
```

### Menambah produk baru

Buat satu berkas di `src/content/produk/`, misalnya `aplikasi-koperasi.md`,
dengan frontmatter `nama`, `ringkas`, `platform`, `kategori`, `fitur`, dan
`urutan`. Halaman `/produk/aplikasi-koperasi` terbentuk otomatis, dan kartunya
muncul di katalog. Skema di `content.config.ts` akan menolak build bila ada
field yang salah atau kurang — jadi katalog tidak bisa rusak diam-diam.

### Yang masih perlu Anda isi

1. `src/lib/klien.ts` — nama klien dan testimoni asli, beserta izin menyebut nama.
2. `src/content/demo/*.md` — URL demo yang benar-benar hidup.
3. `public/og/default.jpg` (1200×630) dan `public/favicon.svg`.
4. Halaman detail layanan `layanan/[slug].astro` bila ingin satu halaman SEO per layanan.

---

## Demo kasir yang berjalan sendiri

`src/pages/demo/kasir.astro` adalah demo penuh yang jalan di peramban pengunjung —
tanpa server, tanpa basis data, tanpa pendaftaran. Pengunjung memilih barang,
mengubah jumlah, memberi diskon, membayar, dan mencetak struk; panel di sebelah
kanan memperlihatkan jurnal (Kas, Pendapatan, PPN keluaran, HPP, Persediaan) yang
terbentuk mengikuti isi keranjang.

Bagian itulah argumen penjualan produk andalan Anda, dan karena tidak butuh server
demo, ia tidak akan mati diam-diam seperti demo yang di-hosting terpisah.

Dua demo lain (toko online dan SPP) ditandai `siap: false` di frontmatter-nya, jadi
kartunya tampil sebagai "Segera" dan tidak bisa diklik sampai Anda menyalakannya —
tidak ada tautan mati di situs.

## Yang masih terbuka

- `src/lib/klien.ts` masih kosong dari testimoni; isi dengan nama dan izin yang sebenarnya.
- `public/og/default.jpg` (1200×630) belum ada — buat sekali, dipakai semua halaman.
- `npm run build` belum pernah dijalankan; lakukan sekali sebelum deploy pertama.



Berikut kegunaan tiap variabel di .env, dikelompokkan sesuai urutan di .env.example, plus bagaimana masing-masing benar-benar dipakai di kode.

Kelompok "Situs"
PUBLIC_SITE_URL
Alamat resmi situs. Dipakai src/lib/site.ts untuk membentuk situs.url, yang lalu dipakai BaseLayout.astro untuk menyusun URL kanonik tiap halaman, URL gambar Open Graph yang absolut, dan field url di JSON-LD ProfessionalService. Kalau kosong, kode jatuh ke nilai bawaan https://mutiarasoft.online.

Satu catatan: astro.config.mjs juga punya site: 'https://mutiarasoft.online' yang ditulis manual, terpisah dari variabel ini — dipakai Astro sendiri untuk menghasilkan sitemap-index.xml. Kalau domain akhirnya berubah, dua tempat itu harus diubah bersamaan; PUBLIC_SITE_URL saja tidak cukup.

PUBLIC_WHATSAPP
Nomor WhatsApp bisnis, format internasional tanpa tanda plus (62857...). Dipakai tautanWhatsApp() untuk membuat semua tautan wa.me/... di situs — tombol di Header, Footer, Hero, halaman /pesan, /kontak, dan tiap halaman produk/layanan. Ini bukan nomor pelanggan yang mengisi formulir; itu field terpisah (kontak) yang disimpan per pesanan.

Kenapa dua ini diberi awalan PUBLIC_: di Astro, hanya variabel yang diawali PUBLIC_ yang diizinkan ikut ke bundel JavaScript sisi peramban; sisanya tetap tertutup di server. Domain dan nomor WhatsApp memang bukan rahasia, jadi aman diberi awalan itu. Jangan pernah menamai token atau kata sandi dengan awalan PUBLIC_ — itu akan bocor ke kode yang bisa dibaca siapa pun lewat "View Source".

Kelompok "Notifikasi Telegram"
TELEGRAM_BOT_TOKEN
Token bot dari @BotFather. Dipakai src/lib/telegram.ts untuk membentuk URL https://api.telegram.org/bot<TOKEN>/sendMessage. Kalau kosong, kirimNotifikasi() langsung berhenti dengan ok: false tanpa mencoba mengirim — pesanan tetap tersimpan (lihat ORDER_STORAGE), hanya notifikasinya yang tidak jalan.

TELEGRAM_CHAT_ID
Tujuan pesan masuk. Isi angka chat.id grup atau pribadi tempat bot itu jadi anggota/admin. Bisa diisi lebih dari satu, dipisah koma — kode memecahnya jadi daftar dan mengirim ke semuanya sekaligus lewat Promise.allSettled, jadi satu tujuan yang gagal tidak menggagalkan tujuan lain.

Kelompok "Penyimpanan pesanan"
ORDER_STORAGE
Saklar yang menentukan adapter mana yang dipakai ambilRepositori() di src/lib/orders/index.ts. Tiga nilai yang dikenali:

Nilai	Yang terjadi
bridge (bawaan)	Kirim POST ke ORDER_BRIDGE_URL, ditandatangani HMAC pakai ORDER_BRIDGE_SECRET
mysql	Sambung langsung ke MySQL pakai lima variabel DB_*
none	Lewati penyimpanan sama sekali — dipakai saat menguji alur Telegram saja
ORDER_BRIDGE_URL
Alamat berkas bridge/order-bridge.php setelah diunggah ke cPanel — misalnya https://mutiarakom.my.id/api/order-bridge.php. Hanya dibaca kalau ORDER_STORAGE=bridge.

ORDER_BRIDGE_SECRET
Kunci rahasia bersama antara endpoint Astro dan order-bridge.php. Nilainya harus persis sama di dua tempat: di sini, dan di config/mutiarasoft.php yang Anda buat di server cPanel (lihat komentar di bagian atas order-bridge.php). Setiap pengiriman ditandatangani dengan HMAC-SHA256(timestamp + '.' + body, secret); kalau tanda tangannya tidak cocok atau permintaannya lebih tua dari 300 detik, PHP menolaknya. Ini yang mencegah orang lain menulis langsung ke tabel pesanan_aplikasi tanpa lewat formulir Anda.

DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD
Kredensial MySQL standar. Hanya dipakai kalau ORDER_STORAGE=mysql — mode ini menyambung langsung dari server tempat Astro berjalan (misalnya Vercel) ke MySQL Anda. Ini alasan bridge jadi bawaan: MySQL di shared hosting cPanel biasanya hanya menerima koneksi dari IP yang di-whitelist, sementara Vercel memakai IP yang berubah-ubah setiap deploy. Mode mysql baru masuk akal kalau server aplikasi dan MySQL-nya nanti berada di jaringan yang sama (misalnya sama-sama di satu VPS).

Kelompok "Anti-spam"
ORDER_RATE_LIMIT_PER_HOUR
Batas jumlah pengiriman formulir yang diterima dari satu alamat IP dalam satu jam berjalan. Dibaca src/pages/api/order.ts, diteruskan ke lewatBatas() di src/lib/rate-limit.ts. Kalau terlampaui, endpoint membalas status 429 dengan pesan yang mengarahkan pengunjung ke WhatsApp. Nilai bawaan 5 — naikkan kalau situs sudah ramai dan sering salah menolak pengunjung sah yang berbagi IP kantor/warnet yang sama.

Satu hal praktis: berkas .env sendiri tidak pernah ikut ter-deploy — ia ada di .gitignore justru supaya rahasia tidak ikut ke Git. Untuk produksi, nilai-nilai di atas (terutama TELEGRAM_BOT_TOKEN, ORDER_BRIDGE_SECRET, dan kredensial DB) diisi lewat dasbor Environment Variables di penyedia hosting Anda (mis. Vercel → Project Settings → Environment Variables), bukan dengan mengunggah .env. .env di lokal hanya untuk npm run dev di komputer Anda.