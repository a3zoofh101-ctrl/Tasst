<?php
require_once __DIR__ . '/../config/config.php';
$admin = require_admin($pdo);
$page_title = 'الاشتراكات';
$active = 'subscriptions';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $id = (int)($_POST['sub_id'] ?? 0);
    $stmt = $pdo->prepare('SELECT sub.*, s.rate_per_1000 FROM subscriptions sub JOIN services s ON s.id = sub.service_id WHERE sub.id = ?');
    $stmt->execute([$id]);
    $sub = $stmt->fetch();

    if ($sub && isset($_POST['run_now'])) {
        $charge = round(((float)$sub['rate_per_1000'] / 1000) * $sub['quantity_per_cycle'], 2);
        try {
            wallet_adjust($pdo, $sub['user_id'], -$charge, 'order', 'اشتراك دوري #' . $sub['id']);
            $ins = $pdo->prepare('INSERT INTO orders (user_id, service_id, link, quantity, charge, status) VALUES (?, ?, ?, ?, ?, "pending")');
            $ins->execute([$sub['user_id'], $sub['service_id'], $sub['link'], $sub['quantity_per_cycle'], $charge]);
            $pdo->prepare('UPDATE subscriptions SET next_run_at = DATE_ADD(CURDATE(), INTERVAL interval_days DAY) WHERE id = ?')->execute([$id]);
            flash('success', 'تم تنفيذ الاشتراك وإنشاء طلب جديد.');
        } catch (Exception $ex) {
            flash('error', 'رصيد المستخدم غير كافٍ لتنفيذ هذا الاشتراك.');
        }
    } elseif ($sub && isset($_POST['cancel'])) {
        $pdo->prepare('UPDATE subscriptions SET status = "canceled" WHERE id = ?')->execute([$id]);
        flash('success', 'تم إلغاء الاشتراك.');
    }
    redirect(BASE_URL . '/admin/subscriptions.php');
}

$subs = $pdo->query('SELECT sub.*, u.name AS user_name, s.name AS service_name FROM subscriptions sub JOIN users u ON u.id = sub.user_id JOIN services s ON s.id = sub.service_id ORDER BY sub.id DESC')->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<div class="card">
  <div class="card-title"><?= icon('refresh') ?> الاشتراكات الدورية</div>
  <?php if (empty($subs)): ?>
    <div class="empty-state"><?= icon('refresh') ?><p>لا توجد اشتراكات</p></div>
  <?php else: ?>
  <div class="table-wrap">
    <table>
      <thead><tr><th>#</th><th>المستخدم</th><th>الخدمة</th><th>الكمية/الدورة</th><th>كل كم يوم</th><th>التشغيل القادم</th><th>الحالة</th><th>إجراءات</th></tr></thead>
      <tbody>
      <?php foreach ($subs as $s): ?>
        <tr>
          <td>#<?= $s['id'] ?></td>
          <td><?= e($s['user_name']) ?></td>
          <td><?= e($s['service_name']) ?></td>
          <td><?= number_format($s['quantity_per_cycle']) ?></td>
          <td><?= $s['interval_days'] ?></td>
          <td><?= $s['next_run_at'] ?></td>
          <td><span class="badge <?= status_badge_class($s['status']) ?>"><?= status_label($s['status']) ?></span></td>
          <td>
            <?php if ($s['status'] === 'active'): ?>
            <form method="post" style="display:inline;"><?= csrf_field() ?><input type="hidden" name="sub_id" value="<?= $s['id'] ?>"><button type="submit" name="run_now" value="1" class="btn btn-sm btn-primary">تشغيل الآن</button></form>
            <form method="post" style="display:inline;"><?= csrf_field() ?><input type="hidden" name="sub_id" value="<?= $s['id'] ?>"><button type="submit" name="cancel" value="1" class="btn btn-sm btn-danger" data-confirm="تأكيد إلغاء الاشتراك؟">إلغاء</button></form>
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
