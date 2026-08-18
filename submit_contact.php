<?php
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->name) && isset($data->email) && isset($data->message)) {
    $stmt = $conn->prepare("INSERT INTO contact_messages (name, email, order_no, message) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $data->name, $data->email, $data->order_no, $data->message);

    if($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Mesaj kaydedildi."]);
    } else {
        echo json_encode(["success" => false, "message" => "Hata oluştu."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Eksik bilgi girdiniz."]);
}
?>
