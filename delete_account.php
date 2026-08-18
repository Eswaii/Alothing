<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

$data = json_decode(file_get_contents("php://input"));

if ($data && isset($data->email)) {
    // Kullanıcıyı E-postasına göre veritabanından tamamen sil
    $stmt = $conn->prepare("DELETE FROM users WHERE email = ?");
    $stmt->bind_param("s", $data->email);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Hesap silinirken bir hata oluştu."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Eksik bilgi."]);
}
?>
