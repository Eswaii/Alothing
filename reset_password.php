<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

$data = json_decode(file_get_contents("php://input"));

if ($data && isset($data->token) && isset($data->password)) {
    $token = $data->token;
    $new_password = password_hash($data->password, PASSWORD_DEFAULT); // Şifreyi şifrele

    $current_time = date("Y-m-d H:i:s");

    // Token doğru mu ve süresi geçmemiş mi kontrol et
    $stmt = $conn->prepare("SELECT id FROM users WHERE reset_token = ? AND reset_expires > ?");
    $stmt->bind_param("ss", $token, $current_time);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Şifreyi Güncelle ve Token'ı temizle
        $update_stmt = $conn->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?");
        $update_stmt->bind_param("si", $new_password, $user['id']);

        if ($update_stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => "Şifre güncellenirken bir hata oluştu."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Bağlantının süresi dolmuş veya geçersiz."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Eksik bilgi."]);
}
?>
