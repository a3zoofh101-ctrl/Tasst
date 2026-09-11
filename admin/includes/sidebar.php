<?php
$nav = [
    ['key' => 'dashboard',     'href' => 'index.php',         'icon' => 'grid',    'label' => 'الرئيسية'],
    ['key' => 'users',         'href' => 'users.php',         'icon' => 'users',   'label' => 'المستخدمون'],
    ['key' => 'services',      'href' => 'services.php',      'icon' => 'list',    'label' => 'الخدمات'],
    ['key' => 'orders',        'href' => 'orders.php',        'icon' => 'cart',    'label' => 'الطلبات', 'badge' => $pendingCounts['orders'] ?? 0],
    ['key' => 'tickets',       'href' => 'tickets.php',       'icon' => 'ticket',  'label' => 'تذاكر الدعم', 'badge' => $pendingCounts['tickets'] ?? 0],
    ['key' => 'topups',        'href' => 'topups.php',        'icon' => 'wallet',  'label' => 'الشحن والمدفوعات'],
    ['key' => 'refunds',       'href' => 'refunds.php',       'icon' => 'file',    'label' => 'الاسترجاعات', 'badge' => $pendingCounts['refunds'] ?? 0],
    ['key' => 'subscriptions', 'href' => 'subscriptions.php', 'icon' => 'refresh', 'label' => 'الاشتراكات'],
    ['key' => 'affiliate',     'href' => 'affiliate.php',     'icon' => 'cash',    'label' => 'التسويق بالعمولة'],
    ['key' => 'updates',       'href' => 'updates.php',       'icon' => 'edit',    'label' => 'التحديثات'],
    ['key' => 'settings',      'href' => 'settings.php',      'icon' => 'settings','label' => 'الإعدادات'],
];
?>
<aside class="sidebar" id="sidebar">
  <p class="sidebar-title">إدارة المنصة</p>
  <nav>
    <?php foreach ($nav as $item): ?>
      <a href="<?= BASE_URL ?>/admin/<?= $item['href'] ?>" class="nav-link <?= ($active ?? '') === $item['key'] ? 'active' : '' ?>">
        <?= icon($item['icon']) ?>
        <span><?= e($item['label']) ?></span>
        <?php if (!empty($item['badge'])): ?><span class="nav-badge"><?= (int)$item['badge'] ?></span><?php endif; ?>
      </a>
    <?php endforeach; ?>
  </nav>
</aside>
<div class="sidebar-backdrop" id="sidebarBackdrop"></div>
