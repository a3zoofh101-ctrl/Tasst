<?php
require_once __DIR__ . '/config/config.php';
$user = require_login($pdo);
$page_title = 'سجل الطلبات';
$active = 'orders';

$statusFilter = $_GET['status'] ?? '';
$perPage = 20;
$page = max(1, (int)($_GET['page'] ?? 1));
$offset = ($page - 1) * $perPage;

$where = 'WHERE o.user_id = ?';
$params = [$user['id']];
if ($statusFilter && in_array($statusFilter, ['pending','in_progress','completed','partial','canceled','refunded'], true)) {
    $where .= ' AND o.status = ?';
    $params[] = $statusFilter;
}

$countStmt = $pdo->prepare("SELECT COUNT(*) FROM orders o $where");
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();
$totalPages = max(1, (int)ceil($total / $perPage));

$stmt = $pdo->prepare("SELECT o.*, s.name AS service_name FROM orders o JOIN services s ON s.id = o.service_id $where ORDER BY o.id DESC LIMIT $perPage OFFSET $offset");
$stmt->execute($params);
$orders = $stmt->fetchAll();

$statuses = ['' => 'الكل', 'pending' => 'قيد الانتظار', 'in_progress' => 'قيد التنفيذ', 'completed' => 'مكتمل', 'partial' => 'مكتمل جزئياً', 'canceled' => 'ملغي', 'refunded' => 'مسترجع'];

include __DIR__ . '/includes/header.php';
?>
<div class="card">
  <div class="card-title"><?= icon('history') ?> سجل الطلبات</div>
  <div class="tabs">
    <?php foreach ($statuses as $key => $label): ?>
      <a class="tab <?= $statusFilter === $key ? 'active' : '' ?>" href="?status=<?= e($key) ?>"><?= e($label) ?></a>
    <?php endforeach; ?>
  </div>

  <?php if (empty($orders)): ?>
    <div class="empty-state"><?= icon('cart') ?><p>لا توجد طلبات حتى الآن</p><a href="<?= BASE_URL ?>/dashboard.php" class="btn btn-primary">إنشاء طلب جديد</a></div>
  <?php else: ?>
  <div class="table-wrap">
    <table>
      <thead><tr><th>#</th><th>الخدمة</th><th>الرابط</th><th>الكمية</th><th>المتبقي</th><th>السعر</th><th>الحالة</th><th>التاريخ</th></tr></thead>
      <tbody>
        <?php foreach ($orders as $o): ?>
        <tr>
          <td>#<?= $o['id'] ?></td>
          <td><?= e($o['service_name']) ?></td>
          <td class="wrap"><a href="<?= e($o['link']) ?>" target="_blank" rel="noopener" style="color:var(--info);"><?= e(mb_strimwidth($o['link'], 0, 40, '…')) ?></a></td>
          <td><?= number_format($o['quantity']) ?></td>
          <td><?= $o['remains'] !== null ? number_format($o['remains']) : '-' ?></td>
          <td><?= format_money($o['charge'], $pdo) ?></td>
          <td><span class="badge <?= status_badge_class($o['status']) ?>"><?= status_label($o['status']) ?></span></td>
          <td><?= date('Y-m-d H:i', strtotime($o['created_at'])) ?></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <?php if ($totalPages > 1): ?>
  <div class="pagination">
    <?php for ($p = 1; $p <= $totalPages; $p++): ?>
      <a class="<?= $p === $page ? 'active' : '' ?>" href="?status=<?= e($statusFilter) ?>&page=<?= $p ?>"><?= $p ?></a>
    <?php endfor; ?>
  </div>
  <?php endif; ?>
  <?php endif; ?>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
