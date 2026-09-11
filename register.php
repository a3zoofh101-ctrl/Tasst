<?php
require_once __DIR__ . '/config/config.php';

if (current_user($pdo)) {
    redirect(BASE_URL . '/dashboard.php');
}

$error = '';
$refCode = trim($_GET['ref'] ?? ($_POST['ref'] ?? ''));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['password_confirm'] ?? '';

    if (!$name || !$email || !$password) {
        $error = 'الرجاء تعبئة جميع الحقول المطلوبة.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'البريد الإلكتروني غير صالح.';
    } elseif (strlen($password) < 8) {
        $error = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.';
    } elseif ($password !== $confirm) {
        $error = 'كلمتا المرور غير متطابقتين.';
    } else {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $error = 'هذا البريد الإلكتروني مسجل مسبقاً.';
        } else {
            $referredBy = null;
            if ($refCode) {
                $r = $pdo->prepare('SELECT id FROM users WHERE referral_code = ?');
                $r->execute([$refCode]);
                $referredBy = $r->fetchColumn() ?: null;
            }
            $ins = $pdo->prepare('INSERT INTO users (name, email, phone, password_hash, api_key, referral_code, referred_by) VALUES (?, ?, ?, ?, ?, ?, ?)');
            $ins->execute([
                $name, $email, $phone ?: null,
                password_hash($password, PASSWORD_DEFAULT),
                generate_token(64),
                generate_referral_code(),
                $referredBy,
            ]);
            $userId = $pdo->lastInsertId();
            session_regenerate_id(true);
            $_SESSION['user_id'] = $userId;
            redirect(BASE_URL . '/dashboard.php');
        }
    }
}

$site_name = get_setting($pdo, 'site_name', 'سوشيال برو');
?><!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>إنشاء حساب | <?= e($site_name) ?></title>
<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
</head>
<body>
<div class="auth-wrap">
  <div class="auth-card">
    <div class="auth-logo">
      <div class="brand-mark" style="width:56px;height:56px;font-size:24px;"><?= e(mb_substr($site_name, 0, 1)) ?></div>
      <h2 class="mt-0">إنشاء حساب جديد</h2>
    </div>
    <?php if ($error): ?><div class="alert alert-danger"><?= e($error) ?></div><?php endif; ?>
    <?php if ($refCode): ?><div class="alert alert-success"><?= icon('gift') ?> تم استخدام رمز الإحالة: <?= e($refCode) ?></div><?php endif; ?>
    <form method="post" novalidate>
      <?= csrf_field() ?>
      <input type="hidden" name="ref" value="<?= e($refCode) ?>">
      <div class="form-group">
        <label>الاسم الكامل</label>
        <input type="text" name="name" required value="<?= e($_POST['name'] ?? '') ?>">
      </div>
      <div class="form-group">
        <label>البريد الإلكتروني</label>
        <input type="email" name="email" required value="<?= e($_POST['email'] ?? '') ?>">
      </div>
      <div class="form-group">
        <label>رقم الجوال (اختياري)</label>
        <input type="tel" name="phone" value="<?= e($_POST['phone'] ?? '') ?>">
      </div>
      <div class="form-group">
        <label>كلمة المرور</label>
        <input type="password" name="password" required minlength="8">
      </div>
      <div class="form-group">
        <label>تأكيد كلمة المرور</label>
        <input type="password" name="password_confirm" required minlength="8">
      </div>
      <button type="submit" class="btn btn-primary btn-block">إنشاء الحساب</button>
    </form>
    <p class="auth-footer">لديك حساب بالفعل؟ <a href="<?= BASE_URL ?>/login.php" style="color:var(--accent-2);font-weight:700;">تسجيل الدخول</a></p>
  </div>
</div>
</body>
</html>
