<?php
header("Content-Type: application/json; charset=UTF-8"); // Charset Eklendi
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4"); // Türkçe Karakter Desteği

$email = $_GET['email'];

if($email) {
    $stmt = $conn->prepare("SELECT * FROM addresses WHERE user_email = ? ORDER BY id DESC");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    $addresses = [];
    while($row = $result->fetch_assoc()) {
        $addresses[] = $row;
    }
    echo json_encode($addresses);
} else {
    echo json_encode([]);
}
?>
