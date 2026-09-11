<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/moyasar.php';
$user = require_login($pdo);

$topupId = (int)($_GET['topup'] ?? 0);
$stmt = $pdo->prepare('SELECT * FROM topups WHERE id = ? AND user_id = ?');
$stmt->execute([$topupId, $user['id']]);
$topup = $stmt->fetch();

if (!$topup) {
    flash('error', 'عملية الشحن غير موجودة.');
    redirect(BASE_URL . '/topup.php');
}

if ($topup['status'] === 'paid') {
    flash('success', 'تم شحن رصيدك مسبقاً لهذه العملية.');
    redirect(BASE_URL . '/topup.php');
}

if (!$topup['moyasar_invoice_id']) {
    flash('error', 'تعذر التحقق من عملية الدفع.');
    redirect(BASE_URL . '/topup.php');
}

try {
    // Always re-verify the payment status directly with Moyasar's API — never trust query params alone.
    $invoice = moyasar_fetch_invoice($pdo, $topup['moyasar_invoice_id']);
    $status = $invoice['status'] ?? 'failed';

    if ($status === 'paid') {
        $pdo->beginTransaction();
        $lock = $pdo->prepare('SELECT status FROM topups WHERE id = ? FOR UPDATE');
        $lock->execute([$topup['id']]);
        $currentStatus = $lock->fetchColumn();
        if ($currentStatus === 'paid') {
            $pdo->commit();
            flash('success', 'تم شحن رصيدك مسبقاً لهذه العملية.');
        } else {
            $pdo->prepare('UPDATE topups SET status = "paid", paid_at = NOW() WHERE id = ?')->execute([$topup['id']]);
            $pdo->commit();
            wallet_adjust($pdo, $user['id'], (float)$topup['amount'], 'topup', 'شحن رصيد عبر Moyasar #' . $topup['id'], $topup['moyasar_invoice_id']);
            flash('success', 'تم شحن رصيدك بنجاح بمبلغ ' . format_money($topup['amount'], $pdo));
        }
    } else {
        $pdo->prepare('UPDATE topups SET status = "failed" WHERE id = ?')->execute([$topup['id']]);
        flash('error', 'لم تكتمل عملية الدفع (الحالة: ' . e($status) . ').');
    }
} catch (Exception $ex) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    flash('error', 'تعذر التحقق من حالة الدفع: ' . $ex->getMessage());
}

redirect(BASE_URL . '/topup.php');
