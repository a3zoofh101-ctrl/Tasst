<?php
require_once __DIR__ . '/config/config.php';
$user = require_login($pdo);
$page_title = 'الاشتراكات';
$active = 'subscriptions';

$services = $pdo->query("SELECT * FROM services WHERE status = 'active' ORDER BY name")->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    if (isset($_POST['create'])) {
        $serviceId = (int)($_POST['service_id'] ?? 0);
        $link = trim($_POST['link'] ?? '');
        $qty = (int)($_POST['quantity_per_cycle'] ?? 0);
        $interval = max(1, (int)($_POST['interval_days'] ?? 1));

        $svc = null;
        foreach ($services as $s) if ((int)$s['id'] === $serviceId) $svc = $s;

        if (!$svc || !$link || $qty < (int)($svc['min_qty'] ?? 1)) {
            flash('error', 'الرجاء التحقق من بيانات الاشتراك.');
        } else {
            $ins = $pdo->prepare('INSERT INTO subscriptions (user_id, service_id, link, quantity_per_cycle, interval_days, next_run_at, status) VALUES (?, ?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL ? DAY), "active")');
            $ins->execute([$user['id'], $svc['id'], $link, $qty, $interval, $interval]);
            flash('success', 'تم إنشاء الاشتراك بنجاح.');
        }
    } elseif (isset($_POST['toggle'])) {
        $id = (int)$_POST['toggle'];
        $stmt = $pdo->prepare('SELECT status FROM subscriptions WHERE id = ? AND user_id = ?');
        $stmt->execute([$id, $user['id']]);
        $cur = $stmt->fetchColumn();
        if ($cur) {
            $new = $cur === 'active' ? 'paused' : 'active';
            $pdo->prepare('UPDATE subscriptions SET status = ? WHERE id = ? AND user_id = ?')->execute([$new, $id, $user['id']]);
            flash('success', 'تم تحديث حالة الاشتراك.');
        }
    } elseif (isset($_POST['cancel'])) {
        $id = (int)$_POST['cancel'];
        $pdo->prepare('UPDATE subscriptions SET status = "canceled" WHERE id = ? AND user_id = ?')->execute([$id, $user['id']]);
        flash('success', 'تم إلغاء الاشتراك.');
    }
    redirect(BASE_URL . '/subscriptions.php');
}

$stmt = $pdo->prepare('SELECT sub.*, s.name AS service_name FROM subscriptions sub JOIN services s ON s.id = sub.service_id WHERE sub.user_id = ? ORDER BY sub.id DESC');
$stmt->execute([$user['id']]);
$subscriptions = $stmt->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<div class="grid grid-2" style="align-items:start;">
  <div class="card">
    <div class="card-title"><?= icon('refresh') ?> إنشاء اشتراك دوري</div>
    <p class="help-text">يقوم الاشتراك بإرسال طلب جديد تلقائياً بشكل دوري (يتم تنفيذها بواسطة فريق الإدارة).</p>
    <form method="post" novalidate>
      <?= csrf_field() ?>
      <div class="form-group">
        <label>الخدمة</label>
        <select name="service_id" required>
          <?php foreach ($services as $s): ?><option value="<?= $s['id'] ?>"><?= e($s['name']) ?></option><?php endforeach; ?>
        </select>
      </div>
      <div class="form-group">
        <label>الرابط</label>
        <input type="text" name="link" required>
      </div>
      <div class="form-group">
        <label>الكمية في كل دورة</label>
        <input type="number" name="quantity_per_cycle" min="1" required>
      </div>
      <div class="form-group">
        <label>كل كم يوم</label>
        <input type="number" name="interval_days" min="1" value="1" required>
      </div>
      <button type="submit" name="create" value="1" class="btn btn-primary btn-block">إنشاء الاشتراك</button>
    </form>
  </div>

  <div class="card">
    <div class="card-title"><?= icon('list') ?> اشتراكاتي</div>
    <?php if (empty($subscriptions)): ?>
      <div class="empty-state"><?= icon('refresh') ?><p>لا توجد اشتراكات</p></div>
    <?php else: ?>
      <?php foreach ($subscriptions as $s): ?>
      <div style="padding:12px 0;border-bottom:1px solid var(--border);">
        <div class="flex-between">
          <strong><?= e($s['service_name']) ?></strong>
          <span class="badge <?= status_badge_class($s['status']) ?>"><?= status_label($s['status']) ?></span>
        </div>
        <div class="text-dim" style="font-size:12.5px;margin:4px 0;"><?= e(mb_strimwidth($s['link'], 0, 40, '…')) ?> — <?= number_format($s['quantity_per_cycle']) ?> كل <?= $s['interval_days'] ?> يوم</div>
        <?php if ($s['status'] !== 'canceled'): ?>
        <form method="post" class="flex gap-8" style="margin-top:6px;">
          <?= csrf_field() ?>
          <button type="submit" name="toggle" value="<?= $s['id'] ?>" class="btn btn-sm btn-outline"><?= $s['status'] === 'active' ? 'إيقاف' : 'تفعيل' ?></button>
          <button type="submit" name="cancel" value="<?= $s['id'] ?>" class="btn btn-sm btn-danger" data-confirm="هل تريد إلغاء هذا الاشتراك؟">إلغاء</button>
        </form>
        <?php endif; ?>
      </div>
      <?php endforeach; ?>
    <?php endif; ?>
  </div>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
