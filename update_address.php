<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");
$data = json_decode(file_get_contents("php://input"));

$stmt = $conn->prepare("UPDATE addresses SET address_title=?, name=?, surname=?, phone=?, address_line=?, zip_code=?, city=?, district=? WHERE id=?");
$stmt->bind_param("ssssssssi", $data->title, $data->name, $data->surname, $data->phone, $data->address, $data->zip, $data->city, $data->district, $data->id);
echo json_encode(["success" => $stmt->execute()]);
?>
