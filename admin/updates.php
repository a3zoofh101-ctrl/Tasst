<?php
require_once __DIR__ . '/../config/config.php';
$admin = require_admin($pdo);
$page_title = 'التحديثات';
$active = 'updates';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    if (isset($_POST['add'])) {
        $title = trim($_POST['title'] ?? '');
        $body = trim($_POST['body'] ?? '');
        if ($title && $body) {
            $pdo->prepare('INSERT INTO announcements (title, body) VALUES (?, ?)')->execute([$title, $body]);
            flash('success', 'تم نشر التحديث.');
        }
    } elseif (isset($_POST['delete'])) {
        $pdo->prepare('DELETE FROM announcements WHERE id = ?')->execute([(int)$_POST['delete']]);
        flash('success', 'تم حذف التحديث.');
    }
    redirect(BASE_URL . '/admin/updates.php');
}

$announcements = $pdo->query('SELECT * FROM announcements ORDER BY id DESC')->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<div class="card">
  <div class="card-title"><?= icon('edit') ?> نشر تحديث جديد</div>
  <form method="post" novalidate>
    <?= csrf_field() ?>
    <div class="form-group"><label>العنوان</label><input type="text" name="title" required></div>
    <div class="form-group"><label>المحتوى</label><textarea name="body" required></textarea></div>
    <button type="submit" name="add" value="1" class="btn btn-primary btn-block">نشر</button>
  </form>
</div>

<div class="card">
  <div class="card-title"><?= icon('list') ?> التحديثات المنشورة</div>
  <?php foreach ($announcements as $a): ?>
    <div class="flex-between" style="padding:14px 0;border-bottom:1px solid var(--border);align-items:flex-start;">
      <div>
        <strong><?= e($a['title']) ?></strong>
        <p class="text-dim" style="margin:4px 0;"><?= e(mb_strimwidth($a['body'], 0, 120, '…')) ?></p>
        <small class="text-dim"><?= date('Y-m-d H:i', strtotime($a['created_at'])) ?></small>
      </div>
      <form method="post"><?= csrf_field() ?><button type="submit" name="delete" value="<?= $a['id'] ?>" class="btn btn-sm btn-danger" data-confirm="حذف هذا التحديث؟">حذف</button></form>
    </div>
  <?php endforeach; ?>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
