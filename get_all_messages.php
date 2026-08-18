<?php
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

$res = $conn->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
$messages = [];
while($row = $res->fetch_assoc()) { $messages[] = $row; }

echo json_encode(["success" => true, "messages" => $messages]);
?>
