<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
session_start();

// Hata mesajlarını görmek istiyorsak (Geliştirici modu):
error_reporting(E_ALL);
ini_set('display_errors', 1);

$conn = new mysqli("localhost", "root", "", "alothing_db");
if ($conn->connect_error) { die(json_encode(["success" => false, "message" => "Bağlantı hatası"])); }

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {

    // KESİN ÇÖZÜM: * ile kullanıcının tüm bilgilerini çekiyoruz
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $data->email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        if (password_verify($data->password, $user['password'])) {

            // Eğer veritabanında role sütunu yoksa, varsayılan olarak "user" ata
            $userRole = isset($user['role']) ? $user['role'] : 'user';

            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['full_name'];
            $_SESSION['user_role'] = $userRole;

            // JavaScript'e gidecek OLAN PAKET!
            echo json_encode([
                "success" => true,
                "message" => "Giriş başarılı!",
                "user" => [
                    "id" => $user['id'],
                    "name" => $user['full_name'],
                    "email" => $user['email'],
                    "role" => $userRole // İşte aradığımız değer bu!
                ]
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Hatalı şifre!"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Kullanıcı bulunamadı."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "E-posta ve şifre giriniz."]);
}
$conn->close();
?>
