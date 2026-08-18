<?php
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

$data = json_decode(file_get_contents("php://input"));

if ($data && isset($data->order_id)) {
    // Statüyü ve nedeni güncelle
    $stmt = $conn->prepare("UPDATE orders SET status = ?, cancel_reason = ? WHERE id = ?");
    $stmt->bind_param("ssi", $data->status, $data->reason, $data->order_id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Hata oluştu."]);
    }
}
?>
