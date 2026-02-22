<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
session_start(); // Oturum başlat

$conn = new mysqli("localhost", "root", "", "alothing_db");
if ($conn->connect_error) { die(json_encode(["success" => false, "message" => "Bağlantı hatası"])); }

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {

    // Kullanıcıyı bul
    $stmt = $conn->prepare("SELECT id, full_name, password FROM users WHERE email = ?");
    $stmt->bind_param("s", $data->email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Şifre Doğrulama
        if (password_verify($data->password, $user['password'])) {

            // Session'a kaydet (Oturum açık kalsın)
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['full_name'];

            echo json_encode([
                "success" => true,
                "message" => "Giriş başarılı!",
                "user" => ["name" => $user['full_name']]
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
