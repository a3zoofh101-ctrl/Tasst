<?php
require_once __DIR__ . '/config/config.php';

if (current_user($pdo)) {
    redirect(BASE_URL . '/dashboard.php');
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $result = attempt_login($pdo, $email, $password);
    if ($result === false) {
        $error = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
    } elseif ($result === 'banned') {
        $error = 'تم إيقاف هذا الحساب. تواصل مع الدعم الفني.';
    } else {
        redirect(BASE_URL . '/dashboard.php');
    }
}

$site_name = get_setting($pdo, 'site_name', 'سوشيال برو');
?><!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تسجيل الدخول | <?= e($site_name) ?></title>
<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
</head>
<body>
<div class="auth-wrap">
  <div class="auth-card">
    <div class="auth-logo">
      <div class="brand-mark" style="width:56px;height:56px;font-size:24px;"><?= e(mb_substr($site_name, 0, 1)) ?></div>
      <h2 class="mt-0"><?= e($site_name) ?></h2>
      <p class="text-dim mt-0">سجّل الدخول لمتابعة طلباتك</p>
    </div>
    <?php if ($error): ?><div class="alert alert-danger"><?= e($error) ?></div><?php endif; ?>
    <form method="post" novalidate>
      <?= csrf_field() ?>
      <div class="form-group">
        <label>البريد الإلكتروني</label>
        <input type="email" name="email" required value="<?= e($_POST['email'] ?? '') ?>">
      </div>
      <div class="form-group">
        <label>كلمة المرور</label>
        <input type="password" name="password" required>
      </div>
      <button type="submit" class="btn btn-primary btn-block">تسجيل الدخول</button>
    </form>
    <p class="auth-footer">ليس لديك حساب؟ <a href="<?= BASE_URL ?>/register.php" style="color:var(--accent-2);font-weight:700;">إنشاء حساب جديد</a></p>
  </div>
</div>
</body>
</html>
