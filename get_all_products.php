<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Veritabanı hatası"]));
}

// Ürünleri çekerken, product_stocks tablosundan o ürüne ait TÜM BEDENLERİN toplam stoğunu topluyoruz.
$sql = "SELECT p.*, COALESCE(SUM(s.stock_count), 0) as total_stock
        FROM products p
        LEFT JOIN product_stocks s ON p.id = s.product_id
        GROUP BY p.id
        ORDER BY p.id DESC";

$result = $conn->query($sql);
$products = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
}

echo json_encode(["success" => true, "products" => $products]);
$conn->close();
?>
