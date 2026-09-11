<?php
require_once __DIR__ . '/../config/config.php';
$admin = require_admin($pdo);
$page_title = 'المستخدمون';
$active = 'users';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $userId = (int)($_POST['user_id'] ?? 0);

    if (isset($_POST['adjust_balance'])) {
        $amount = (float)($_POST['amount'] ?? 0);
        $note = trim($_POST['note'] ?? 'تعديل رصيد يدوي من الإدارة');
        if ($amount != 0) {
            try {
                wallet_adjust($pdo, $userId, $amount, 'admin_adjust', $note);
                flash('success', 'تم تعديل الرصيد بنجاح.');
            } catch (Exception $ex) {
                flash('error', 'تعذر تعديل الرصيد: ' . $ex->getMessage());
            }
        }
    } elseif (isset($_POST['toggle_status'])) {
        $stmt = $pdo->prepare('SELECT status, role FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $u = $stmt->fetch();
        if ($u && $u['role'] !== 'admin') {
            $new = $u['status'] === 'active' ? 'banned' : 'active';
            $pdo->prepare('UPDATE users SET status = ? WHERE id = ?')->execute([$new, $userId]);
            flash('success', 'تم تحديث حالة المستخدم.');
        }
    } elseif (isset($_POST['toggle_role'])) {
        $stmt = $pdo->prepare('SELECT role FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $role = $stmt->fetchColumn();
        if ($role) {
            $new = $role === 'admin' ? 'user' : 'admin';
            $pdo->prepare('UPDATE users SET role = ? WHERE id = ?')->execute([$new, $userId]);
            flash('success', 'تم تحديث صلاحية المستخدم.');
        }
    }
    redirect(BASE_URL . '/admin/users.php');
}

$search = trim($_GET['q'] ?? '');
$params = [];
$where = '';
if ($search) {
    $where = 'WHERE name LIKE ? OR email LIKE ?';
    $params = ["%$search%", "%$search%"];
}
$stmt = $pdo->prepare("SELECT * FROM users $where ORDER BY id DESC LIMIT 200");
$stmt->execute($params);
$users = $stmt->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<div class="card">
  <div class="card-title"><?= icon('users') ?> إدارة المستخدمين</div>
  <form method="get" class="flex gap-8" style="margin-bottom:18px;">
    <input type="text" name="q" placeholder="بحث بالاسم أو البريد الإلكتروني" value="<?= e($search) ?>">
    <button type="submit" class="btn btn-outline">بحث</button>
  </form>

  <div class="table-wrap">
    <table>
      <thead><tr><th>#</th><th>الاسم</th><th>البريد</th><th>الرصيد</th><th>النقاط</th><th>الدور</th><th>الحالة</th><th>إجراءات</th></tr></thead>
      <tbody>
      <?php foreach ($users as $u): ?>
        <tr>
          <td>#<?= $u['id'] ?></td>
          <td><?= e($u['name']) ?></td>
          <td><?= e($u['email']) ?></td>
          <td><?= format_money($u['balance'], $pdo) ?></td>
          <td><?= (int)$u['points'] ?></td>
          <td><span class="badge <?= $u['role'] === 'admin' ? 'badge-info' : 'badge-muted' ?>"><?= $u['role'] === 'admin' ? 'مدير' : 'مستخدم' ?></span></td>
          <td><span class="badge <?= $u['status'] === 'active' ? 'badge-success' : 'badge-danger' ?>"><?= $u['status'] === 'active' ? 'نشط' : 'محظور' ?></span></td>
          <td>
            <details>
              <summary class="btn btn-sm btn-outline" style="display:inline-flex;cursor:pointer;">إدارة</summary>
              <div style="margin-top:10px;min-width:220px;">
                <form method="post" class="flex gap-8" style="margin-bottom:8px;">
                  <?= csrf_field() ?>
                  <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                  <input type="number" step="0.01" name="amount" placeholder="+10 / -10" style="width:100px;">
                  <button type="submit" name="adjust_balance" value="1" class="btn btn-sm btn-primary">تعديل رصيد</button>
                </form>
                <form method="post" style="display:inline-block;margin-left:6px;">
                  <?= csrf_field() ?>
                  <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                  <button type="submit" name="toggle_status" value="1" class="btn btn-sm btn-outline" <?= $u['role'] === 'admin' ? 'disabled' : '' ?>><?= $u['status'] === 'active' ? 'حظر' : 'إلغاء الحظر' ?></button>
                </form>
                <form method="post" style="display:inline-block;">
                  <?= csrf_field() ?>
                  <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                  <button type="submit" name="toggle_role" value="1" class="btn btn-sm btn-outline" data-confirm="تأكيد تغيير صلاحية هذا المستخدم؟"><?= $u['role'] === 'admin' ? 'إلغاء صلاحية الإدارة' : 'ترقية لمدير' ?></button>
                </form>
              </div>
            </details>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
