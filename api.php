<?php
require_once __DIR__ . '/config/config.php';
$user = require_login($pdo);
$page_title = 'API';
$active = 'api';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    if (isset($_POST['regenerate'])) {
        $newKey = generate_token(64);
        $pdo->prepare('UPDATE users SET api_key = ? WHERE id = ?')->execute([$newKey, $user['id']]);
        flash('success', 'تم إنشاء مفتاح API جديد.');
        redirect(BASE_URL . '/api.php');
    }
}

$apiUrl = BASE_URL . '/api/v2/index.php';
include __DIR__ . '/includes/header.php';
?>
<div class="card">
  <div class="card-title"><?= icon('code') ?> مفتاح API الخاص بك</div>
  <div class="input-group">
    <input type="text" id="apiKeyField" value="<?= e($user['api_key']) ?>" readonly>
    <button type="button" class="btn btn-outline" data-copy="#apiKeyField">نسخ</button>
    <form method="post" style="display:inline;" data-confirm="سيتم إبطال المفتاح الحالي فوراً، هل أنت متأكد؟">
      <?= csrf_field() ?>
      <button type="submit" name="regenerate" value="1" class="btn btn-danger">إعادة توليد</button>
    </form>
  </div>
  <p class="help-text">رابط الـ API: <code><?= e($apiUrl) ?></code></p>
</div>

<div class="card">
  <div class="card-title">توثيق API</div>
  <p>جميع الطلبات ترسل بطريقة <strong>POST</strong> إلى الرابط أعلاه مع تمرير <code>key</code> و <code>action</code> ضمن بيانات الطلب.</p>

  <h3>1. رصيد الحساب</h3>
  <pre style="background:var(--bg);padding:14px;border-radius:8px;overflow-x:auto;">curl -X POST <?= e($apiUrl) ?> \
  -d "key=<?= e($user['api_key']) ?>" \
  -d "action=balance"</pre>

  <h3>2. قائمة الخدمات</h3>
  <pre style="background:var(--bg);padding:14px;border-radius:8px;overflow-x:auto;">curl -X POST <?= e($apiUrl) ?> \
  -d "key=<?= e($user['api_key']) ?>" \
  -d "action=services"</pre>

  <h3>3. إنشاء طلب</h3>
  <pre style="background:var(--bg);padding:14px;border-radius:8px;overflow-x:auto;">curl -X POST <?= e($apiUrl) ?> \
  -d "key=<?= e($user['api_key']) ?>" \
  -d "action=add" \
  -d "service=1" \
  -d "link=https://instagram.com/username" \
  -d "quantity=1000"</pre>

  <h3>4. حالة الطلب</h3>
  <pre style="background:var(--bg);padding:14px;border-radius:8px;overflow-x:auto;">curl -X POST <?= e($apiUrl) ?> \
  -d "key=<?= e($user['api_key']) ?>" \
  -d "action=status" \
  -d "order=123"</pre>

  <p class="help-text">جميع الردود بصيغة JSON. عند حدوث خطأ يتم إرجاع <code>{"error": "..."}</code></p>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
