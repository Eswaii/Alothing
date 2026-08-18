<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) { die(json_encode(["success" => false, "message" => "Veritabanı hatası"])); }

$data = json_decode(file_get_contents("php://input"));
$code = isset($data->code) ? strtoupper(trim($data->code)) : '';

if(empty($code)) {
    die(json_encode(["success" => false, "message" => "Lütfen bir kupon kodu girin."]));
}

$stmt = $conn->prepare("SELECT * FROM coupons WHERE code = ?");
$stmt->bind_param("s", $code);
$stmt->execute();
$result = $stmt->get_result();

if($row = $result->fetch_assoc()) {
    echo json_encode([
        "success" => true,
        "coupon" => [
            "code" => $row['code'],
            "type" => $row['discount_type'],
            "value" => (float)$row['discount_value'],
            "min_amount" => (float)$row['min_cart_amount']
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Geçersiz veya süresi dolmuş kupon kodu."]);
}

$conn->close();
?>
