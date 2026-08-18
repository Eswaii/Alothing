<?php
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");
$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->id) && isset($data->reply)) {
    $stmt = $conn->prepare("UPDATE contact_messages SET admin_reply=?, reply_date=CURRENT_TIMESTAMP, status='Cevaplandı' WHERE id=?");
    $stmt->bind_param("si", $data->reply, $data->id);
    if($stmt->execute()) echo json_encode(["success" => true]);
    else echo json_encode(["success" => false, "message" => "Hata oluştu."]);
} else {
    echo json_encode(["success" => false, "message" => "Eksik veri."]);
}
?>
