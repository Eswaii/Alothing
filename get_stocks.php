<?php
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

// Stokları ürün isimleriyle beraber çekiyoruz
$sql = "SELECT s.*, p.name as product_name, p.images as product_image, p.ref as product_ref
        FROM product_stocks s
        JOIN products p ON s.product_id = p.id
        ORDER BY p.id DESC";

$result = $conn->query($sql);
$stocks = [];
while($row = $result->fetch_assoc()) { $stocks[] = $row; }

echo json_encode($stocks);
$conn->close();
?>
