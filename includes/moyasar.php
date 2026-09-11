<?php
/**
 * Minimal Moyasar payment gateway client (Invoice API).
 * Docs: https://docs.moyasar.com/invoices
 */

class MoyasarException extends RuntimeException {}

function moyasar_request($pdo, $method, $path, $payload = null) {
    $secretKey = get_setting($pdo, 'moyasar_secret_key', '');
    if (!$secretKey) {
        throw new MoyasarException('لم يتم إعداد مفاتيح Moyasar بعد. الرجاء إضافتها من لوحة الإدارة > الإعدادات.');
    }

    $ch = curl_init('https://api.moyasar.com/v1' . $path);
    $headers = ['Content-Type: application/json'];
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_USERPWD => $secretKey . ':',
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 20,
    ]);
    if ($payload !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    }
    $response = curl_exec($ch);
    if ($response === false) {
        $err = curl_error($ch);
        curl_close($ch);
        throw new MoyasarException('تعذر الاتصال ببوابة الدفع: ' . $err);
    }
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $data = json_decode($response, true);
    if ($httpCode >= 400) {
        $msg = $data['message'] ?? ($data['errors'] ?? 'خطأ غير معروف من بوابة الدفع');
        throw new MoyasarException(is_array($msg) ? json_encode($msg) : $msg);
    }
    return $data;
}

function moyasar_create_invoice($pdo, $amount, $description, $callbackUrl, $metadata = []) {
    $currency = get_setting($pdo, 'currency_code', 'SAR');
    $payload = [
        'amount' => (int)round($amount * 100), // smallest currency unit
        'currency' => $currency,
        'description' => $description,
        'callback_url' => $callbackUrl,
        'metadata' => $metadata,
    ];
    return moyasar_request($pdo, 'POST', '/invoices', $payload);
}

function moyasar_fetch_invoice($pdo, $invoiceId) {
    return moyasar_request($pdo, 'GET', '/invoices/' . urlencode($invoiceId));
}
