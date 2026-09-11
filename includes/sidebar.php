<?php
/**
 * Sidebar navigation for the user dashboard area.
 * Expects: $active, $openTickets, $user
 */
$nav = [
    ['key' => 'dashboard',     'href' => 'dashboard.php',     'icon' => 'cart',    'label' => 'طلب جديد'],
    ['key' => 'bulk',          'href' => 'bulk-order.php',    'icon' => 'layers',  'label' => 'طلبات جماعية'],
    ['key' => 'orders',        'href' => 'orders.php',        'icon' => 'history', 'label' => 'سجل الطلبات'],
    ['key' => 'services',      'href' => 'services.php',      'icon' => 'list',    'label' => 'قائمة الخدمات'],
    ['key' => 'topup',         'href' => 'topup.php',         'icon' => 'wallet',  'label' => 'شحن الرصيد'],
    ['key' => 'tickets',       'href' => 'tickets.php',       'icon' => 'ticket',  'label' => 'تذاكر الدعم', 'badge' => $openTickets ?? 0],
    ['key' => 'subscriptions', 'href' => 'subscriptions.php', 'icon' => 'refresh', 'label' => 'الاشتراكات'],
    ['key' => 'refunds',       'href' => 'refunds.php',       'icon' => 'file',    'label' => 'سجل الإسترجاع'],
    ['key' => 'payments',      'href' => 'payments.php',      'icon' => 'droplet', 'label' => 'الدفعات المرسلة'],
    ['key' => 'points',        'href' => 'points.php',        'icon' => 'star',    'label' => 'نقاطي'],
    ['key' => 'api',           'href' => 'api.php',           'icon' => 'code',    'label' => 'API'],
    ['key' => 'affiliate',     'href' => 'affiliate.php',     'icon' => 'cash',    'label' => 'التسويق بالعمولة'],
    ['key' => 'updates',       'href' => 'updates.php',       'icon' => 'edit',    'label' => 'التحديثات'],
];
?>
<aside class="sidebar" id="sidebar">
  <p class="sidebar-title">القائمة</p>
  <nav>
    <?php foreach ($nav as $item): ?>
      <a href="<?= BASE_URL ?>/<?= $item['href'] ?>" class="nav-link <?= ($active ?? '') === $item['key'] ? 'active' : '' ?>">
        <?= icon($item['icon']) ?>
        <span><?= e($item['label']) ?></span>
        <?php if (!empty($item['badge'])): ?><span class="nav-badge"><?= (int)$item['badge'] ?></span><?php endif; ?>
      </a>
    <?php endforeach; ?>
  </nav>
</aside>
<div class="sidebar-backdrop" id="sidebarBackdrop"></div>
