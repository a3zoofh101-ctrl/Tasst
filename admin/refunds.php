<?php
require_once __DIR__ . '/../config/config.php';
$admin = require_admin($pdo);
$page_title = 'الاسترجاعات';
$active = 'refunds';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $refundId = (int)($_POST['refund_id'] ?? 0);
    $stmt = $pdo->prepare('SELECT * FROM refunds WHERE id = ?');
    $stmt->execute([$refundId]);
    $refund = $stmt->fetch();

    if ($refund && $refund['status'] === 'pending') {
        if (isset($_POST['approve'])) {
            try {
                wallet_adjust($pdo, $refund['user_id'], (float)$refund['amount'], 'refund', 'استرجاع طلب #' . $refund['order_id']);
                $pdo->prepare('UPDATE refunds SET status = "approved", resolved_at = NOW() WHERE id = ?')->execute([$refundId]);
                $pdo->prepare('UPDATE orders SET status = "refunded" WHERE id = ?')->execute([$refund['order_id']]);
                flash('success', 'تمت الموافقة على الاسترجاع وإعادة المبلغ للمحفظة.');
            } catch (Exception $ex) {
                flash('error', 'حدث خطأ: ' . $ex->getMessage());
            }
        } elseif (isset($_POST['reject'])) {
            $pdo->prepare('UPDATE refunds SET status = "rejected", resolved_at = NOW() WHERE id = ?')->execute([$refundId]);
            flash('success', 'تم رفض طلب الاسترجاع.');
        }
    }
    redirect(BASE_URL . '/admin/refunds.php');
}

$statusFilter = $_GET['status'] ?? '';
$where = '';
$params = [];
if ($statusFilter) { $where = 'WHERE r.status = ?'; $params[] = $statusFilter; }
$stmt = $pdo->prepare("SELECT r.*, u.name AS user_name, o.link FROM refunds r JOIN users u ON u.id = r.user_id JOIN orders o ON o.id = r.order_id $where ORDER BY r.id DESC LIMIT 200");
$stmt->execute($params);
$refunds = $stmt->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<div class="card">
  <div class="card-title"><?= icon('file') ?> طلبات الاسترجاع</div>
  <div class="tabs">
    <?php foreach (['' => 'الكل', 'pending' => 'معلقة', 'approved' => 'موافق عليها', 'rejected' => 'مرفوضة'] as $key => $label): ?>
      <a class="tab <?= $statusFilter === $key ? 'active' : '' ?>" href="?status=<?= e($key) ?>"><?= e($label) ?></a>
    <?php endforeach; ?>
  </div>
  <?php if (empty($refunds)): ?>
    <div class="empty-state"><?= icon('file') ?><p>لا توجد طلبات استرجاع</p></div>
  <?php else: ?>
  <div class="table-wrap">
    <table>
      <thead><tr><th>#</th><th>المستخدم</th><th>الطلب</th><th>المبلغ</th><th>السبب</th><th>الحالة</th><th>إجراءات</th></tr></thead>
      <tbody>
      <?php foreach ($refunds as $r): ?>
        <tr>
          <td>#<?= $r['id'] ?></td>
          <td><?= e($r['user_name']) ?></td>
          <td>#<?= $r['order_id'] ?> <br><small class="text-dim"><?= e(mb_strimwidth($r['link'], 0, 30, '…')) ?></small></td>
          <td><?= format_money($r['amount'], $pdo) ?></td>
          <td class="wrap"><?= e($r['reason']) ?></td>
          <td><span class="badge <?= status_badge_class($r['status']) ?>"><?= status_label($r['status']) ?></span></td>
          <td>
            <?php if ($r['status'] === 'pending'): ?>
            <form method="post" style="display:inline;"><?= csrf_field() ?><input type="hidden" name="refund_id" value="<?= $r['id'] ?>"><button type="submit" name="approve" value="1" class="btn btn-sm btn-success">موافقة</button></form>
            <form method="post" style="display:inline;"><?= csrf_field() ?><input type="hidden" name="refund_id" value="<?= $r['id'] ?>"><button type="submit" name="reject" value="1" class="btn btn-sm btn-danger">رفض</button></form>
            <?php else: ?>—<?php endif; ?>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <?php endif; ?>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
