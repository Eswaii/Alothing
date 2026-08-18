<?php
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");

$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->id) && isset($data->count)) {
    $stmt = $conn->prepare("UPDATE product_stocks SET stock_count = ? WHERE id = ?");
    $stmt->bind_param("ii", $data->count, $data->id);

    if($stmt->execute()) echo json_encode(["success" => true]);
    else echo json_encode(["success" => false, "message" => $conn->error]);
} else {
    echo json_encode(["success" => false, "message" => "Eksik veri"]);
}
?>
