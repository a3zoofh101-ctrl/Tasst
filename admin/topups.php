<?php
require_once __DIR__ . '/../config/config.php';
$admin = require_admin($pdo);
$page_title = 'الشحن والمدفوعات';
$active = 'topups';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $topupId = (int)($_POST['topup_id'] ?? 0);
    $stmt = $pdo->prepare('SELECT * FROM topups WHERE id = ?');
    $stmt->execute([$topupId]);
    $topup = $stmt->fetch();

    if ($topup && isset($_POST['confirm_manual']) && $topup['status'] !== 'paid') {
        try {
            $pdo->prepare('UPDATE topups SET status = "paid", paid_at = NOW() WHERE id = ?')->execute([$topupId]);
            wallet_adjust($pdo, $topup['user_id'], (float)$topup['amount'], 'topup', 'تأكيد شحن يدوي من الإدارة #' . $topupId);
            flash('success', 'تم تأكيد عملية الشحن وإضافة الرصيد.');
        } catch (Exception $ex) {
            flash('error', 'حدث خطأ: ' . $ex->getMessage());
        }
    } elseif ($topup && isset($_POST['mark_failed']) && $topup['status'] !== 'paid') {
        $pdo->prepare('UPDATE topups SET status = "failed" WHERE id = ?')->execute([$topupId]);
        flash('success', 'تم تحديث حالة العملية إلى فشل.');
    }
    redirect(BASE_URL . '/admin/topups.php');
}

$statusFilter = $_GET['status'] ?? '';
$where = '';
$params = [];
if ($statusFilter) { $where = 'WHERE t.status = ?'; $params[] = $statusFilter; }

$stmt = $pdo->prepare("SELECT t.*, u.name AS user_name, u.email AS user_email FROM topups t JOIN users u ON u.id = t.user_id $where ORDER BY t.id DESC LIMIT 200");
$stmt->execute($params);
$topups = $stmt->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<div class="card">
  <div class="card-title"><?= icon('wallet') ?> عمليات الشحن (Moyasar)</div>
  <div class="tabs">
    <?php foreach (['' => 'الكل', 'pending' => 'معلقة', 'paid' => 'مدفوعة', 'failed' => 'فاشلة'] as $key => $label): ?>
      <a class="tab <?= $statusFilter === $key ? 'active' : '' ?>" href="?status=<?= e($key) ?>"><?= e($label) ?></a>
    <?php endforeach; ?>
  </div>
  <div class="table-wrap">
    <table>
      <thead><tr><th>#</th><th>المستخدم</th><th>المبلغ</th><th>مرجع الدفع</th><th>الحالة</th><th>التاريخ</th><th>إجراءات</th></tr></thead>
      <tbody>
      <?php foreach ($topups as $t): ?>
        <tr>
          <td>#<?= $t['id'] ?></td>
          <td><?= e($t['user_name']) ?><br><small class="text-dim"><?= e($t['user_email']) ?></small></td>
          <td><?= format_money($t['amount'], $pdo) ?></td>
          <td><?= e($t['moyasar_invoice_id'] ?: '-') ?></td>
          <td><span class="badge <?= status_badge_class($t['status']) ?>"><?= status_label($t['status']) ?></span></td>
          <td><?= date('Y-m-d H:i', strtotime($t['created_at'])) ?></td>
          <td>
            <?php if ($t['status'] !== 'paid'): ?>
            <form method="post" style="display:inline;" data-confirm="تأكيد شحن رصيد المستخدم يدوياً؟">
              <?= csrf_field() ?>
              <input type="hidden" name="topup_id" value="<?= $t['id'] ?>">
              <button type="submit" name="confirm_manual" value="1" class="btn btn-sm btn-success">تأكيد يدوي</button>
            </form>
            <form method="post" style="display:inline;">
              <?= csrf_field() ?>
              <input type="hidden" name="topup_id" value="<?= $t['id'] ?>">
              <button type="submit" name="mark_failed" value="1" class="btn btn-sm btn-danger">فشل</button>
            </form>
            <?php else: ?>—<?php endif; ?>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
