<?php
require_once __DIR__ . '/config/config.php';
$user = require_login($pdo);
$page_title = 'التحديثات';
$active = 'updates';

$announcements = $pdo->query('SELECT * FROM announcements ORDER BY id DESC')->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<div class="card">
  <div class="card-title"><?= icon('edit') ?> آخر التحديثات والإعلانات</div>
  <?php if (empty($announcements)): ?>
    <div class="empty-state"><?= icon('edit') ?><p>لا توجد تحديثات حالياً</p></div>
  <?php else: ?>
    <?php foreach ($announcements as $a): ?>
      <div style="padding:16px 0;border-bottom:1px solid var(--border);">
        <div class="flex-between">
          <strong style="font-size:16px;"><?= e($a['title']) ?></strong>
          <span class="text-dim" style="font-size:12px;"><?= date('Y-m-d', strtotime($a['created_at'])) ?></span>
        </div>
        <p style="margin-top:8px;white-space:pre-wrap;"><?= e($a['body']) ?></p>
      </div>
    <?php endforeach; ?>
  <?php endif; ?>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
