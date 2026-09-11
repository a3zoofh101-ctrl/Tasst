<?php
require_once __DIR__ . '/config/config.php';
$user = require_login($pdo);
$page_title = 'الدفعات المرسلة';
$active = 'payments';

$perPage = 20;
$page = max(1, (int)($_GET['page'] ?? 1));
$offset = ($page - 1) * $perPage;

$countStmt = $pdo->prepare('SELECT COUNT(*) FROM topups WHERE user_id = ?');
$countStmt->execute([$user['id']]);
$total = (int)$countStmt->fetchColumn();
$totalPages = max(1, (int)ceil($total / $perPage));

$stmt = $pdo->prepare("SELECT * FROM topups WHERE user_id = ? ORDER BY id DESC LIMIT $perPage OFFSET $offset");
$stmt->execute([$user['id']]);
$payments = $stmt->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<div class="card">
  <div class="card-title"><?= icon('droplet') ?> الدفعات المرسلة</div>
  <?php if (empty($payments)): ?>
    <div class="empty-state"><?= icon('droplet') ?><p>لا توجد دفعات مرسلة</p><a href="<?= BASE_URL ?>/topup.php" class="btn btn-primary">شحن الرصيد</a></div>
  <?php else: ?>
  <div class="table-wrap">
    <table>
      <thead><tr><th>#</th><th>المبلغ</th><th>الطريقة</th><th>مرجع الدفع</th><th>الحالة</th><th>التاريخ</th></tr></thead>
      <tbody>
        <?php foreach ($payments as $p): ?>
        <tr>
          <td>#<?= $p['id'] ?></td>
          <td><?= format_money($p['amount'], $pdo) ?></td>
          <td>Moyasar</td>
          <td><?= e($p['moyasar_invoice_id'] ?: '-') ?></td>
          <td><span class="badge <?= status_badge_class($p['status']) ?>"><?= status_label($p['status']) ?></span></td>
          <td><?= date('Y-m-d H:i', strtotime($p['created_at'])) ?></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <?php if ($totalPages > 1): ?>
  <div class="pagination">
    <?php for ($p = 1; $p <= $totalPages; $p++): ?><a class="<?= $p === $page ? 'active' : '' ?>" href="?page=<?= $p ?>"><?= $p ?></a><?php endfor; ?>
  </div>
  <?php endif; ?>
  <?php endif; ?>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
