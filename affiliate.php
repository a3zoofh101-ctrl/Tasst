<?php
require_once __DIR__ . '/config/config.php';
$user = require_login($pdo);
$page_title = 'التسويق بالعمولة';
$active = 'affiliate';

$pct = (float)get_setting($pdo, 'affiliate_percent', 5);
$refLink = BASE_URL . '/register.php?ref=' . urlencode($user['referral_code']);

$referredCount = $pdo->prepare('SELECT COUNT(*) FROM users WHERE referred_by = ?');
$referredCount->execute([$user['id']]);
$referredCount = (int)$referredCount->fetchColumn();

$totalEarnings = $pdo->prepare('SELECT COALESCE(SUM(commission_amount),0) FROM affiliate_earnings WHERE referrer_id = ?');
$totalEarnings->execute([$user['id']]);
$totalEarnings = (float)$totalEarnings->fetchColumn();

$stmt = $pdo->prepare('SELECT ae.*, u.name AS referred_name FROM affiliate_earnings ae JOIN users u ON u.id = ae.referred_user_id WHERE ae.referrer_id = ? ORDER BY ae.id DESC LIMIT 50');
$stmt->execute([$user['id']]);
$earnings = $stmt->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<div class="grid grid-3" style="margin-bottom:0;">
  <div class="card stat-card"><div class="stat-icon"><?= icon('users') ?></div><div><div class="stat-value"><?= $referredCount ?></div><div class="stat-label">عدد الإحالات</div></div></div>
  <div class="card stat-card"><div class="stat-icon"><?= icon('cash') ?></div><div><div class="stat-value"><?= format_money($totalEarnings, $pdo) ?></div><div class="stat-label">إجمالي الأرباح</div></div></div>
  <div class="card stat-card"><div class="stat-icon"><?= icon('star') ?></div><div><div class="stat-value"><?= $pct ?>%</div><div class="stat-label">نسبة العمولة</div></div></div>
</div>

<div class="card">
  <div class="card-title"><?= icon('gift') ?> رابط الإحالة الخاص بك</div>
  <p class="help-text">احصل على <?= $pct ?>% عمولة من قيمة كل طلب ينفذه المستخدمون الذين يسجلون عبر رابطك.</p>
  <div class="input-group">
    <input type="text" id="refLinkField" value="<?= e($refLink) ?>" readonly>
    <button type="button" class="btn btn-outline" data-copy="#refLinkField">نسخ الرابط</button>
  </div>
</div>

<div class="card">
  <div class="card-title"><?= icon('history') ?> سجل العمولات</div>
  <?php if (empty($earnings)): ?>
    <div class="empty-state"><?= icon('cash') ?><p>لا توجد عمولات بعد</p></div>
  <?php else: ?>
  <div class="table-wrap">
    <table>
      <thead><tr><th>المستخدم المُحال</th><th>رقم الطلب</th><th>العمولة</th><th>التاريخ</th></tr></thead>
      <tbody>
        <?php foreach ($earnings as $e_): ?>
        <tr>
          <td><?= e($e_['referred_name']) ?></td>
          <td><?= $e_['order_id'] ? '#' . $e_['order_id'] : '-' ?></td>
          <td class="text-success">+<?= format_money($e_['commission_amount'], $pdo) ?></td>
          <td><?= date('Y-m-d H:i', strtotime($e_['created_at'])) ?></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <?php endif; ?>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
