<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");
$data = json_decode(file_get_contents("php://input"));

$stmt = $conn->prepare("INSERT INTO addresses (user_email, address_title, name, surname, phone, address_line, zip_code, city, district) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssssss", $data->email, $data->title, $data->name, $data->surname, $data->phone, $data->address, $data->zip, $data->city, $data->district);
echo json_encode(["success" => $stmt->execute()]);
?>
