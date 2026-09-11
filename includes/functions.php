<?php
/**
 * General helper functions shared across the site.
 */

function e($str) {
    return htmlspecialchars((string)$str, ENT_QUOTES, 'UTF-8');
}

function redirect($path) {
    header('Location: ' . $path);
    exit;
}

function flash($key, $message = null) {
    if ($message !== null) {
        $_SESSION['flash'][$key] = $message;
        return;
    }
    if (!empty($_SESSION['flash'][$key])) {
        $msg = $_SESSION['flash'][$key];
        unset($_SESSION['flash'][$key]);
        return $msg;
    }
    return null;
}

function get_setting($pdo, $key, $default = '') {
    static $cache = null;
    if ($cache === null) {
        $cache = [];
        $stmt = $pdo->query('SELECT setting_key, setting_value FROM site_settings');
        foreach ($stmt->fetchAll() as $row) {
            $cache[$row['setting_key']] = $row['setting_value'];
        }
    }
    return $cache[$key] ?? $default;
}

function set_setting($pdo, $key, $value) {
    $stmt = $pdo->prepare('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)');
    $stmt->execute([$key, $value]);
}

function format_money($amount, $pdo = null) {
    $symbol = $pdo ? get_setting($pdo, 'currency_symbol', 'ر.س') : 'ر.س';
    return number_format((float)$amount, 2) . ' ' . $symbol;
}

function generate_token($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

function generate_referral_code() {
    return strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
}

/**
 * Credit or debit a user's wallet balance and record a ledger entry.
 * $amount: positive to credit, negative to debit.
 */
function wallet_adjust(PDO $pdo, $userId, $amount, $type, $description = null, $reference = null) {
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('SELECT balance FROM users WHERE id = ? FOR UPDATE');
        $stmt->execute([$userId]);
        $current = $stmt->fetchColumn();
        if ($current === false) {
            throw new RuntimeException('User not found');
        }
        $newBalance = round((float)$current + (float)$amount, 2);
        if ($newBalance < 0) {
            throw new RuntimeException('INSUFFICIENT_FUNDS');
        }
        $upd = $pdo->prepare('UPDATE users SET balance = ? WHERE id = ?');
        $upd->execute([$newBalance, $userId]);

        $log = $pdo->prepare('INSERT INTO transactions (user_id, type, amount, balance_after, reference, description) VALUES (?, ?, ?, ?, ?, ?)');
        $log->execute([$userId, $type, $amount, $newBalance, $reference, $description]);

        $pdo->commit();
        return $newBalance;
    } catch (Exception $ex) {
        $pdo->rollBack();
        throw $ex;
    }
}

function points_adjust(PDO $pdo, $userId, $points, $type, $reference = null) {
    $stmt = $pdo->prepare('UPDATE users SET points = points + ? WHERE id = ?');
    $stmt->execute([$type === 'earn' ? $points : -$points, $userId]);
    $log = $pdo->prepare('INSERT INTO points_log (user_id, points, type, reference) VALUES (?, ?, ?, ?)');
    $log->execute([$userId, $points, $type, $reference]);
}

function status_label($status) {
    $map = [
        'pending' => 'قيد الانتظار',
        'in_progress' => 'قيد التنفيذ',
        'completed' => 'مكتمل',
        'partial' => 'مكتمل جزئياً',
        'canceled' => 'ملغي',
        'refunded' => 'مسترجع',
        'open' => 'مفتوحة',
        'answered' => 'تم الرد',
        'closed' => 'مغلقة',
        'paid' => 'مدفوع',
        'failed' => 'فشل',
        'expired' => 'منتهي',
        'approved' => 'موافق عليه',
        'rejected' => 'مرفوض',
        'active' => 'نشط',
        'paused' => 'متوقف',
    ];
    return $map[$status] ?? $status;
}

function status_badge_class($status) {
    $map = [
        'pending' => 'badge-warning',
        'in_progress' => 'badge-info',
        'completed' => 'badge-success',
        'paid' => 'badge-success',
        'approved' => 'badge-success',
        'active' => 'badge-success',
        'partial' => 'badge-info',
        'canceled' => 'badge-danger',
        'rejected' => 'badge-danger',
        'failed' => 'badge-danger',
        'refunded' => 'badge-muted',
        'open' => 'badge-warning',
        'answered' => 'badge-info',
        'closed' => 'badge-muted',
        'expired' => 'badge-muted',
        'paused' => 'badge-muted',
    ];
    return $map[$status] ?? 'badge-muted';
}
