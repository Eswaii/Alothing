<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$data = json_decode(file_get_contents("php://input"));

// Hesabı Sil
$stmt = $conn->prepare("DELETE FROM users WHERE email = ?");
$stmt->bind_param("s", $data->email);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Silme hatası."]);
}
?>
