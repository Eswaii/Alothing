<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    $stmt = $conn->prepare("DELETE FROM addresses WHERE id=?");
    $stmt->bind_param("i", $data->id);
    if($stmt->execute()) echo json_encode(["success" => true]);
    else echo json_encode(["success" => false]);
}
?>
