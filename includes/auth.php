<?php
/**
 * Authentication helpers.
 */

function current_user(PDO $pdo) {
    static $user = null;
    static $loaded = false;
    if ($loaded) {
        return $user;
    }
    $loaded = true;
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch() ?: null;
    if ($user && $user['status'] === 'banned') {
        session_destroy();
        $user = null;
    }
    return $user;
}

function require_login(PDO $pdo) {
    $user = current_user($pdo);
    if (!$user) {
        redirect(BASE_URL . '/login.php');
    }
    return $user;
}

function require_admin(PDO $pdo) {
    $user = require_login($pdo);
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        die('غير مصرح لك بالوصول لهذه الصفحة.');
    }
    return $user;
}

define('LOGIN_MAX_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_MINUTES', 15);

function client_ip() {
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/**
 * Returns true if this email or IP has too many recent failed logins.
 */
function is_login_locked(PDO $pdo, $email) {
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM login_attempts WHERE (identifier = ? OR ip_address = ?) AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)');
    $stmt->execute([$email, client_ip(), LOGIN_LOCKOUT_MINUTES]);
    return ((int)$stmt->fetchColumn()) >= LOGIN_MAX_ATTEMPTS;
}

function record_failed_login(PDO $pdo, $email) {
    $stmt = $pdo->prepare('INSERT INTO login_attempts (identifier, ip_address) VALUES (?, ?)');
    $stmt->execute([$email, client_ip()]);
}

function clear_login_attempts(PDO $pdo, $email) {
    $stmt = $pdo->prepare('DELETE FROM login_attempts WHERE identifier = ? OR ip_address = ?');
    $stmt->execute([$email, client_ip()]);
}

function attempt_login(PDO $pdo, $email, $password) {
    if (is_login_locked($pdo, $email)) {
        return 'locked';
    }

    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, $user['password_hash'])) {
        record_failed_login($pdo, $email);
        return false;
    }
    if ($user['status'] === 'banned') {
        return 'banned';
    }
    clear_login_attempts($pdo, $email);
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    return $user;
}

function do_logout() {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
}
