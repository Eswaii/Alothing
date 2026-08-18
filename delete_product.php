<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) { die(json_encode(["success" => false, "message" => "Veritabanı hatası"])); }

$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->id)) {

    // 1. Önce ürünün resimlerini bulalım ki klasörden silelim (Sunucuda yer kaplamasın)
    $stmt = $conn->prepare("SELECT images FROM products WHERE id=?");
    $stmt->bind_param("i", $data->id);
    $stmt->execute();
    $result = $stmt->get_result();

    if($row = $result->fetch_assoc()) {
        if(!empty($row['images'])) {
            $images = explode(",", $row['images']);
            foreach($images as $img) {
                // Resmi fiziksel olarak klasörden sil
                $img_path = __DIR__ . "/" . trim($img);
                if(file_exists($img_path)) {
                    unlink($img_path);
                }
            }
        }
    }

    // 2. Şimdi veritabanından silelim
    $stmt = $conn->prepare("DELETE FROM products WHERE id=?");
    $stmt->bind_param("i", $data->id);

    if($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Ürün ve fotoğrafları tamamen silindi."]);
    } else {
        echo json_encode(["success" => false, "message" => "Hata: " . $stmt->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Eksik veri"]);
}
$conn->close();
?>
