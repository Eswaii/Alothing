<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Veritabanı hatası"]));
}

// Müşterileri en son kayıt olandan başlayarak çekiyoruz (Şifreleri GÜVENLİK için çekmiyoruz)
$sql = "SELECT id, name, surname, email, phone, role, created_at FROM users ORDER BY created_at DESC";
$result = $conn->query($sql);

$users = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
}

echo json_encode(["success" => true, "users" => $users]);
$conn->close();
?>
