<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    echo json_encode(["error" => "Veritabanı bağlantı hatası."]);
    exit;
}

$code = isset($_GET['code']) ? trim($_GET['code']) : '';

if (empty($code)) {
    echo json_encode(['error' => 'Lütfen bir kargo takip kodu girin.']);
    exit;
}

// Sipariş detaylarını da çekecek şekilde SQL sorgusunu genişlettik
$stmt = $conn->prepare("SELECT order_code, status, created_at, order_city, order_district, order_name, order_surname FROM orders WHERE tracking_code = ?");
if ($stmt) {
    $stmt->bind_param("s", $code);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $order = $result->fetch_assoc();
        echo json_encode([
            'success' => true,
            'status' => $order['status'],
            'date' => $order['created_at'],
            'order_code' => $order['order_code'],
            'recipient' => trim($order['order_name'] . ' ' . $order['order_surname']),
            'destination_city' => $order['order_city'],
            'destination_district' => $order['order_district'],
            'origin' => 'İstanbul, Merkez Depo' // Varsayılan çıkış noktası
        ]);
    } else {
        echo json_encode(['error' => 'Bu kargo takip koduna ait sipariş bulunamadı. Veya kod hatalı.']);
    }
    $stmt->close();
} else {
    echo json_encode(["error" => "Sorgu hazırlanırken hata oluştu."]);
}

$conn->close();
?>
