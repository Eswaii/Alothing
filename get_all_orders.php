<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Veritabanı hatası"]));
}

// Bütün siparişleri en yeniden eskiye doğru çek
$sql = "SELECT * FROM orders ORDER BY created_at DESC";
$result = $conn->query($sql);

$orders = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Ürünleri JSON formatından diziye çevir
        $row['items'] = json_decode(stripslashes($row['items']), true);
        if (is_string($row['items'])) {
            $row['items'] = json_decode($row['items'], true);
        }
        $orders[] = $row;
    }
}

echo json_encode(["success" => true, "orders" => $orders]);
$conn->close();
?>
