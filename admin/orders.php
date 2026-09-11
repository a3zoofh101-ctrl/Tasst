<?php
require_once __DIR__ . '/../config/config.php';
$admin = require_admin($pdo);
$page_title = 'الطلبات';
$active = 'orders';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $orderId = (int)($_POST['order_id'] ?? 0);
    $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
    $stmt->execute([$orderId]);
    $order = $stmt->fetch();

    if ($order) {
        if (isset($_POST['update_status'])) {
            $newStatus = $_POST['status'];
            $startCount = $_POST['start_count'] !== '' ? (int)$_POST['start_count'] : null;
            $remains = $_POST['remains'] !== '' ? (int)$_POST['remains'] : null;

            if ($newStatus === 'canceled' && $order['status'] !== 'canceled') {
                try {
                    wallet_adjust($pdo, $order['user_id'], (float)$order['charge'], 'refund', 'إلغاء الطلب #' . $order['id'] . ' من الإدارة');
                } catch (Exception $ex) {}
            }
            $pdo->prepare('UPDATE orders SET status = ?, start_count = ?, remains = ? WHERE id = ?')
                ->execute([$newStatus, $startCount, $remains, $orderId]);
            flash('success', 'تم تحديث حالة الطلب #' . $orderId);
        }
    }
    redirect(BASE_URL . '/admin/orders.php' . (!empty($_GET['status']) ? '?status=' . urlencode($_GET['status']) : ''));
}

$statusFilter = $_GET['status'] ?? '';
$search = trim($_GET['q'] ?? '');
$where = [];
$params = [];
if ($statusFilter) { $where[] = 'o.status = ?'; $params[] = $statusFilter; }
if ($search) { $where[] = '(u.name LIKE ? OR u.email LIKE ? OR o.link LIKE ?)'; $params = array_merge($params, ["%$search%", "%$search%", "%$search%"]); }
$whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

$perPage = 25;
$page = max(1, (int)($_GET['page'] ?? 1));
$offset = ($page - 1) * $perPage;

$countStmt = $pdo->prepare("SELECT COUNT(*) FROM orders o JOIN users u ON u.id = o.user_id $whereSql");
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();
$totalPages = max(1, (int)ceil($total / $perPage));

$stmt = $pdo->prepare("SELECT o.*, u.name AS user_name, u.email AS user_email, s.name AS service_name
    FROM orders o JOIN users u ON u.id = o.user_id JOIN services s ON s.id = o.service_id
    $whereSql ORDER BY o.id DESC LIMIT $perPage OFFSET $offset");
$stmt->execute($params);
$orders = $stmt->fetchAll();

$statuses = ['' => 'الكل', 'pending' => 'قيد الانتظار', 'in_progress' => 'قيد التنفيذ', 'completed' => 'مكتمل', 'partial' => 'مكتمل جزئياً', 'canceled' => 'ملغي', 'refunded' => 'مسترجع'];

include __DIR__ . '/includes/header.php';
?>
<div class="card">
  <div class="card-title"><?= icon('cart') ?> إدارة الطلبات</div>
  <div class="tabs">
    <?php foreach ($statuses as $key => $label): ?>
      <a class="tab <?= $statusFilter === $key ? 'active' : '' ?>" href="?status=<?= e($key) ?>"><?= e($label) ?></a>
    <?php endforeach; ?>
  </div>
  <form method="get" class="flex gap-8" style="margin-bottom:16px;">
    <input type="hidden" name="status" value="<?= e($statusFilter) ?>">
    <input type="text" name="q" placeholder="بحث بالمستخدم أو الرابط" value="<?= e($search) ?>">
    <button type="submit" class="btn btn-outline">بحث</button>
  </form>

  <div class="table-wrap">
    <table>
      <thead><tr><th>#</th><th>المستخدم</th><th>الخدمة</th><th>الرابط</th><th>الكمية</th><th>السعر</th><th>الحالة</th><th>تحديث</th></tr></thead>
      <tbody>
      <?php foreach ($orders as $o): ?>
        <tr>
          <td>#<?= $o['id'] ?></td>
          <td><?= e($o['user_name']) ?><br><small class="text-dim"><?= e($o['user_email']) ?></small></td>
          <td><?= e($o['service_name']) ?></td>
          <td class="wrap"><a href="<?= e($o['link']) ?>" target="_blank" style="color:var(--info);"><?= e(mb_strimwidth($o['link'], 0, 30, '…')) ?></a></td>
          <td><?= number_format($o['quantity']) ?></td>
          <td><?= format_money($o['charge'], $pdo) ?></td>
          <td><span class="badge <?= status_badge_class($o['status']) ?>"><?= status_label($o['status']) ?></span></td>
          <td>
            <details>
              <summary class="btn btn-sm btn-outline" style="display:inline-flex;cursor:pointer;">تعديل</summary>
              <form method="post" style="margin-top:10px;min-width:200px;">
                <?= csrf_field() ?>
                <input type="hidden" name="order_id" value="<?= $o['id'] ?>">
                <div class="form-group">
                  <select name="status">
                    <?php foreach (['pending','in_progress','completed','partial','canceled','refunded'] as $st): ?>
                      <option value="<?= $st ?>" <?= $o['status'] === $st ? 'selected' : '' ?>><?= status_label($st) ?></option>
                    <?php endforeach; ?>
                  </select>
                </div>
                <div class="form-group"><input type="number" name="start_count" placeholder="العدد المبدئي" value="<?= e($o['start_count']) ?>"></div>
                <div class="form-group"><input type="number" name="remains" placeholder="المتبقي" value="<?= e($o['remains']) ?>"></div>
                <button type="submit" name="update_status" value="1" class="btn btn-sm btn-primary btn-block">حفظ</button>
              </form>
            </details>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <?php if ($totalPages > 1): ?>
  <div class="pagination">
    <?php for ($p = 1; $p <= $totalPages; $p++): ?><a class="<?= $p === $page ? 'active' : '' ?>" href="?status=<?= e($statusFilter) ?>&q=<?= e($search) ?>&page=<?= $p ?>"><?= $p ?></a><?php endfor; ?>
  </div>
  <?php endif; ?>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
