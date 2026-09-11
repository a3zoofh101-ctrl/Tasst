<?php
require_once __DIR__ . '/config/config.php';
$user = require_login($pdo);
$page_title = 'تذاكر الدعم';
$active = 'tickets';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $subject = trim($_POST['subject'] ?? '');
    $message = trim($_POST['message'] ?? '');
    $orderId = (int)($_POST['order_id'] ?? 0) ?: null;

    if (!$subject || !$message) {
        flash('error', 'الرجاء تعبئة الموضوع والرسالة.');
    } else {
        $pdo->beginTransaction();
        $ins = $pdo->prepare('INSERT INTO tickets (user_id, order_id, subject, status) VALUES (?, ?, ?, "open")');
        $ins->execute([$user['id'], $orderId, $subject]);
        $ticketId = $pdo->lastInsertId();
        $msg = $pdo->prepare('INSERT INTO ticket_messages (ticket_id, sender, message) VALUES (?, "user", ?)');
        $msg->execute([$ticketId, $message]);
        $pdo->commit();
        flash('success', 'تم إرسال التذكرة بنجاح.');
        redirect(BASE_URL . '/ticket-view.php?id=' . $ticketId);
    }
    redirect(BASE_URL . '/tickets.php');
}

$stmt = $pdo->prepare('SELECT * FROM tickets WHERE user_id = ? ORDER BY id DESC');
$stmt->execute([$user['id']]);
$tickets = $stmt->fetchAll();

$orders = $pdo->prepare('SELECT id, link FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 50');
$orders->execute([$user['id']]);
$userOrders = $orders->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<div class="grid grid-2" style="align-items:start;">
  <div class="card">
    <div class="card-title"><?= icon('ticket') ?> فتح تذكرة جديدة</div>
    <form method="post" novalidate>
      <?= csrf_field() ?>
      <div class="form-group">
        <label>الموضوع</label>
        <input type="text" name="subject" required>
      </div>
      <div class="form-group">
        <label>مرتبطة بطلب (اختياري)</label>
        <select name="order_id">
          <option value="">-- بدون --</option>
          <?php foreach ($userOrders as $o): ?>
            <option value="<?= $o['id'] ?>">#<?= $o['id'] ?> - <?= e(mb_strimwidth($o['link'], 0, 30, '…')) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="form-group">
        <label>الرسالة</label>
        <textarea name="message" required></textarea>
      </div>
      <button type="submit" class="btn btn-primary btn-block">إرسال التذكرة</button>
    </form>
  </div>

  <div class="card">
    <div class="card-title"><?= icon('list') ?> تذاكري</div>
    <?php if (empty($tickets)): ?>
      <div class="empty-state"><?= icon('ticket') ?><p>لا توجد تذاكر دعم</p></div>
    <?php else: ?>
      <?php foreach ($tickets as $t): ?>
        <a href="<?= BASE_URL ?>/ticket-view.php?id=<?= $t['id'] ?>" class="flex-between" style="padding:12px 0;border-bottom:1px solid var(--border);">
          <div>
            <strong>#<?= $t['id'] ?> <?= e($t['subject']) ?></strong>
            <div class="text-dim" style="font-size:12px;"><?= date('Y-m-d H:i', strtotime($t['created_at'])) ?></div>
          </div>
          <span class="badge <?= status_badge_class($t['status']) ?>"><?= status_label($t['status']) ?></span>
        </a>
      <?php endforeach; ?>
    <?php endif; ?>
  </div>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
