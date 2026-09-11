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

function attempt_login(PDO $pdo, $email, $password) {
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, $user['password_hash'])) {
        return false;
    }
    if ($user['status'] === 'banned') {
        return 'banned';
    }
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
