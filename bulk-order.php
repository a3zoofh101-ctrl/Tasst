<?php
require_once __DIR__ . '/config/config.php';
$user = require_login($pdo);
$page_title = 'طلبات جماعية';
$active = 'bulk';

$services = $pdo->query("SELECT s.*, c.name AS category_name FROM services s JOIN categories c ON c.id = s.category_id WHERE s.status = 'active' ORDER BY c.sort_order, s.sort_order")->fetchAll();
$servicesById = [];
foreach ($services as $s) { $servicesById[$s['id']] = $s; }

$preview = [];
$rawInput = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $rawInput = trim($_POST['bulk_data'] ?? '');
    $lines = array_filter(array_map('trim', explode("\n", $rawInput)));
    $rows = [];
    $totalCharge = 0;
    $errors = [];

    foreach ($lines as $i => $line) {
        $parts = array_map('trim', explode('|', $line));
        if (count($parts) < 3) {
            $errors[] = 'السطر ' . ($i + 1) . ': صيغة غير صحيحة (يجب: رقم_الخدمة|الرابط|الكمية)';
            continue;
        }
        [$sid, $link, $qty] = $parts;
        $sid = (int)$sid;
        $qty = (int)$qty;
        $svc = $servicesById[$sid] ?? null;
        if (!$svc) {
            $errors[] = 'السطر ' . ($i + 1) . ': رقم الخدمة #' . $sid . ' غير موجود';
            continue;
        }
        if (!$link) {
            $errors[] = 'السطر ' . ($i + 1) . ': الرابط مفقود';
            continue;
        }
        if ($qty < (int)$svc['min_qty'] || $qty > (int)$svc['max_qty']) {
            $errors[] = 'السطر ' . ($i + 1) . ': الكمية خارج النطاق المسموح (' . $svc['min_qty'] . ' - ' . $svc['max_qty'] . ')';
            continue;
        }
        $charge = round(((float)$svc['rate_per_1000'] / 1000) * $qty, 2);
        $totalCharge += $charge;
        $rows[] = ['service' => $svc, 'link' => $link, 'quantity' => $qty, 'charge' => $charge];
    }

    if (isset($_POST['confirm']) && empty($errors) && !empty($rows)) {
        if ((float)$user['balance'] < $totalCharge) {
            flash('error', 'رصيدك غير كافٍ لتنفيذ جميع الطلبات (الإجمالي: ' . format_money($totalCharge, $pdo) . ').');
        } else {
            $batchId = bin2hex(random_bytes(8));
            try {
                wallet_adjust($pdo, $user['id'], -$totalCharge, 'order', 'طلبات جماعية (' . count($rows) . ' طلب)');
                $ins = $pdo->prepare('INSERT INTO orders (user_id, service_id, link, quantity, charge, status, bulk_batch_id) VALUES (?, ?, ?, ?, ?, "pending", ?)');
                foreach ($rows as $r) {
                    $ins->execute([$user['id'], $r['service']['id'], $r['link'], $r['quantity'], $r['charge'], $batchId]);
                }
                $pointsRate = (float)get_setting($pdo, 'points_per_currency', 1);
                if ($pointsRate > 0) {
                    points_adjust($pdo, $user['id'], (int)floor($totalCharge * $pointsRate), 'earn', 'bulk#' . $batchId);
                }
                flash('success', 'تم تنفيذ ' . count($rows) . ' طلب بنجاح.');
                redirect(BASE_URL . '/orders.php');
            } catch (Exception $ex) {
                flash('error', 'حدث خطأ أثناء تنفيذ الطلبات الجماعية.');
                redirect(BASE_URL . '/bulk-order.php');
            }
        }
    }

    $preview = ['rows' => $rows, 'errors' => $errors, 'total' => $totalCharge];
}

include __DIR__ . '/includes/header.php';
?>
<div class="card">
  <div class="card-title"><?= icon('layers') ?> طلبات جماعية</div>
  <p class="help-text">أدخل كل طلب في سطر منفصل بالصيغة التالية: <code>رقم_الخدمة|الرابط|الكمية</code><br>مثال: <code>1|https://instagram.com/user1|1000</code></p>
  <form method="post" novalidate>
    <?= csrf_field() ?>
    <div class="form-group">
      <label>بيانات الطلبات</label>
      <textarea name="bulk_data" rows="8" placeholder="1|https://instagram.com/user1|1000&#10;2|https://instagram.com/user2|500" required><?= e($rawInput) ?></textarea>
    </div>
    <div class="flex gap-8">
      <button type="submit" name="preview" value="1" class="btn btn-outline">معاينة الطلبات</button>
      <?php if (!empty($preview['rows']) && empty($preview['errors'])): ?>
        <button type="submit" name="confirm" value="1" class="btn btn-primary">تأكيد وتنفيذ الطلبات (الإجمالي: <?= format_money($preview['total'], $pdo) ?>)</button>
      <?php endif; ?>
    </div>
  </form>
</div>

<?php if (!empty($preview['errors'])): ?>
<div class="card">
  <div class="card-title text-danger">أخطاء في البيانات</div>
  <ul>
    <?php foreach ($preview['errors'] as $err): ?><li class="text-danger"><?= e($err) ?></li><?php endforeach; ?>
  </ul>
</div>
<?php endif; ?>

<?php if (!empty($preview['rows'])): ?>
<div class="card">
  <div class="card-title">معاينة (<?= count($preview['rows']) ?> طلب)</div>
  <div class="table-wrap">
    <table>
      <thead><tr><th>الخدمة</th><th>الرابط</th><th>الكمية</th><th>السعر</th></tr></thead>
      <tbody>
        <?php foreach ($preview['rows'] as $r): ?>
        <tr>
          <td><?= e($r['service']['name']) ?></td>
          <td class="wrap"><?= e($r['link']) ?></td>
          <td><?= number_format($r['quantity']) ?></td>
          <td><?= format_money($r['charge'], $pdo) ?></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php endif; ?>

<?php include __DIR__ . '/includes/footer.php'; ?>
