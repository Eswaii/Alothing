<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");

$data = json_decode(file_get_contents("php://input"));
$email = $data->email ?? '';
$product_id = $data->product_id ?? 0;

if($email && $product_id) {
    $check = $conn->query("SELECT id FROM favorites WHERE email='$email' AND product_id=$product_id");
    if($check->num_rows > 0) {
        $conn->query("DELETE FROM favorites WHERE email='$email' AND product_id=$product_id");
        echo json_encode(["success"=>true, "action"=>"removed"]);
    } else {
        $conn->query("INSERT INTO favorites (email, product_id) VALUES ('$email', $product_id)");
        echo json_encode(["success"=>true, "action"=>"added"]);
    }
} else {
    echo json_encode(["success"=>false, "message"=>"Eksik veri"]);
}
$conn->close();
?>
