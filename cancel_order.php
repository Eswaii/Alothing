<?php
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

$data = json_decode(file_get_contents("php://input"));

// Eksik veri kontrolü
if (!$data || empty($data->order_id) || empty($data->email)) {
    echo json_encode(["success" => false, "message" => "Eksik veri gönderildi."]);
    exit;
}

// Siparişin durumunu İptal Edildi olarak güncelliyoruz
$status = "İptal Edildi";

// Güvenlik için siparişin o kişiye ait olduğunu email ile doğruluyoruz
$stmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ? AND user_email = ?");
$stmt->bind_param("sis", $status, $data->order_id, $data->email);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Sipariş başarıyla iptal edildi."]);
} else {
    echo json_encode(["success" => false, "message" => "İşlem başarısız oldu: " . $conn->error]);
}
?>
