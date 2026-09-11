<?php
require_once __DIR__ . '/config/config.php';
$user = require_login($pdo);
$page_title = 'نقاطي';
$active = 'points';

define('POINTS_PER_CURRENCY_REDEEM', 100); // 100 points = 1 currency unit when redeeming

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $points = (int)($_POST['redeem_points'] ?? 0);
    if ($points < POINTS_PER_CURRENCY_REDEEM) {
        flash('error', 'الحد الأدنى للاستبدال هو ' . POINTS_PER_CURRENCY_REDEEM . ' نقطة.');
    } elseif ($points > (int)$user['points']) {
        flash('error', 'نقاطك غير كافية.');
    } else {
        $value = round($points / POINTS_PER_CURRENCY_REDEEM, 2);
        try {
            points_adjust($pdo, $user['id'], $points, 'redeem', 'استبدال رصيد');
            wallet_adjust($pdo, $user['id'], $value, 'admin_adjust', 'استبدال ' . $points . ' نقطة برصيد');
            flash('success', 'تم استبدال ' . $points . ' نقطة بـ ' . format_money($value, $pdo) . ' في محفظتك.');
        } catch (Exception $ex) {
            flash('error', 'حدث خطأ أثناء عملية الاستبدال.');
        }
    }
    redirect(BASE_URL . '/points.php');
}

$stmt = $pdo->prepare('SELECT * FROM points_log WHERE user_id = ? ORDER BY id DESC LIMIT 50');
$stmt->execute([$user['id']]);
$log = $stmt->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<div class="grid grid-2" style="align-items:start;">
  <div class="card">
    <div class="card-title"><?= icon('star') ?> رصيد نقاطي</div>
    <div class="stat-card" style="margin-bottom:18px;">
      <div class="stat-icon"><?= icon('star') ?></div>
      <div><div class="stat-value"><?= (int)$user['points'] ?> نقطة</div><div class="stat-label">تكسب نقطة عن كل عملية شراء</div></div>
    </div>
    <form method="post" novalidate>
      <?= csrf_field() ?>
      <div class="form-group">
        <label>عدد النقاط للاستبدال (كل <?= POINTS_PER_CURRENCY_REDEEM ?> نقطة = <?= format_money(1, $pdo) ?>)</label>
        <input type="number" name="redeem_points" min="<?= POINTS_PER_CURRENCY_REDEEM ?>" step="<?= POINTS_PER_CURRENCY_REDEEM ?>" required>
      </div>
      <button type="submit" class="btn btn-primary btn-block">استبدال النقاط برصيد</button>
    </form>
  </div>

  <div class="card">
    <div class="card-title"><?= icon('history') ?> سجل النقاط</div>
    <?php if (empty($log)): ?>
      <p class="text-dim">لا يوجد سجل نقاط بعد.</p>
    <?php else: ?>
      <div class="table-wrap">
        <table>
          <thead><tr><th>النوع</th><th>النقاط</th><th>المرجع</th><th>التاريخ</th></tr></thead>
          <tbody>
          <?php foreach ($log as $l): ?>
            <tr>
              <td><?= $l['type'] === 'earn' ? '<span class="text-success">اكتساب</span>' : '<span class="text-danger">استبدال</span>' ?></td>
              <td><?= $l['type'] === 'earn' ? '+' : '-' ?><?= (int)$l['points'] ?></td>
              <td><?= e($l['reference']) ?></td>
              <td><?= date('Y-m-d H:i', strtotime($l['created_at'])) ?></td>
            </tr>
          <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php endif; ?>
  </div>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
