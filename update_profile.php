<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email)) {
    // Veritabanını güncelle
    $stmt = $conn->prepare("UPDATE users SET name=?, surname=?, phone=?, gender=?, tc_no=?, address=?, city=?, district=? WHERE email=?");

    $stmt->bind_param("sssssssss",
        $data->name,
        $data->surname,
        $data->phone,
        $data->gender,
        $data->tc_no,
        $data->address,
        $data->city,
        $data->district,
        $data->email
    );

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Profil güncellendi"]);
    } else {
        echo json_encode(["success" => false, "message" => "SQL Hatası: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Email bilgisi eksik"]);
}
$conn->close();
?>
