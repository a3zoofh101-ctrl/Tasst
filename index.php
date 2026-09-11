<?php
require_once __DIR__ . '/config/config.php';

if (!file_exists(__DIR__ . '/install.lock')) {
    redirect(BASE_URL . '/install.php');
}

if (current_user($pdo)) {
    redirect(BASE_URL . '/dashboard.php');
}
redirect(BASE_URL . '/login.php');
