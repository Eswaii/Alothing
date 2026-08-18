<?php
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

$email = $_GET['email'] ?? '';

if($email) {
    $stmt = $conn->prepare("SELECT * FROM contact_messages WHERE email = ? ORDER BY created_at DESC");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $res = $stmt->get_result();

    $messages = [];
    while($row = $res->fetch_assoc()) { $messages[] = $row; }

    echo json_encode(["success" => true, "messages" => $messages]);
} else {
    echo json_encode(["success" => false]);
}
?>
