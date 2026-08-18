<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

$data = json_decode(file_get_contents("php://input"));

if ($data && isset($data->currentEmail) && isset($data->newEmail) && isset($data->password)) {

    // 1. Kullanıcıyı ve Şifresini Çek
    $stmt = $conn->prepare("SELECT id, password FROM users WHERE email = ?");
    $stmt->bind_param("s", $data->currentEmail);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows > 0) {
        $user = $res->fetch_assoc();

        // 2. Mevcut Parola Doğru mu?
        if (password_verify($data->password, $user['password'])) {

            // 3. Yeni E-Posta Başka Birinde Var mı?
            $check_stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
            $check_stmt->bind_param("s", $data->newEmail);
            $check_stmt->execute();
            if ($check_stmt->get_result()->num_rows > 0) {
                echo json_encode(["success" => false, "message" => "Bu e-posta adresi sistemde zaten kayıtlı."]);
            } else {
                // 4. Sorun Yoksa Güncelle
                $upd = $conn->prepare("UPDATE users SET email = ? WHERE id = ?");
                $upd->bind_param("si", $data->newEmail, $user['id']);
                if ($upd->execute()) {
                    echo json_encode(["success" => true]);
                } else {
                    echo json_encode(["success" => false, "message" => "Güncellenemedi."]);
                }
            }
        } else {
            echo json_encode(["success" => false, "message" => "Güvenlik onayı için girdiğiniz mevcut parolanız yanlış."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Kullanıcı bulunamadı."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Lütfen tüm alanları doldurun."]);
}
?>
