<?php
require_once __DIR__ . '/config/config.php';
$user = require_login($pdo);
$page_title = 'سجل الإسترجاع';
$active = 'refunds';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $orderId = (int)($_POST['order_id'] ?? 0);
    $reason = trim($_POST['reason'] ?? '');

    $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?");
    $stmt->execute([$orderId, $user['id']]);
    $order = $stmt->fetch();

    if (!$order) {
        flash('error', 'الطلب غير موجود.');
    } elseif (!in_array($order['status'], ['pending', 'in_progress', 'partial', 'canceled'], true)) {
        flash('error', 'لا يمكن طلب استرجاع لهذا الطلب.');
    } elseif (!$reason) {
        flash('error', 'الرجاء ذكر سبب الاسترجاع.');
    } else {
        $existing = $pdo->prepare("SELECT id FROM refunds WHERE order_id = ? AND status = 'pending'");
        $existing->execute([$orderId]);
        if ($existing->fetch()) {
            flash('error', 'يوجد طلب استرجاع قيد المراجعة لهذا الطلب بالفعل.');
        } else {
            $ins = $pdo->prepare('INSERT INTO refunds (order_id, user_id, amount, reason, status) VALUES (?, ?, ?, ?, "pending")');
            $ins->execute([$orderId, $user['id'], $order['charge'], $reason]);
            flash('success', 'تم إرسال طلب الاسترجاع، سيتم مراجعته من قبل الإدارة.');
        }
    }
    redirect(BASE_URL . '/refunds.php');
}

$eligible = $pdo->prepare("SELECT id, link, charge FROM orders WHERE user_id = ? AND status IN ('pending','in_progress','partial','canceled') ORDER BY id DESC LIMIT 50");
$eligible->execute([$user['id']]);
$eligibleOrders = $eligible->fetchAll();

$stmt = $pdo->prepare('SELECT r.*, o.link FROM refunds r JOIN orders o ON o.id = r.order_id WHERE r.user_id = ? ORDER BY r.id DESC');
$stmt->execute([$user['id']]);
$refunds = $stmt->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<div class="grid grid-2" style="align-items:start;">
  <div class="card">
    <div class="card-title"><?= icon('file') ?> طلب استرجاع جديد</div>
    <?php if (empty($eligibleOrders)): ?>
      <p class="text-dim">لا توجد طلبات مؤهلة للاسترجاع حالياً.</p>
    <?php else: ?>
    <form method="post" novalidate>
      <?= csrf_field() ?>
      <div class="form-group">
        <label>الطلب</label>
        <select name="order_id" required>
          <?php foreach ($eligibleOrders as $o): ?>
            <option value="<?= $o['id'] ?>">#<?= $o['id'] ?> - <?= e(mb_strimwidth($o['link'], 0, 35, '…')) ?> (<?= format_money($o['charge'], $pdo) ?>)</option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="form-group">
        <label>سبب الاسترجاع</label>
        <textarea name="reason" required></textarea>
      </div>
      <button type="submit" class="btn btn-primary btn-block">إرسال الطلب</button>
    </form>
    <?php endif; ?>
  </div>

  <div class="card">
    <div class="card-title"><?= icon('history') ?> سجل طلبات الاسترجاع</div>
    <?php if (empty($refunds)): ?>
      <div class="empty-state"><?= icon('file') ?><p>لا توجد طلبات استرجاع</p></div>
    <?php else: ?>
      <div class="table-wrap">
        <table>
          <thead><tr><th>الطلب</th><th>المبلغ</th><th>الحالة</th><th>التاريخ</th></tr></thead>
          <tbody>
          <?php foreach ($refunds as $r): ?>
            <tr>
              <td>#<?= $r['order_id'] ?></td>
              <td><?= format_money($r['amount'], $pdo) ?></td>
              <td><span class="badge <?= status_badge_class($r['status']) ?>"><?= status_label($r['status']) ?></span></td>
              <td><?= date('Y-m-d', strtotime($r['created_at'])) ?></td>
            </tr>
          <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php endif; ?>
  </div>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
