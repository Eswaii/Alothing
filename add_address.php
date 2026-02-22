<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4"); // Türkçe karakter desteği
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email)) {
    $stmt = $conn->prepare("INSERT INTO addresses (user_email, name, surname, phone, address_line, apartment, zip_code, city, district) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssss", $data->email, $data->name, $data->surname, $data->phone, $data->address, $data->apartment, $data->zip, $data->city, $data->district);

    if($stmt->execute()) echo json_encode(["success" => true]);
    else echo json_encode(["success" => false, "message" => "Kayıt hatası"]);
} else {
    echo json_encode(["success" => false, "message" => "Oturum hatası"]);
}
?>
