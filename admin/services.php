<?php
require_once __DIR__ . '/../config/config.php';
$admin = require_admin($pdo);
$page_title = 'الخدمات';
$active = 'services';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    if (isset($_POST['add_category'])) {
        $name = trim($_POST['category_name'] ?? '');
        if ($name) {
            $pdo->prepare('INSERT INTO categories (name, sort_order) VALUES (?, 0)')->execute([$name]);
            flash('success', 'تم إضافة التصنيف.');
        }
    } elseif (isset($_POST['delete_category'])) {
        $pdo->prepare('DELETE FROM categories WHERE id = ?')->execute([(int)$_POST['delete_category']]);
        flash('success', 'تم حذف التصنيف.');
    } elseif (isset($_POST['save_service'])) {
        $id = (int)($_POST['service_id'] ?? 0);
        $categoryId = (int)$_POST['category_id'];
        $name = trim($_POST['name'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $rate = (float)$_POST['rate_per_1000'];
        $min = (int)$_POST['min_qty'];
        $max = (int)$_POST['max_qty'];
        $type = $_POST['service_type'] ?? 'default';

        if (!$name || $rate <= 0 || $min <= 0 || $max < $min) {
            flash('error', 'الرجاء التحقق من بيانات الخدمة.');
        } elseif ($id) {
            $upd = $pdo->prepare('UPDATE services SET category_id=?, name=?, description=?, rate_per_1000=?, min_qty=?, max_qty=?, service_type=? WHERE id=?');
            $upd->execute([$categoryId, $name, $description, $rate, $min, $max, $type, $id]);
            flash('success', 'تم تحديث الخدمة.');
        } else {
            $ins = $pdo->prepare('INSERT INTO services (category_id, name, description, rate_per_1000, min_qty, max_qty, service_type) VALUES (?, ?, ?, ?, ?, ?, ?)');
            $ins->execute([$categoryId, $name, $description, $rate, $min, $max, $type]);
            flash('success', 'تم إضافة الخدمة.');
        }
    } elseif (isset($_POST['toggle_service'])) {
        $id = (int)$_POST['toggle_service'];
        $stmt = $pdo->prepare('SELECT status FROM services WHERE id = ?');
        $stmt->execute([$id]);
        $cur = $stmt->fetchColumn();
        $new = $cur === 'active' ? 'inactive' : 'active';
        $pdo->prepare('UPDATE services SET status = ? WHERE id = ?')->execute([$new, $id]);
        flash('success', 'تم تحديث حالة الخدمة.');
    } elseif (isset($_POST['delete_service'])) {
        $pdo->prepare('DELETE FROM services WHERE id = ?')->execute([(int)$_POST['delete_service']]);
        flash('success', 'تم حذف الخدمة.');
    }
    redirect(BASE_URL . '/admin/services.php');
}

$categories = $pdo->query('SELECT * FROM categories ORDER BY sort_order, id')->fetchAll();
$services = $pdo->query('SELECT s.*, c.name AS category_name FROM services s JOIN categories c ON c.id = s.category_id ORDER BY s.id DESC')->fetchAll();

$editService = null;
if (!empty($_GET['edit'])) {
    $stmt = $pdo->prepare('SELECT * FROM services WHERE id = ?');
    $stmt->execute([(int)$_GET['edit']]);
    $editService = $stmt->fetch();
}

include __DIR__ . '/includes/header.php';
?>
<div class="grid grid-2" style="align-items:start;">
  <div class="card">
    <div class="card-title"><?= icon('list') ?> التصنيفات</div>
    <form method="post" class="flex gap-8" style="margin-bottom:16px;">
      <?= csrf_field() ?>
      <input type="text" name="category_name" placeholder="اسم التصنيف الجديد" required>
      <button type="submit" name="add_category" value="1" class="btn btn-primary">إضافة</button>
    </form>
    <?php foreach ($categories as $c): ?>
      <div class="flex-between" style="padding:8px 0;border-bottom:1px solid var(--border);">
        <span><?= e($c['name']) ?></span>
        <form method="post" onsubmit="return confirm('حذف التصنيف سيحذف كل خدماته! متأكد؟');">
          <?= csrf_field() ?>
          <button type="submit" name="delete_category" value="<?= $c['id'] ?>" class="btn btn-sm btn-danger">حذف</button>
        </form>
      </div>
    <?php endforeach; ?>
  </div>

  <div class="card">
    <div class="card-title"><?= icon('edit') ?> <?= $editService ? 'تعديل خدمة #' . $editService['id'] : 'إضافة خدمة جديدة' ?></div>
    <form method="post" novalidate>
      <?= csrf_field() ?>
      <input type="hidden" name="service_id" value="<?= $editService['id'] ?? '' ?>">
      <div class="form-group">
        <label>التصنيف</label>
        <select name="category_id" required>
          <?php foreach ($categories as $c): ?>
            <option value="<?= $c['id'] ?>" <?= (($editService['category_id'] ?? 0) == $c['id']) ? 'selected' : '' ?>><?= e($c['name']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="form-group">
        <label>اسم الخدمة</label>
        <input type="text" name="name" required value="<?= e($editService['name'] ?? '') ?>">
      </div>
      <div class="form-group">
        <label>الوصف</label>
        <textarea name="description"><?= e($editService['description'] ?? '') ?></textarea>
      </div>
      <div class="grid grid-2">
        <div class="form-group"><label>السعر لكل 1000</label><input type="number" step="0.0001" name="rate_per_1000" required value="<?= e($editService['rate_per_1000'] ?? '') ?>"></div>
        <div class="form-group"><label>النوع</label>
          <select name="service_type">
            <option value="default" <?= (($editService['service_type'] ?? '') === 'default') ? 'selected' : '' ?>>عادي</option>
            <option value="drip_feed" <?= (($editService['service_type'] ?? '') === 'drip_feed') ? 'selected' : '' ?>>تسليم تدريجي</option>
            <option value="custom_comments" <?= (($editService['service_type'] ?? '') === 'custom_comments') ? 'selected' : '' ?>>تعليقات مخصصة</option>
          </select>
        </div>
        <div class="form-group"><label>الحد الأدنى</label><input type="number" name="min_qty" required value="<?= e($editService['min_qty'] ?? 100) ?>"></div>
        <div class="form-group"><label>الحد الأقصى</label><input type="number" name="max_qty" required value="<?= e($editService['max_qty'] ?? 10000) ?>"></div>
      </div>
      <button type="submit" name="save_service" value="1" class="btn btn-primary btn-block"><?= $editService ? 'حفظ التعديلات' : 'إضافة الخدمة' ?></button>
      <?php if ($editService): ?><a href="services.php" class="btn btn-outline btn-block" style="margin-top:8px;">إلغاء التعديل</a><?php endif; ?>
    </form>
  </div>
</div>

<div class="card">
  <div class="card-title"><?= icon('list') ?> جميع الخدمات</div>
  <div class="table-wrap">
    <table>
      <thead><tr><th>#</th><th>الاسم</th><th>التصنيف</th><th>السعر/1000</th><th>الحد الأدنى/الأقصى</th><th>الحالة</th><th>إجراءات</th></tr></thead>
      <tbody>
      <?php foreach ($services as $s): ?>
        <tr>
          <td>#<?= $s['id'] ?></td>
          <td><?= e($s['name']) ?></td>
          <td><?= e($s['category_name']) ?></td>
          <td><?= number_format($s['rate_per_1000'], 4) ?></td>
          <td><?= number_format($s['min_qty']) ?> / <?= number_format($s['max_qty']) ?></td>
          <td><span class="badge <?= $s['status'] === 'active' ? 'badge-success' : 'badge-muted' ?>"><?= $s['status'] === 'active' ? 'مفعلة' : 'موقوفة' ?></span></td>
          <td class="flex gap-8">
            <a href="?edit=<?= $s['id'] ?>" class="btn btn-sm btn-outline">تعديل</a>
            <form method="post" style="display:inline;"><?= csrf_field() ?><button type="submit" name="toggle_service" value="<?= $s['id'] ?>" class="btn btn-sm btn-outline"><?= $s['status'] === 'active' ? 'إيقاف' : 'تفعيل' ?></button></form>
            <form method="post" style="display:inline;" data-confirm="تأكيد حذف الخدمة؟"><?= csrf_field() ?><button type="submit" name="delete_service" value="<?= $s['id'] ?>" class="btn btn-sm btn-danger">حذف</button></form>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
