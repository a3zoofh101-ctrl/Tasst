<?php
/**
 * Public JSON API — standard SMM-panel style contract:
 * actions: balance, services, add, status
 * Authenticated via `key` (user's api_key), sent as POST (or GET) data.
 */
require_once __DIR__ . '/../../config/config.php';

header('Content-Type: application/json; charset=utf-8');

function api_error($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

$input = array_merge($_GET, $_POST);
$key = trim($input['key'] ?? '');
$action = trim($input['action'] ?? '');

if (!$key) {
    api_error('API key is required.', 401);
}

$stmt = $pdo->prepare('SELECT * FROM users WHERE api_key = ? LIMIT 1');
$stmt->execute([$key]);
$apiUser = $stmt->fetch();

if (!$apiUser) {
    api_error('Invalid API key.', 401);
}
if ($apiUser['status'] === 'banned') {
    api_error('Account is suspended.', 403);
}

switch ($action) {
    case 'balance':
        echo json_encode([
            'balance' => number_format((float)$apiUser['balance'], 2, '.', ''),
            'currency' => get_setting($pdo, 'currency_code', 'SAR'),
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'services':
        $rows = $pdo->query("SELECT s.id, s.name, c.name AS category, s.rate_per_1000 AS rate, s.min_qty AS min, s.max_qty AS max, s.service_type AS type
            FROM services s JOIN categories c ON c.id = s.category_id WHERE s.status = 'active' ORDER BY s.id")->fetchAll();
        echo json_encode($rows, JSON_UNESCAPED_UNICODE);
        break;

    case 'add':
        $serviceId = (int)($input['service'] ?? 0);
        $link = trim($input['link'] ?? '');
        $quantity = (int)($input['quantity'] ?? 0);

        $svcStmt = $pdo->prepare("SELECT * FROM services WHERE id = ? AND status = 'active'");
        $svcStmt->execute([$serviceId]);
        $svc = $svcStmt->fetch();

        if (!$svc) api_error('Service not found.');
        if (!$link) api_error('Link is required.');
        if ($quantity < (int)$svc['min_qty'] || $quantity > (int)$svc['max_qty']) {
            api_error('Quantity must be between ' . $svc['min_qty'] . ' and ' . $svc['max_qty'] . '.');
        }

        $charge = round(((float)$svc['rate_per_1000'] / 1000) * $quantity, 2);
        if ((float)$apiUser['balance'] < $charge) {
            api_error('Insufficient balance.', 402);
        }

        try {
            wallet_adjust($pdo, $apiUser['id'], -$charge, 'order', 'API order: ' . $svc['name']);
            $ins = $pdo->prepare('INSERT INTO orders (user_id, service_id, link, quantity, charge, status) VALUES (?, ?, ?, ?, ?, "pending")');
            $ins->execute([$apiUser['id'], $svc['id'], $link, $quantity, $charge]);
            echo json_encode(['order' => $pdo->lastInsertId()], JSON_UNESCAPED_UNICODE);
        } catch (Exception $ex) {
            api_error('Order could not be processed.', 500);
        }
        break;

    case 'status':
        $orderId = (int)($input['order'] ?? 0);
        $o = $pdo->prepare('SELECT id, status, quantity, remains, start_count, charge FROM orders WHERE id = ? AND user_id = ?');
        $o->execute([$orderId, $apiUser['id']]);
        $order = $o->fetch();
        if (!$order) api_error('Order not found.');
        echo json_encode([
            'charge' => number_format((float)$order['charge'], 2, '.', ''),
            'start_count' => $order['start_count'],
            'status' => $order['status'],
            'remains' => $order['remains'],
        ], JSON_UNESCAPED_UNICODE);
        break;

    default:
        api_error('Unknown action. Supported actions: balance, services, add, status');
}
