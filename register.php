<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "alothing_db");
if ($conn->connect_error) { die(json_encode(["success" => false, "message" => "Veritabanı hatası"])); }

// POST verisini al
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && !empty($data->email) && !empty($data->password)) {

    // E-posta kontrolü (Daha önce kayıtlı mı?)
    $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $check->bind_param("s", $data->email);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Bu e-posta zaten kayıtlı."]);
    } else {
        // Kayıt İşlemi
        $stmt = $conn->prepare("INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)");

        // Şifreyi Hashle (Güvenlik İçin)
        $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);

        $stmt->bind_param("sss", $data->name, $data->email, $hashed_password);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Kayıt başarılı! Giriş yapabilirsiniz."]);
        } else {
            echo json_encode(["success" => false, "message" => "Kayıt sırasında hata oluştu."]);
        }
    }
} else {
    echo json_encode(["success" => false, "message" => "Lütfen tüm alanları doldurun."]);
}
$conn->close();
?>
