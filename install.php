<?php
/**
 * One-time installer: creates database tables (if missing) and the first admin account.
 * Delete or rename this file after installation is complete (it self-locks via install.lock).
 */
$lockFile = __DIR__ . '/install.lock';
if (file_exists($lockFile)) {
    die('التثبيت مكتمل بالفعل. لإعادة التثبيت احذف الملف install.lock يدوياً من السيرفر (غير مستحسن على موقع مباشر).');
}

require_once __DIR__ . '/config/config.php';

$tableExists = true;
try {
    $pdo->query('SELECT 1 FROM users LIMIT 1');
} catch (PDOException $e) {
    $tableExists = false;
}

$schemaApplied = $tableExists;
$error = '';

if (!$tableExists) {
    try {
        $sql = file_get_contents(__DIR__ . '/database/schema.sql');
        $sql = preg_replace('/^--.*$/m', '', $sql);
        $statements = array_filter(array_map('trim', explode(";\n", $sql)));
        $pdo->exec('SET FOREIGN_KEY_CHECKS=0');
        foreach ($statements as $stmt) {
            $stmt = trim($stmt);
            if ($stmt === '' || $stmt === 'SET FOREIGN_KEY_CHECKS = 0' || $stmt === 'SET FOREIGN_KEY_CHECKS = 1') {
                continue;
            }
            $pdo->exec($stmt);
        }
        $pdo->exec('SET FOREIGN_KEY_CHECKS=1');
        $schemaApplied = true;
    } catch (Exception $e) {
        $error = 'حدث خطأ أثناء إنشاء الجداول: ' . $e->getMessage();
    }
}

$adminExists = false;
if ($schemaApplied) {
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
        $adminExists = ((int)$stmt->fetchColumn()) > 0;
    } catch (Exception $e) {
        $error = $error ?: $e->getMessage();
    }
}

if ($adminExists) {
    file_put_contents($lockFile, 'installed_at=' . date('c') . "\n");
}

$success = '';
if ($schemaApplied && !$adminExists && $_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['password_confirm'] ?? '';

    if (!$name || !$email || !$password) {
        $error = 'الرجاء تعبئة جميع الحقول.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'البريد الإلكتروني غير صالح.';
    } elseif (strlen($password) < 8) {
        $error = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.';
    } elseif ($password !== $confirm) {
        $error = 'كلمتا المرور غير متطابقتين.';
    } else {
        try {
            $stmt = $pdo->prepare('INSERT INTO users (name, email, password_hash, api_key, referral_code, role, balance) VALUES (?, ?, ?, ?, ?, "admin", 0)');
            $stmt->execute([
                $name,
                $email,
                password_hash($password, PASSWORD_DEFAULT),
                generate_token(64),
                generate_referral_code(),
            ]);
            file_put_contents($lockFile, 'installed_at=' . date('c') . "\n");
            $success = 'تم إنشاء حساب المدير بنجاح! يمكنك الآن تسجيل الدخول.';
            $adminExists = true;
        } catch (Exception $e) {
            $error = 'تعذر إنشاء الحساب: ' . $e->getMessage();
        }
    }
}
?><!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تثبيت المنصة</title>
<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
</head>
<body>
<div class="auth-wrap">
  <div class="auth-card" style="max-width:480px;">
    <div class="auth-logo">
      <div class="brand-mark" style="width:56px;height:56px;font-size:24px;">S</div>
      <h2 class="mt-0">تثبيت المنصة</h2>
    </div>

    <?php if ($error): ?><div class="alert alert-danger"><?= e($error) ?></div><?php endif; ?>
    <?php if ($success): ?>
      <div class="alert alert-success"><?= e($success) ?></div>
      <a href="<?= BASE_URL ?>/login.php" class="btn btn-primary btn-block">الذهاب لتسجيل الدخول</a>
      <p class="help-text" style="margin-top:14px;">تنبيه أمني: يرجى حذف ملف install.php من السيرفر الآن، والاحتفاظ بملف install.lock.</p>
    <?php elseif (!$schemaApplied): ?>
      <p>تعذر إعداد قاعدة البيانات. تحقق من بيانات الاتصال في <code>config/config.php</code> ثم أعد تحميل الصفحة.</p>
    <?php elseif ($adminExists): ?>
      <p>تم إنشاء حساب المدير مسبقاً.</p>
      <a href="<?= BASE_URL ?>/login.php" class="btn btn-primary btn-block">تسجيل الدخول</a>
    <?php else: ?>
      <p class="help-text">تم إنشاء جداول قاعدة البيانات بنجاح. الآن أنشئ حساب المدير الرئيسي للمنصة.</p>
      <form method="post" novalidate>
        <?= csrf_field() ?>
        <div class="form-group">
          <label>الاسم الكامل</label>
          <input type="text" name="name" required value="<?= e($_POST['name'] ?? '') ?>">
        </div>
        <div class="form-group">
          <label>البريد الإلكتروني</label>
          <input type="email" name="email" required value="<?= e($_POST['email'] ?? '') ?>">
        </div>
        <div class="form-group">
          <label>كلمة المرور</label>
          <input type="password" name="password" required minlength="8">
        </div>
        <div class="form-group">
          <label>تأكيد كلمة المرور</label>
          <input type="password" name="password_confirm" required minlength="8">
        </div>
        <button type="submit" class="btn btn-primary btn-block">إنشاء حساب المدير</button>
      </form>
    <?php endif; ?>
  </div>
</div>
</body>
</html>
