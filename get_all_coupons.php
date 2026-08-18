<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) { die(json_encode(["success" => false, "message" => "Veritabanı hatası"])); }

$result = $conn->query("SELECT * FROM coupons ORDER BY created_at DESC");
$coupons = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) { $coupons[] = $row; }
}

echo json_encode(["success" => true, "coupons" => $coupons]);
$conn->close();
?>
