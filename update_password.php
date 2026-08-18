<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

$data = json_decode(file_get_contents("php://input"));

if ($data && isset($data->email) && isset($data->currentPass) && isset($data->newPass)) {
    $email = $data->email;
    $currentPass = $data->currentPass;
    $newPass = $data->newPass;

    // Arka Planda Şifre Kuralı Kontrolü (Güvenlik için PHP'de de yaparız)
    if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/', $newPass)) {
        echo json_encode(["success" => false, "message" => "Şifre güvenlik kurallarına uymuyor."]);
        exit;
    }

    // Kullanıcının mevcut şifresini veritabanından çek
    $stmt = $conn->prepare("SELECT id, password FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Mevcut şifre doğru mu kontrol et
        if (password_verify($currentPass, $user['password'])) {
            // Doğruysa yeni şifreyi kriptola ve güncelle
            $hashed_new = password_hash($newPass, PASSWORD_DEFAULT);
            $update_stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
            $update_stmt->bind_param("si", $hashed_new, $user['id']);

            if ($update_stmt->execute()) {
                echo json_encode(["success" => true]);
            } else {
                echo json_encode(["success" => false, "message" => "Şifre güncellenemedi."]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Mevcut parolanızı yanlış girdiniz."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Kullanıcı bulunamadı."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Eksik bilgi."]);
}
?>
