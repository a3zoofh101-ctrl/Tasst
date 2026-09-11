<?php
require_once __DIR__ . '/../config/config.php';
$admin = require_admin($pdo);
$page_title = 'التسويق بالعمولة';
$active = 'affiliate';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $pct = (float)($_POST['affiliate_percent'] ?? 0);
    set_setting($pdo, 'affiliate_percent', max(0, min(100, $pct)));
    flash('success', 'تم تحديث نسبة العمولة.');
    redirect(BASE_URL . '/admin/affiliate.php');
}

$pct = (float)get_setting($pdo, 'affiliate_percent', 5);
$topAffiliates = $pdo->query("SELECT u.name, u.email, COUNT(ae.id) AS earning_count, COALESCE(SUM(ae.commission_amount),0) AS total
    FROM affiliate_earnings ae JOIN users u ON u.id = ae.referrer_id GROUP BY ae.referrer_id ORDER BY total DESC LIMIT 20")->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<div class="card">
  <div class="card-title"><?= icon('cash') ?> إعدادات التسويق بالعمولة</div>
  <form method="post" class="input-group">
    <?= csrf_field() ?>
    <input type="number" step="0.1" min="0" max="100" name="affiliate_percent" value="<?= e($pct) ?>">
    <button type="submit" class="btn btn-primary">حفظ نسبة العمولة (%)</button>
  </form>
</div>

<div class="card">
  <div class="card-title"><?= icon('users') ?> أفضل المسوقين</div>
  <?php if (empty($topAffiliates)): ?>
    <p class="text-dim">لا توجد بيانات بعد.</p>
  <?php else: ?>
  <div class="table-wrap">
    <table>
      <thead><tr><th>المستخدم</th><th>عدد العمولات</th><th>إجمالي الأرباح</th></tr></thead>
      <tbody>
        <?php foreach ($topAffiliates as $a): ?>
        <tr><td><?= e($a['name']) ?><br><small class="text-dim"><?= e($a['email']) ?></small></td><td><?= $a['earning_count'] ?></td><td><?= format_money($a['total'], $pdo) ?></td></tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <?php endif; ?>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
