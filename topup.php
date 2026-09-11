<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/moyasar.php';
$user = require_login($pdo);
$page_title = 'شحن الرصيد';
$active = 'topup';

$min = (float)get_setting($pdo, 'min_topup_amount', 10);
$max = (float)get_setting($pdo, 'max_topup_amount', 5000);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $amount = (float)($_POST['amount'] ?? 0);
    if ($amount < $min || $amount > $max) {
        flash('error', 'المبلغ يجب أن يكون بين ' . $min . ' و ' . $max . ' ' . get_setting($pdo, 'currency_symbol'));
        redirect(BASE_URL . '/topup.php');
    }

    $ins = $pdo->prepare('INSERT INTO topups (user_id, amount, method, status) VALUES (?, ?, "moyasar", "pending")');
    $ins->execute([$user['id'], $amount]);
    $topupId = $pdo->lastInsertId();

    try {
        $callback = BASE_URL . '/moyasar-callback.php?topup=' . $topupId;
        $invoice = moyasar_create_invoice($pdo, $amount, 'شحن رصيد - طلب #' . $topupId, $callback, ['topup_id' => $topupId, 'user_id' => $user['id']]);
        $upd = $pdo->prepare('UPDATE topups SET moyasar_invoice_id = ? WHERE id = ?');
        $upd->execute([$invoice['id'], $topupId]);
        redirect($invoice['url']);
    } catch (MoyasarException $ex) {
        $pdo->prepare('UPDATE topups SET status = "failed" WHERE id = ?')->execute([$topupId]);
        flash('error', $ex->getMessage());
        redirect(BASE_URL . '/topup.php');
    }
}

$recent = $pdo->prepare('SELECT * FROM topups WHERE user_id = ? ORDER BY id DESC LIMIT 10');
$recent->execute([$user['id']]);
$recentTopups = $recent->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<div class="grid grid-2" style="align-items:start;">
  <div class="card">
    <div class="card-title"><?= icon('wallet') ?> شحن الرصيد</div>
    <p class="help-text">الحد الأدنى للشحن: <?= format_money($min, $pdo) ?> — الحد الأقصى: <?= format_money($max, $pdo) ?></p>
    <form method="post" novalidate>
      <?= csrf_field() ?>
      <div class="form-group">
        <label>المبلغ (<?= e(get_setting($pdo, 'currency_symbol')) ?>)</label>
        <input type="number" name="amount" step="0.01" min="<?= $min ?>" max="<?= $max ?>" required>
      </div>
      <div class="flex gap-8" style="margin-bottom:16px;flex-wrap:wrap;">
        <?php foreach ([20, 50, 100, 200, 500] as $q): ?>
          <button type="button" class="btn btn-outline btn-sm quick-amount" onclick="document.querySelector('[name=amount]').value=<?= $q ?>"><?= $q ?> <?= e(get_setting($pdo, 'currency_symbol')) ?></button>
        <?php endforeach; ?>
      </div>
      <button type="submit" class="btn btn-primary btn-block">الدفع عبر Moyasar</button>
      <p class="help-text" style="margin-top:10px;">يدعم بطاقات مدى، فيزا، ماستركارد، Apple Pay.</p>
    </form>
  </div>

  <div class="card">
    <div class="card-title"><?= icon('droplet') ?> آخر عمليات الشحن</div>
    <?php if (empty($recentTopups)): ?>
      <p class="text-dim">لا توجد عمليات شحن بعد.</p>
    <?php else: ?>
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>المبلغ</th><th>الحالة</th><th>التاريخ</th></tr></thead>
          <tbody>
            <?php foreach ($recentTopups as $t): ?>
            <tr>
              <td>#<?= $t['id'] ?></td>
              <td><?= format_money($t['amount'], $pdo) ?></td>
              <td><span class="badge <?= status_badge_class($t['status']) ?>"><?= status_label($t['status']) ?></span></td>
              <td><?= date('Y-m-d H:i', strtotime($t['created_at'])) ?></td>
            </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php endif; ?>
  </div>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
