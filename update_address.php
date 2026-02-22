<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    $stmt = $conn->prepare("UPDATE addresses SET name=?, surname=?, phone=?, address_line=?, apartment=?, zip_code=?, city=?, district=? WHERE id=?");
    $stmt->bind_param("ssssssssi", $data->name, $data->surname, $data->phone, $data->address, $data->apartment, $data->zip, $data->city, $data->district, $data->id);

    if($stmt->execute()) echo json_encode(["success" => true]);
    else echo json_encode(["success" => false, "message" => "Güncelleme hatası"]);
}
?>
