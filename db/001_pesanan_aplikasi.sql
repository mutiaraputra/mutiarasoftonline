-- Migrasi 001 — tabel penampung permintaan aplikasi dari formulir website.
-- MySQL 5.7+ / MariaDB 10.3+

CREATE TABLE IF NOT EXISTS `pesanan_aplikasi` (
  `id`           VARCHAR(40)  NOT NULL COMMENT 'Format MS-YYMMDD-xxxxxx',
  `nama`         VARCHAR(120) NOT NULL,
  `perusahaan`   VARCHAR(160) DEFAULT NULL,
  `kontak`       VARCHAR(160) NOT NULL COMMENT 'Nomor WhatsApp atau email',
  `jenis_solusi` VARCHAR(32)  NOT NULL COMMENT 'kasir | ecommerce | sistem-informasi | kustom',
  `anggaran`     VARCHAR(32)  NOT NULL,
  `kebutuhan`    TEXT         NOT NULL,
  `status`       ENUM('baru','dihubungi','penawaran','deal','batal')
                 NOT NULL DEFAULT 'baru',
  `catatan`      TEXT         DEFAULT NULL COMMENT 'Catatan internal tim',
  `ip`           VARCHAR(45)  DEFAULT NULL,
  `user_agent`   VARCHAR(255) DEFAULT NULL,
  `sumber`       VARCHAR(120) DEFAULT NULL,
  `dibuat_pada`  DATETIME     NOT NULL,
  `diubah_pada`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status_tanggal` (`status`, `dibuat_pada`),
  KEY `idx_jenis_solusi` (`jenis_solusi`),
  KEY `idx_kontak` (`kontak`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
