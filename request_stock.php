<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->email) && isset($data->product_id) && isset($data->size)) {
    // Aynı kişi, aynı ürün ve beden için zaten talep oluşturmuş mu?
    $check = $conn->prepare("SELECT id FROM stock_requests WHERE user_email=? AND product_id=? AND size=? AND status='Bekliyor'");
    $check->bind_param("sis", $data->email, $data->product_id, $data->size);
    $check->execute();
    if($check->get_result()->num_rows > 0) {
        die(json_encode(["success" => false, "message" => "Bu ürün için zaten haber ver talebiniz bulunuyor."]));
    }

    // Yeni talebi kaydet
    $stmt = $conn->prepare("INSERT INTO stock_requests (user_email, product_id, size) VALUES (?, ?, ?)");
    $stmt->bind_param("sis", $data->email, $data->product_id, $data->size);

    if($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Talebiniz alındı! Stok güncellendiğinde {$data->email} adresine mail göndereceğiz."]);
    } else {
        echo json_encode(["success" => false, "message" => "Hata oluştu."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Eksik bilgi."]);
}
?>
