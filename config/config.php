<?php
/**
 * Main configuration file.
 * Edit the constants below to match your hosting environment before going live.
 */

// ---------------------------------------------------------------
// Environment — set APP_ENV=development on your local/staging machine
// to see PHP errors on screen. Leave as "production" on the live site.
// ---------------------------------------------------------------
define('APP_ENV', getenv('APP_ENV') ?: 'production');

if (APP_ENV === 'development') {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE);
}
ini_set('log_errors', '1');

// ---------------------------------------------------------------
// Database credentials — EDIT THESE for your hosting (cPanel etc.)
// ---------------------------------------------------------------
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'smm_panel');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

// Base URL of the site (no trailing slash). Used for building absolute links (e.g. payment callbacks).
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
define('BASE_URL', rtrim(getenv('BASE_URL') ?: (
    ($isHttps ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? 'localhost')
), '/'));

// ---------------------------------------------------------------
// Session
// ---------------------------------------------------------------
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => $isHttps,
    ]);
    session_start();
}

date_default_timezone_set('Asia/Riyadh');

// ---------------------------------------------------------------
// Database connection (PDO)
// ---------------------------------------------------------------
try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    die('تعذّر الاتصال بقاعدة البيانات. الرجاء التحقق من إعدادات الاتصال في config/config.php أو تشغيل install.php أولاً.');
}

require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/csrf.php';
require_once __DIR__ . '/../includes/icons.php';
