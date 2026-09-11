<?php
require_once __DIR__ . '/config/config.php';
$user = require_login($pdo);
$page_title = 'الملف الشخصي';
$active = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    if (isset($_POST['update_profile'])) {
        $name = trim($_POST['name'] ?? '');
        $phone = trim($_POST['phone'] ?? '');
        if (!$name) {
            flash('error', 'الاسم مطلوب.');
        } else {
            $pdo->prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?')->execute([$name, $phone ?: null, $user['id']]);
            flash('success', 'تم تحديث بياناتك بنجاح.');
        }
    } elseif (isset($_POST['change_password'])) {
        $current = $_POST['current_password'] ?? '';
        $new = $_POST['new_password'] ?? '';
        $confirm = $_POST['new_password_confirm'] ?? '';
        if (!password_verify($current, $user['password_hash'])) {
            flash('error', 'كلمة المرور الحالية غير صحيحة.');
        } elseif (strlen($new) < 8) {
            flash('error', 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.');
        } elseif ($new !== $confirm) {
            flash('error', 'كلمتا المرور غير متطابقتين.');
        } else {
            $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([password_hash($new, PASSWORD_DEFAULT), $user['id']]);
            flash('success', 'تم تغيير كلمة المرور بنجاح.');
        }
    }
    redirect(BASE_URL . '/profile.php');
}

include __DIR__ . '/includes/header.php';
?>
<div class="grid grid-2" style="align-items:start;">
  <div class="card">
    <div class="card-title"><?= icon('user') ?> البيانات الشخصية</div>
    <form method="post" novalidate>
      <?= csrf_field() ?>
      <div class="form-group">
        <label>الاسم الكامل</label>
        <input type="text" name="name" required value="<?= e($user['name']) ?>">
      </div>
      <div class="form-group">
        <label>البريد الإلكتروني</label>
        <input type="text" value="<?= e($user['email']) ?>" disabled>
      </div>
      <div class="form-group">
        <label>رقم الجوال</label>
        <input type="tel" name="phone" value="<?= e($user['phone']) ?>">
      </div>
      <button type="submit" name="update_profile" value="1" class="btn btn-primary btn-block">حفظ التغييرات</button>
    </form>
  </div>

  <div class="card">
    <div class="card-title"><?= icon('settings') ?> تغيير كلمة المرور</div>
    <form method="post" novalidate>
      <?= csrf_field() ?>
      <div class="form-group">
        <label>كلمة المرور الحالية</label>
        <input type="password" name="current_password" required>
      </div>
      <div class="form-group">
        <label>كلمة المرور الجديدة</label>
        <input type="password" name="new_password" required minlength="8">
      </div>
      <div class="form-group">
        <label>تأكيد كلمة المرور الجديدة</label>
        <input type="password" name="new_password_confirm" required minlength="8">
      </div>
      <button type="submit" name="change_password" value="1" class="btn btn-primary btn-block">تغيير كلمة المرور</button>
    </form>
  </div>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
