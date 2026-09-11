<?php
require_once __DIR__ . '/../config/config.php';
$admin = require_admin($pdo);
$page_title = 'تذاكر الدعم';
$active = 'tickets';

$statusFilter = $_GET['status'] ?? '';
$where = '';
$params = [];
if ($statusFilter) { $where = 'WHERE t.status = ?'; $params[] = $statusFilter; }

$stmt = $pdo->prepare("SELECT t.*, u.name AS user_name FROM tickets t JOIN users u ON u.id = t.user_id $where ORDER BY t.id DESC LIMIT 200");
$stmt->execute($params);
$tickets = $stmt->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<div class="card">
  <div class="card-title"><?= icon('ticket') ?> تذاكر الدعم</div>
  <div class="tabs">
    <?php foreach (['' => 'الكل', 'open' => 'مفتوحة', 'answered' => 'تم الرد', 'closed' => 'مغلقة'] as $key => $label): ?>
      <a class="tab <?= $statusFilter === $key ? 'active' : '' ?>" href="?status=<?= e($key) ?>"><?= e($label) ?></a>
    <?php endforeach; ?>
  </div>
  <?php if (empty($tickets)): ?>
    <div class="empty-state"><?= icon('ticket') ?><p>لا توجد تذاكر</p></div>
  <?php else: ?>
  <div class="table-wrap">
    <table>
      <thead><tr><th>#</th><th>المستخدم</th><th>الموضوع</th><th>الحالة</th><th>آخر تحديث</th><th></th></tr></thead>
      <tbody>
      <?php foreach ($tickets as $t): ?>
        <tr>
          <td>#<?= $t['id'] ?></td>
          <td><?= e($t['user_name']) ?></td>
          <td><?= e($t['subject']) ?></td>
          <td><span class="badge <?= status_badge_class($t['status']) ?>"><?= status_label($t['status']) ?></span></td>
          <td><?= date('Y-m-d H:i', strtotime($t['updated_at'])) ?></td>
          <td><a href="ticket-view.php?id=<?= $t['id'] ?>" class="btn btn-sm btn-primary">فتح</a></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <?php endif; ?>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
