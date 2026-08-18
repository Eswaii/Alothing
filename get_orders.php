<?php
// Hataları raporla
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "DB Hatası: " . $conn->connect_error]));
}

// E-postayı al ve temizle
$email = isset($_GET['email']) ? trim($_GET['email']) : '';

if ($email) {
    // Veritabanında bu emaile sahip kaç sipariş var önce ona bakalım
    $check = $conn->prepare("SELECT COUNT(*) as count FROM orders WHERE user_email = ?");
    $check->bind_param("s", $email);
    $check->execute();
    $countResult = $check->get_result()->fetch_assoc();
    $orderCount = $countResult['count'];

    // Siparişleri çek
    $stmt = $conn->prepare("SELECT * FROM orders WHERE user_email = ? ORDER BY created_at DESC");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $raw_items = $row['items'];
        $clean_items = stripslashes($raw_items);
        $decoded_items = json_decode($clean_items, true);

        if (is_string($decoded_items)) {
            $decoded_items = json_decode($decoded_items, true);
        }

        $row['items'] = is_array($decoded_items) ? $decoded_items : [];
        $orders[] = $row;
    }

    echo json_encode([
        "success" => true,
        "orders" => $orders,
        "debug_email" => $email,
        "debug_count" => $orderCount
    ]);
} else {
    echo json_encode(["success" => false, "message" => "E-posta parametresi gelmedi."]);
}
?>
