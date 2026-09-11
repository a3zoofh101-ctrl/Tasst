<?php
require_once __DIR__ . '/../config/config.php';
$admin = require_admin($pdo);
$page_title = 'الإعدادات';
$active = 'settings';

$fields = [
    'site_name', 'site_tagline', 'currency_code', 'currency_symbol', 'whatsapp_number',
    'points_per_currency', 'affiliate_percent', 'min_topup_amount', 'max_topup_amount',
    'moyasar_publishable_key', 'moyasar_secret_key', 'moyasar_mode',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    foreach ($fields as $f) {
        if (isset($_POST[$f])) {
            set_setting($pdo, $f, trim($_POST[$f]));
        }
    }
    flash('success', 'تم حفظ الإعدادات بنجاح.');
    redirect(BASE_URL . '/admin/settings.php');
}

$values = [];
foreach ($fields as $f) { $values[$f] = get_setting($pdo, $f, ''); }

include __DIR__ . '/includes/header.php';
?>
<form method="post" novalidate>
  <?= csrf_field() ?>
  <div class="grid grid-2" style="align-items:start;">
    <div class="card">
      <div class="card-title"><?= icon('settings') ?> إعدادات عامة</div>
      <div class="form-group"><label>اسم الموقع</label><input type="text" name="site_name" value="<?= e($values['site_name']) ?>" required></div>
      <div class="form-group"><label>الوصف المختصر</label><input type="text" name="site_tagline" value="<?= e($values['site_tagline']) ?>"></div>
      <div class="form-group"><label>رقم واتساب (بصيغة دولية، بدون +)</label><input type="text" name="whatsapp_number" value="<?= e($values['whatsapp_number']) ?>" placeholder="966500000000"></div>
      <div class="grid grid-2">
        <div class="form-group"><label>رمز العملة (ISO)</label><input type="text" name="currency_code" value="<?= e($values['currency_code']) ?>" placeholder="SAR"></div>
        <div class="form-group"><label>رمز العملة المعروض</label><input type="text" name="currency_symbol" value="<?= e($values['currency_symbol']) ?>" placeholder="ر.س"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><?= icon('cash') ?> النقاط والعمولة والشحن</div>
      <div class="form-group"><label>نقاط لكل وحدة عملة يتم إنفاقها</label><input type="number" step="0.01" name="points_per_currency" value="<?= e($values['points_per_currency']) ?>"></div>
      <div class="form-group"><label>نسبة عمولة التسويق بالعمولة (%)</label><input type="number" step="0.1" name="affiliate_percent" value="<?= e($values['affiliate_percent']) ?>"></div>
      <div class="grid grid-2">
        <div class="form-group"><label>الحد الأدنى للشحن</label><input type="number" step="0.01" name="min_topup_amount" value="<?= e($values['min_topup_amount']) ?>"></div>
        <div class="form-group"><label>الحد الأقصى للشحن</label><input type="number" step="0.01" name="max_topup_amount" value="<?= e($values['max_topup_amount']) ?>"></div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title"><?= icon('wallet') ?> بوابة الدفع Moyasar</div>
    <p class="help-text">احصل على المفاتيح من لوحة تحكم Moyasar: <a href="https://dashboard.moyasar.com" target="_blank" style="color:var(--info);">dashboard.moyasar.com</a></p>
    <div class="grid grid-2">
      <div class="form-group"><label>المفتاح العام (Publishable Key)</label><input type="text" name="moyasar_publishable_key" value="<?= e($values['moyasar_publishable_key']) ?>" placeholder="pk_test_..."></div>
      <div class="form-group"><label>المفتاح السري (Secret Key)</label><input type="text" name="moyasar_secret_key" value="<?= e($values['moyasar_secret_key']) ?>" placeholder="sk_test_..."></div>
    </div>
    <div class="form-group">
      <label>الوضع</label>
      <select name="moyasar_mode">
        <option value="test" <?= $values['moyasar_mode'] === 'test' ? 'selected' : '' ?>>تجريبي (Test)</option>
        <option value="live" <?= $values['moyasar_mode'] === 'live' ? 'selected' : '' ?>>مباشر (Live)</option>
      </select>
    </div>
  </div>

  <button type="submit" class="btn btn-primary btn-block">حفظ جميع الإعدادات</button>
</form>
<?php include __DIR__ . '/includes/footer.php'; ?>
