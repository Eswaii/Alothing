<?php
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Tüm yorumları ürün adıyla birlikte çek
    $sql = "SELECT c.*, p.name as product_name FROM product_comments c LEFT JOIN products p ON c.product_id = p.id ORDER BY c.created_at DESC";
    $res = $conn->query($sql);
    $comments = [];
    while($row = $res->fetch_assoc()) { $comments[] = $row; }
    echo json_encode(["success" => true, "comments" => $comments]);
}
elseif ($method === 'POST') {
    // Yorumun durumunu güncelle (Onayla / Reddet)
    $data = json_decode(file_get_contents("php://input"));
    if($data && isset($data->id) && isset($data->status)) {
        $stmt = $conn->prepare("UPDATE product_comments SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $data->status, $data->id);
        if($stmt->execute()) echo json_encode(["success" => true]);
        else echo json_encode(["success" => false, "message" => "Güncellenemedi."]);
    }
}
?>
