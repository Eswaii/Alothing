<?php
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");
$email = $_GET['email'];

if ($email) {
    // Tüm sütunları çek
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        // Şifreyi gönderme (Güvenlik)
        unset($row['password']);
        echo json_encode(["success" => true, "data" => $row]);
    } else {
        echo json_encode(["success" => false]);
    }
}
?>
