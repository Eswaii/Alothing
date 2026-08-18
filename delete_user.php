<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) { die(json_encode(["success" => false, "message" => "Veritabanı hatası"])); }

$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->id)) {
    // Silme sorgusu
    $stmt = $conn->prepare("DELETE FROM users WHERE id=?");
    $stmt->bind_param("i", $data->id);

    if($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Kullanıcı başarıyla silindi."]);
    } else {
        echo json_encode(["success" => false, "message" => "Hata: " . $stmt->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Eksik veri"]);
}
$conn->close();
?>
