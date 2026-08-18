<?php
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->product_id) && isset($data->user_email) && isset($data->comment) && isset($data->rating)) {
    $stmt = $conn->prepare("INSERT INTO product_comments (product_id, user_email, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("issis", $data->product_id, $data->user_email, $data->user_name, $data->rating, $data->comment);

    if($stmt->execute()) echo json_encode(["success" => true]);
    else echo json_encode(["success" => false, "message" => "Yorum kaydedilemedi."]);
} else {
    echo json_encode(["success" => false, "message" => "Eksik bilgi."]);
}
?>
