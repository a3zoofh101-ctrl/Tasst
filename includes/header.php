<?php
/**
 * Shared layout header for the logged-in user area.
 * Expects: $pdo, $user, $page_title (string), $active (string key)
 */
$site_name = get_setting($pdo, 'site_name', 'سوشيال برو');
$whatsapp = get_setting($pdo, 'whatsapp_number', '');
$openTickets = 0;
if (!empty($user)) {
    $t = $pdo->prepare("SELECT COUNT(*) FROM tickets WHERE user_id = ? AND status != 'closed'");
    $t->execute([$user['id']]);
    $openTickets = (int)$t->fetchColumn();
}
?><!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= e($page_title ?? $site_name) ?> | <?= e($site_name) ?></title>
<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
</head>
<body>
<div class="app">
  <header class="topbar">
    <button class="icon-btn sidebar-toggle" id="sidebarToggle" aria-label="القائمة"><?= icon('menu') ?></button>
    <div class="brand">
      <span class="brand-mark"><?= e(mb_substr($site_name, 0, 1)) ?></span>
      <div class="brand-text">
        <strong><?= e($site_name) ?></strong>
        <small><?= e(get_setting($pdo, 'site_tagline', '')) ?></small>
      </div>
    </div>
    <div class="topbar-spacer"></div>
    <?php if (!empty($user)): ?>
      <a href="<?= BASE_URL ?>/topup.php" class="balance-pill">
        <?= icon('wallet') ?>
        <span><?= format_money($user['balance'], $pdo) ?></span>
      </a>
      <div class="user-menu">
        <button class="icon-btn" id="userMenuBtn"><?= icon('user') ?></button>
        <div class="user-dropdown" id="userDropdown">
          <div class="user-dropdown-head">
            <strong><?= e($user['name']) ?></strong>
            <small><?= e($user['email']) ?></small>
          </div>
          <a href="<?= BASE_URL ?>/profile.php"><?= icon('settings') ?> الملف الشخصي</a>
          <?php if ($user['role'] === 'admin'): ?>
          <a href="<?= BASE_URL ?>/admin/index.php"><?= icon('grid') ?> لوحة الإدارة</a>
          <?php endif; ?>
          <a href="<?= BASE_URL ?>/logout.php"><?= icon('log-out') ?> تسجيل الخروج</a>
        </div>
      </div>
    <?php else: ?>
      <a href="<?= BASE_URL ?>/login.php" class="btn btn-sm btn-primary">تسجيل الدخول</a>
    <?php endif; ?>
  </header>

  <div class="layout">
    <?php if (!empty($user)) include __DIR__ . '/sidebar.php'; ?>
    <main class="content">
      <?php if ($msg = flash('success')): ?><div class="alert alert-success"><?= icon('check') ?> <?= e($msg) ?></div><?php endif; ?>
      <?php if ($msg = flash('error')): ?><div class="alert alert-danger"><?= e($msg) ?></div><?php endif; ?>
