<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$data = json_decode(file_get_contents("php://input"));

// 1. Mevcut Şifreyi Kontrol Et
$stmt = $conn->prepare("SELECT password FROM users WHERE email = ?");
$stmt->bind_param("s", $data->currentEmail);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();

if ($user && password_verify($data->password, $user['password'])) {
    // 2. Yeni Email Başkasında Var mı?
    $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $check->bind_param("s", $data->newEmail);
    $check->execute();
    if($check->get_result()->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Bu e-posta zaten kullanımda."]);
    } else {
        // 3. Güncelle
        $update = $conn->prepare("UPDATE users SET email = ? WHERE email = ?");
        $update->bind_param("ss", $data->newEmail, $data->currentEmail);
        if($update->execute()) echo json_encode(["success" => true]);
        else echo json_encode(["success" => false, "message" => "Hata oluştu."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Mevcut parola yanlış."]);
}
?>
