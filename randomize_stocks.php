<?php
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) { die(json_encode(["success" => false, "message" => "Bağlantı hatası"])); }

// Tüm mevcut stok satırlarını çek
$result = $conn->query("SELECT id FROM product_stocks");
$updated_count = 0;

while ($row = $result->fetch_assoc()) {
    $stock_id = $row['id'];
    $random_stock = rand(0, 10); // 0 ile 10 arası rastgele sayı üret

    $stmt = $conn->prepare("UPDATE product_stocks SET stock_count = ? WHERE id = ?");
    $stmt->bind_param("ii", $random_stock, $stock_id);
    $stmt->execute();
    $updated_count++;
}

echo json_encode([
    "success" => true,
    "message" => "Harika! Toplam $updated_count farklı bedene 0 ile 10 arası rastgele stok atandı."
]);

$conn->close();
?>
