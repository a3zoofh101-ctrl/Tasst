<?php
require_once __DIR__ . '/../config/config.php';
$admin = require_admin($pdo);
$page_title = 'تذكرة الدعم';
$active = 'tickets';

$ticketId = (int)($_GET['id'] ?? 0);
$stmt = $pdo->prepare('SELECT t.*, u.name AS user_name, u.email AS user_email FROM tickets t JOIN users u ON u.id = t.user_id WHERE t.id = ?');
$stmt->execute([$ticketId]);
$ticket = $stmt->fetch();

if (!$ticket) {
    flash('error', 'التذكرة غير موجودة.');
    redirect(BASE_URL . '/admin/tickets.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    if (isset($_POST['close_ticket'])) {
        $pdo->prepare('UPDATE tickets SET status = "closed" WHERE id = ?')->execute([$ticket['id']]);
        flash('success', 'تم إغلاق التذكرة.');
    } else {
        $message = trim($_POST['message'] ?? '');
        if ($message !== '') {
            $ins = $pdo->prepare('INSERT INTO ticket_messages (ticket_id, sender, message) VALUES (?, "admin", ?)');
            $ins->execute([$ticket['id'], $message]);
            $pdo->prepare("UPDATE tickets SET status = 'answered', updated_at = NOW() WHERE id = ?")->execute([$ticket['id']]);
            flash('success', 'تم إرسال الرد.');
        }
    }
    redirect(BASE_URL . '/admin/ticket-view.php?id=' . $ticket['id']);
}

$msgs = $pdo->prepare('SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY id ASC');
$msgs->execute([$ticket['id']]);
$messages = $msgs->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<div class="card">
  <div class="flex-between" style="margin-bottom:16px;">
    <div class="card-title" style="margin:0;"><?= icon('ticket') ?> #<?= $ticket['id'] ?> - <?= e($ticket['subject']) ?></div>
    <span class="badge <?= status_badge_class($ticket['status']) ?>"><?= status_label($ticket['status']) ?></span>
  </div>
  <p class="text-dim">من: <?= e($ticket['user_name']) ?> (<?= e($ticket['user_email']) ?>)</p>

  <div class="chat-thread">
    <?php foreach ($messages as $m): ?>
      <div class="chat-bubble <?= $m['sender'] ?>">
        <?= nl2br(e($m['message'])) ?>
        <div class="chat-meta"><?= $m['sender'] === 'admin' ? 'الإدارة' : e($ticket['user_name']) ?> — <?= date('Y-m-d H:i', strtotime($m['created_at'])) ?></div>
      </div>
    <?php endforeach; ?>
  </div>

  <?php if ($ticket['status'] !== 'closed'): ?>
  <form method="post" novalidate>
    <?= csrf_field() ?>
    <div class="form-group"><textarea name="message" placeholder="اكتب الرد..." required></textarea></div>
    <div class="flex gap-8">
      <button type="submit" class="btn btn-primary">إرسال الرد</button>
      <button type="submit" name="close_ticket" value="1" class="btn btn-outline" data-confirm="تأكيد إغلاق التذكرة؟">إغلاق التذكرة</button>
    </div>
  </form>
  <?php endif; ?>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
