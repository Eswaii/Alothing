<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$data = json_decode(file_get_contents("php://input"));

// 1. Mevcut Şifreyi Kontrol Et
$stmt = $conn->prepare("SELECT password FROM users WHERE email = ?");
$stmt->bind_param("s", $data->email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if ($user && password_verify($data->currentPassword, $user['password'])) {
    // 2. Yeni Şifreyi Hashle ve Güncelle
    $newHash = password_hash($data->newPassword, PASSWORD_DEFAULT);
    $update = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
    $update->bind_param("ss", $newHash, $data->email);

    if($update->execute()) echo json_encode(["success" => true]);
    else echo json_encode(["success" => false, "message" => "Hata oluştu."]);
} else {
    echo json_encode(["success" => false, "message" => "Mevcut parola yanlış."]);
}
?>
