<?php
require_once __DIR__ . '/../config/config.php';
$admin = require_admin($pdo);
$page_title = 'الرئيسية';
$active = 'dashboard';

$stats = [
    'users' => (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn(),
    'orders' => (int)$pdo->query('SELECT COUNT(*) FROM orders')->fetchColumn(),
    'revenue' => (float)$pdo->query("SELECT COALESCE(SUM(charge),0) FROM orders WHERE status != 'canceled' AND status != 'refunded'")->fetchColumn(),
    'topups' => (float)$pdo->query("SELECT COALESCE(SUM(amount),0) FROM topups WHERE status = 'paid'")->fetchColumn(),
    'pending_orders' => (int)$pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'pending'")->fetchColumn(),
    'open_tickets' => (int)$pdo->query("SELECT COUNT(*) FROM tickets WHERE status != 'closed'")->fetchColumn(),
    'pending_refunds' => (int)$pdo->query("SELECT COUNT(*) FROM refunds WHERE status = 'pending'")->fetchColumn(),
    'pending_topups' => (int)$pdo->query("SELECT COUNT(*) FROM topups WHERE status = 'pending'")->fetchColumn(),
];

$recentOrders = $pdo->query('SELECT o.*, u.name AS user_name, s.name AS service_name FROM orders o JOIN users u ON u.id = o.user_id JOIN services s ON s.id = o.service_id ORDER BY o.id DESC LIMIT 8')->fetchAll();
$recentUsers = $pdo->query('SELECT * FROM users ORDER BY id DESC LIMIT 5')->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<div class="grid grid-4">
  <div class="card stat-card"><div class="stat-icon"><?= icon('users') ?></div><div><div class="stat-value"><?= number_format($stats['users']) ?></div><div class="stat-label">إجمالي المستخدمين</div></div></div>
  <div class="card stat-card"><div class="stat-icon"><?= icon('cart') ?></div><div><div class="stat-value"><?= number_format($stats['orders']) ?></div><div class="stat-label">إجمالي الطلبات</div></div></div>
  <div class="card stat-card"><div class="stat-icon"><?= icon('cash') ?></div><div><div class="stat-value"><?= format_money($stats['revenue'], $pdo) ?></div><div class="stat-label">إجمالي مبيعات الطلبات</div></div></div>
  <div class="card stat-card"><div class="stat-icon"><?= icon('wallet') ?></div><div><div class="stat-value"><?= format_money($stats['topups'], $pdo) ?></div><div class="stat-label">إجمالي الشحن المدفوع</div></div></div>
</div>

<div class="grid grid-4">
  <a href="orders.php?status=pending" class="card stat-card"><div class="stat-icon"><?= icon('history') ?></div><div><div class="stat-value"><?= $stats['pending_orders'] ?></div><div class="stat-label">طلبات قيد الانتظار</div></div></a>
  <a href="tickets.php" class="card stat-card"><div class="stat-icon"><?= icon('ticket') ?></div><div><div class="stat-value"><?= $stats['open_tickets'] ?></div><div class="stat-label">تذاكر مفتوحة</div></div></a>
  <a href="refunds.php" class="card stat-card"><div class="stat-icon"><?= icon('file') ?></div><div><div class="stat-value"><?= $stats['pending_refunds'] ?></div><div class="stat-label">طلبات استرجاع معلقة</div></div></a>
  <a href="topups.php?status=pending" class="card stat-card"><div class="stat-icon"><?= icon('droplet') ?></div><div><div class="stat-value"><?= $stats['pending_topups'] ?></div><div class="stat-label">عمليات شحن معلقة</div></div></a>
</div>

<div class="grid grid-2" style="align-items:start;">
  <div class="card">
    <div class="card-title"><?= icon('cart') ?> آخر الطلبات</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>#</th><th>المستخدم</th><th>الخدمة</th><th>السعر</th><th>الحالة</th></tr></thead>
        <tbody>
          <?php foreach ($recentOrders as $o): ?>
          <tr>
            <td>#<?= $o['id'] ?></td>
            <td><?= e($o['user_name']) ?></td>
            <td><?= e($o['service_name']) ?></td>
            <td><?= format_money($o['charge'], $pdo) ?></td>
            <td><span class="badge <?= status_badge_class($o['status']) ?>"><?= status_label($o['status']) ?></span></td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
  <div class="card">
    <div class="card-title"><?= icon('users') ?> آخر المستخدمين</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>الاسم</th><th>البريد</th><th>الرصيد</th><th>التسجيل</th></tr></thead>
        <tbody>
          <?php foreach ($recentUsers as $u): ?>
          <tr>
            <td><?= e($u['name']) ?></td>
            <td><?= e($u['email']) ?></td>
            <td><?= format_money($u['balance'], $pdo) ?></td>
            <td><?= date('Y-m-d', strtotime($u['created_at'])) ?></td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
