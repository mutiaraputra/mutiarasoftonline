<?php
/**
 * order-bridge.php — jembatan penyimpanan pesanan di cPanel shared hosting.
 *
 * Endpoint Astro (/api/order) memanggil berkas ini dengan HMAC-SHA256 supaya
 * hanya server kita yang bisa menulis. Taruh di public_html/api/order-bridge.php
 * dan isi ORDER_BRIDGE_SECRET dengan nilai yang sama di kedua sisi.
 *
 * PHP 8.1+ · PDO MySQL
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// --- Konfigurasi -----------------------------------------------------------
// Sebaiknya letakkan berkas config di luar public_html.
$konfigurasi = require __DIR__ . '/../config/mutiarasoft.php';
/*  Isi contoh ../config/mutiarasoft.php:
    <?php return [
      'db' => ['host' => 'localhost', 'name' => 'uvvikcvj_mutiarasoft',
               'user' => 'uvvikcvj_web', 'pass' => '...'],
      'secret' => 'string-acak-yang-sama-dengan-ORDER_BRIDGE_SECRET',
      'toleransi_detik' => 300,
    ];
*/

function jawab(int $status, array $data): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// --- 1. Hanya POST ---------------------------------------------------------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    jawab(405, ['ok' => false, 'pesan' => 'Gunakan metode POST.']);
}

$badan     = file_get_contents('php://input') ?: '';
$signature = $_SERVER['HTTP_X_SIGNATURE'] ?? '';
$timestamp = $_SERVER['HTTP_X_TIMESTAMP'] ?? '';

// --- 2. Verifikasi tanda tangan & umur permintaan --------------------------
if ($signature === '' || $timestamp === '') {
    jawab(401, ['ok' => false, 'pesan' => 'Tanda tangan tidak ada.']);
}

$umur = abs((int) round(microtime(true) * 1000) - (int) $timestamp) / 1000;
if ($umur > ($konfigurasi['toleransi_detik'] ?? 300)) {
    jawab(401, ['ok' => false, 'pesan' => 'Permintaan kedaluwarsa.']);
}

$harapan = hash_hmac('sha256', $timestamp . '.' . $badan, $konfigurasi['secret']);
if (!hash_equals($harapan, $signature)) {
    jawab(401, ['ok' => false, 'pesan' => 'Tanda tangan tidak cocok.']);
}

// --- 3. Baca & saring payload ---------------------------------------------
$data = json_decode($badan, true);
if (!is_array($data)) {
    jawab(400, ['ok' => false, 'pesan' => 'Payload bukan JSON yang sah.']);
}

$wajib = ['id', 'nama', 'kontak', 'jenisSolusi', 'anggaran', 'kebutuhan', 'dibuatPada'];
foreach ($wajib as $kunci) {
    if (empty($data[$kunci])) {
        jawab(422, ['ok' => false, 'pesan' => "Field {$kunci} kosong."]);
    }
}

$potong = static fn (?string $nilai, int $panjang): ?string =>
    $nilai === null ? null : mb_substr(trim($nilai), 0, $panjang);

// --- 4. Simpan -------------------------------------------------------------
try {
    $pdo = new PDO(
        sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $konfigurasi['db']['host'], $konfigurasi['db']['name']),
        $konfigurasi['db']['user'],
        $konfigurasi['db']['pass'],
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );

    $sql = 'INSERT INTO pesanan_aplikasi
              (id, nama, perusahaan, kontak, jenis_solusi, anggaran, kebutuhan,
               ip, user_agent, sumber, dibuat_pada)
            VALUES
              (:id, :nama, :perusahaan, :kontak, :jenis_solusi, :anggaran, :kebutuhan,
               :ip, :user_agent, :sumber, :dibuat_pada)
            ON DUPLICATE KEY UPDATE id = id';

    $pdo->prepare($sql)->execute([
        ':id'           => $potong($data['id'], 40),
        ':nama'         => $potong($data['nama'], 120),
        ':perusahaan'   => $potong($data['perusahaan'] ?? null, 160) ?: null,
        ':kontak'       => $potong($data['kontak'], 160),
        ':jenis_solusi' => $potong($data['jenisSolusi'], 32),
        ':anggaran'     => $potong($data['anggaran'], 32),
        ':kebutuhan'    => $potong($data['kebutuhan'], 4000),
        ':ip'           => $potong($data['ip'] ?? null, 45),
        ':user_agent'   => $potong($data['userAgent'] ?? null, 255),
        ':sumber'       => $potong($data['sumber'] ?? 'web', 120),
        ':dibuat_pada'  => date('Y-m-d H:i:s', strtotime((string) $data['dibuatPada'])),
    ]);

    jawab(200, ['ok' => true, 'id' => $data['id']]);
} catch (Throwable $e) {
    error_log('[order-bridge] ' . $e->getMessage());
    jawab(500, ['ok' => false, 'pesan' => 'Gagal menyimpan pesanan.']);
}
