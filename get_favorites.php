<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$email = $_GET['email'] ?? '';
$favs = [];

if($email) {
    $res = $conn->query("SELECT product_id FROM favorites WHERE email='$email'");
    if($res) {
        while($row = $res->fetch_assoc()) {
            $favs[] = $row['product_id'];
        }
    }
}
echo json_encode(["success"=>true, "favorites"=>$favs]);
$conn->close();
?>
