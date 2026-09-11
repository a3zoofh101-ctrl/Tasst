<?php
require_once __DIR__ . '/config/config.php';
$user = require_login($pdo);
$page_title = 'قائمة الخدمات';
$active = 'services';

$categories = $pdo->query("SELECT * FROM categories WHERE status = 'active' ORDER BY sort_order")->fetchAll();
$services = $pdo->query("SELECT * FROM services WHERE status = 'active' ORDER BY category_id, sort_order")->fetchAll();
$byCategory = [];
foreach ($services as $s) { $byCategory[$s['category_id']][] = $s; }

include __DIR__ . '/includes/header.php';
?>
<div class="card">
  <div class="card-title"><?= icon('list') ?> قائمة الخدمات والأسعار</div>
  <?php foreach ($categories as $cat): if (empty($byCategory[$cat['id']])) continue; ?>
    <h3 style="margin-top:22px;color:var(--accent-2);"><?= e($cat['name']) ?></h3>
    <div class="table-wrap">
      <table>
        <thead><tr><th>#</th><th>اسم الخدمة</th><th>السعر لكل 1000</th><th>الحد الأدنى</th><th>الحد الأقصى</th><th></th></tr></thead>
        <tbody>
          <?php foreach ($byCategory[$cat['id']] as $s): ?>
          <tr>
            <td>#<?= $s['id'] ?></td>
            <td class="wrap"><?= e($s['name']) ?><br><small class="text-dim"><?= e($s['description']) ?></small></td>
            <td><?= number_format($s['rate_per_1000'], 2) ?> <?= e(get_setting($pdo, 'currency_symbol')) ?></td>
            <td><?= number_format($s['min_qty']) ?></td>
            <td><?= number_format($s['max_qty']) ?></td>
            <td><a href="<?= BASE_URL ?>/dashboard.php" class="btn btn-sm btn-primary">اطلب الآن</a></td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endforeach; ?>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
