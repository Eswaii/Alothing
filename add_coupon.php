<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) { die(json_encode(["success" => false, "message" => "Veritabanı hatası"])); }

$code = strtoupper(trim($_POST['code'] ?? ''));
$discount_type = $_POST['discount_type'] ?? 'percent';
$discount_value = $_POST['discount_value'] ?? 0;
$min_cart_amount = $_POST['min_cart_amount'] ?? 0;

if(empty($code) || empty($discount_value)) {
    die(json_encode(["success" => false, "message" => "Kupon kodu ve indirim değeri zorunludur."]));
}

$stmt = $conn->prepare("INSERT INTO coupons (code, discount_type, discount_value, min_cart_amount) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssdd", $code, $discount_type, $discount_value, $min_cart_amount);

if($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Kupon başarıyla oluşturuldu."]);
} else {
    // Eğer aynı koddan zaten varsa SQL 1062 hatası verir
    if($conn->errno === 1062) echo json_encode(["success" => false, "message" => "Bu kupon kodu zaten mevcut!"]);
    else echo json_encode(["success" => false, "message" => "Hata: " . $stmt->error]);
}
$conn->close();
?>
