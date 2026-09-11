<?php
require_once __DIR__ . '/config/config.php';
$user = require_login($pdo);
$page_title = 'طلب جديد';
$active = 'dashboard';

$categories = $pdo->query("SELECT * FROM categories WHERE status = 'active' ORDER BY sort_order")->fetchAll();
$services = $pdo->query("SELECT s.*, c.name AS category_name FROM services s JOIN categories c ON c.id = s.category_id WHERE s.status = 'active' ORDER BY c.sort_order, s.sort_order")->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $serviceId = (int)($_POST['service_id'] ?? 0);
    $link = trim($_POST['link'] ?? '');
    $quantity = (int)($_POST['quantity'] ?? 0);

    $svc = null;
    foreach ($services as $s) {
        if ((int)$s['id'] === $serviceId) { $svc = $s; break; }
    }

    if (!$svc) {
        flash('error', 'الرجاء اختيار خدمة صحيحة.');
    } elseif (!$link) {
        flash('error', 'الرجاء إدخال الرابط.');
    } elseif ($quantity < (int)$svc['min_qty'] || $quantity > (int)$svc['max_qty']) {
        flash('error', 'الكمية يجب أن تكون بين ' . $svc['min_qty'] . ' و ' . $svc['max_qty'] . '.');
    } else {
        $charge = round(((float)$svc['rate_per_1000'] / 1000) * $quantity, 2);
        if ((float)$user['balance'] < $charge) {
            flash('error', 'رصيدك غير كافٍ لتنفيذ هذا الطلب. الرجاء شحن رصيدك أولاً.');
        } else {
            try {
                wallet_adjust($pdo, $user['id'], -$charge, 'order', 'طلب خدمة: ' . $svc['name']);
                $ins = $pdo->prepare('INSERT INTO orders (user_id, service_id, link, quantity, charge, status) VALUES (?, ?, ?, ?, ?, "pending")');
                $ins->execute([$user['id'], $svc['id'], $link, $quantity, $charge]);
                $orderId = $pdo->lastInsertId();

                $pointsRate = (float)get_setting($pdo, 'points_per_currency', 1);
                if ($pointsRate > 0) {
                    points_adjust($pdo, $user['id'], (int)floor($charge * $pointsRate), 'earn', 'order#' . $orderId);
                }

                if (!empty($user['referred_by'])) {
                    $pct = (float)get_setting($pdo, 'affiliate_percent', 0);
                    if ($pct > 0) {
                        $commission = round($charge * $pct / 100, 2);
                        if ($commission > 0) {
                            wallet_adjust($pdo, $user['referred_by'], $commission, 'referral_bonus', 'عمولة إحالة من طلب #' . $orderId);
                            $aff = $pdo->prepare('INSERT INTO affiliate_earnings (referrer_id, referred_user_id, order_id, commission_amount) VALUES (?, ?, ?, ?)');
                            $aff->execute([$user['referred_by'], $user['id'], $orderId, $commission]);
                        }
                    }
                }

                flash('success', 'تم إرسال طلبك بنجاح، رقم الطلب #' . $orderId);
                redirect(BASE_URL . '/orders.php');
            } catch (Exception $ex) {
                flash('error', 'حدث خطأ أثناء تنفيذ الطلب. حاول مرة أخرى.');
            }
        }
        redirect(BASE_URL . '/dashboard.php');
    }
}

include __DIR__ . '/includes/header.php';
?>
<div class="grid grid-2" style="align-items:start;">
  <div class="card">
    <div class="card-title"><?= icon('cart') ?> إنشاء طلب جديد</div>
    <form method="post" novalidate>
      <?= csrf_field() ?>
      <div class="form-group">
        <label>الخدمة</label>
        <select name="service_id" id="service_id" required>
          <option value="">-- اختر الخدمة --</option>
          <?php $currentCat = null; foreach ($services as $s): if ($currentCat !== $s['category_name']) { if ($currentCat !== null) echo '</optgroup>'; echo '<optgroup label="' . e($s['category_name']) . '">'; $currentCat = $s['category_name']; } ?>
            <option value="<?= $s['id'] ?>"
              data-rate="<?= $s['rate_per_1000'] ?>"
              data-min="<?= $s['min_qty'] ?>"
              data-max="<?= $s['max_qty'] ?>"
              data-desc="<?= e($s['description']) ?>">
              #<?= $s['id'] ?> - <?= e($s['name']) ?> (<?= number_format($s['rate_per_1000'], 2) ?> <?= e(get_setting($pdo, 'currency_symbol')) ?>/1000)
            </option>
          <?php endforeach; if ($currentCat !== null) echo '</optgroup>'; ?>
        </select>
        <p class="help-text" id="serviceDescription"></p>
      </div>
      <div class="form-group">
        <label>الرابط</label>
        <input type="text" name="link" placeholder="https://instagram.com/username" required>
      </div>
      <div class="form-group">
        <label>الكمية</label>
        <input type="number" name="quantity" id="quantity" required min="1">
        <p class="help-text" id="minMaxHint">اختر خدمة أولاً</p>
      </div>
      <div class="card" style="background:var(--card-alt);margin-bottom:16px;">
        <div class="flex-between">
          <span class="text-dim">السعر التقديري</span>
          <strong style="font-size:18px;color:var(--accent-2);"><span id="priceEstimate">0.00</span> <?= e(get_setting($pdo, 'currency_symbol')) ?></strong>
        </div>
      </div>
      <button type="submit" class="btn btn-primary btn-block">تنفيذ الطلب</button>
    </form>
  </div>

  <div class="card">
    <div class="card-title"><?= icon('wallet') ?> ملخص حسابك</div>
    <div class="grid" style="gap:12px;">
      <div class="stat-card">
        <div class="stat-icon"><?= icon('wallet') ?></div>
        <div><div class="stat-value"><?= format_money($user['balance'], $pdo) ?></div><div class="stat-label">الرصيد الحالي</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><?= icon('star') ?></div>
        <div><div class="stat-value"><?= (int)$user['points'] ?></div><div class="stat-label">نقاطي</div></div>
      </div>
    </div>
    <a href="<?= BASE_URL ?>/topup.php" class="btn btn-primary btn-block" style="margin-top:16px;"><?= icon('wallet') ?> شحن الرصيد الآن</a>
  </div>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
