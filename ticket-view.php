<?php
require_once __DIR__ . '/config/config.php';
$user = require_login($pdo);
$page_title = 'تذكرة الدعم';
$active = 'tickets';

$ticketId = (int)($_GET['id'] ?? 0);
$stmt = $pdo->prepare('SELECT * FROM tickets WHERE id = ? AND user_id = ?');
$stmt->execute([$ticketId, $user['id']]);
$ticket = $stmt->fetch();

if (!$ticket) {
    flash('error', 'التذكرة غير موجودة.');
    redirect(BASE_URL . '/tickets.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    if (isset($_POST['close_ticket'])) {
        $pdo->prepare('UPDATE tickets SET status = "closed" WHERE id = ?')->execute([$ticket['id']]);
        flash('success', 'تم إغلاق التذكرة.');
    } else {
        $message = trim($_POST['message'] ?? '');
        if ($message !== '' && $ticket['status'] !== 'closed') {
            $ins = $pdo->prepare('INSERT INTO ticket_messages (ticket_id, sender, message) VALUES (?, "user", ?)');
            $ins->execute([$ticket['id'], $message]);
            $pdo->prepare("UPDATE tickets SET status = 'open', updated_at = NOW() WHERE id = ?")->execute([$ticket['id']]);
            flash('success', 'تم إرسال ردك.');
        }
    }
    redirect(BASE_URL . '/ticket-view.php?id=' . $ticket['id']);
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

  <div class="chat-thread">
    <?php foreach ($messages as $m): ?>
      <div class="chat-bubble <?= $m['sender'] ?>">
        <?= nl2br(e($m['message'])) ?>
        <div class="chat-meta"><?= $m['sender'] === 'admin' ? 'فريق الدعم' : 'أنت' ?> — <?= date('Y-m-d H:i', strtotime($m['created_at'])) ?></div>
      </div>
    <?php endforeach; ?>
  </div>

  <?php if ($ticket['status'] !== 'closed'): ?>
  <form method="post" novalidate>
    <?= csrf_field() ?>
    <div class="form-group">
      <textarea name="message" placeholder="اكتب ردك هنا..." required></textarea>
    </div>
    <div class="flex gap-8">
      <button type="submit" class="btn btn-primary">إرسال الرد</button>
      <button type="submit" name="close_ticket" value="1" class="btn btn-outline" data-confirm="هل تريد إغلاق هذه التذكرة؟">إغلاق التذكرة</button>
    </div>
  </form>
  <?php else: ?>
    <p class="text-dim">تم إغلاق هذه التذكرة.</p>
  <?php endif; ?>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
