<?php
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

$product_id = $_GET['id'] ?? 0;

if($product_id) {
    // SADECE STATUS = 'onaylandi' OLANLARI ÇEK
    $res = $conn->query("SELECT user_name, rating, comment, created_at FROM product_comments WHERE product_id = $product_id AND status = 'onaylandi' ORDER BY created_at DESC");
    $comments = [];
    $totalRating = 0;

    while($row = $res->fetch_assoc()) {
        $comments[] = $row;
        $totalRating += $row['rating'];
    }

    $avgRating = count($comments) > 0 ? round($totalRating / count($comments), 1) : 0;

    echo json_encode(["success" => true, "comments" => $comments, "avgRating" => $avgRating]);
} else {
    echo json_encode(["success" => false]);
}
?>
