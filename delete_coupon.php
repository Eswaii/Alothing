<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->id)) {
    $stmt = $conn->prepare("DELETE FROM coupons WHERE id=?");
    $stmt->bind_param("i", $data->id);
    if($stmt->execute()) echo json_encode(["success" => true]);
    else echo json_encode(["success" => false, "message" => "Silinirken hata oluştu."]);
} else {
    echo json_encode(["success" => false, "message" => "Eksik veri"]);
}
$conn->close();
?>
