<?php
/**
 * Shared layout header for the admin area.
 * Expects: $pdo, $admin, $page_title, $active
 */
$site_name = get_setting($pdo, 'site_name', 'سوشيال برو');

$pendingCounts = [
    'tickets' => (int)$pdo->query("SELECT COUNT(*) FROM tickets WHERE status != 'closed'")->fetchColumn(),
    'refunds' => (int)$pdo->query("SELECT COUNT(*) FROM refunds WHERE status = 'pending'")->fetchColumn(),
    'orders'  => (int)$pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'pending'")->fetchColumn(),
];
?><!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= e($page_title ?? 'لوحة الإدارة') ?> | إدارة <?= e($site_name) ?></title>
<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
</head>
<body>
<div class="app">
  <header class="topbar">
    <button class="icon-btn sidebar-toggle" id="sidebarToggle" aria-label="القائمة"><?= icon('menu') ?></button>
    <div class="brand">
      <span class="brand-mark"><?= e(mb_substr($site_name, 0, 1)) ?></span>
      <div class="brand-text">
        <strong>لوحة الإدارة</strong>
        <small><?= e($site_name) ?></small>
      </div>
    </div>
    <div class="topbar-spacer"></div>
    <a href="<?= BASE_URL ?>/dashboard.php" class="btn btn-sm btn-outline"><?= icon('grid') ?> الموقع</a>
    <div class="user-menu">
      <button class="icon-btn" id="userMenuBtn"><?= icon('user') ?></button>
      <div class="user-dropdown" id="userDropdown">
        <div class="user-dropdown-head"><strong><?= e($admin['name']) ?></strong><small><?= e($admin['email']) ?></small></div>
        <a href="<?= BASE_URL ?>/logout.php"><?= icon('log-out') ?> تسجيل الخروج</a>
      </div>
    </div>
  </header>
  <div class="layout">
    <?php include __DIR__ . '/sidebar.php'; ?>
    <main class="content">
      <?php if ($msg = flash('success')): ?><div class="alert alert-success"><?= icon('check') ?> <?= e($msg) ?></div><?php endif; ?>
      <?php if ($msg = flash('error')): ?><div class="alert alert-danger"><?= e($msg) ?></div><?php endif; ?>
