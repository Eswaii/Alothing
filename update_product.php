<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) { die(json_encode(["success" => false, "message" => "Veritabanı hatası"])); }

$id = $_POST['id'] ?? '';
$name = $_POST['name'] ?? '';
$ref = $_POST['ref'] ?? '';
$price = $_POST['price'] ?? 0;
$old_price = (!empty($_POST['old_price']) && $_POST['old_price'] > 0) ? $_POST['old_price'] : NULL;
$discount = !empty($_POST['discount']) ? $_POST['discount'] : NULL;
$category = $_POST['category'] ?? '';
$sizes = $_POST['sizes'] ?? '';
$colors = $_POST['colors'] ?? '';
$model_info = $_POST['model_info'] ?? '';
$color_group_id = !empty($_POST['color_group_id']) ? (int)$_POST['color_group_id'] : NULL;
$existing_images = $_POST['existing_images'] ?? '';

if(empty($id)) { die(json_encode(["success" => false, "message" => "ID bulunamadı."])); }

$uploaded_images = [];
$upload_errors = [];

if (!empty($existing_images)) {
    $uploaded_images = explode(",", $existing_images);
    $uploaded_images = array_map('trim', $uploaded_images);
}

$target_dir = __DIR__ . "/images/urunler/";
if (!file_exists($target_dir)) { mkdir($target_dir, 0777, true); }

// 🚀 OTOMATİK ARTAN SAYI MANTIĞI
$next_num = 1;
$files = scandir($target_dir);
foreach ($files as $file) {
    $name_only = pathinfo($file, PATHINFO_FILENAME);
    if (is_numeric($name_only)) {
        if ((int)$name_only >= $next_num) {
            $next_num = (int)$name_only + 1;
        }
    }
}

if (isset($_FILES['images']) && !empty($_FILES['images']['name'][0])) {
    $count = count($_FILES['images']['name']);
    for ($i = 0; $i < $count; $i++) {
        $error_code = $_FILES['images']['error'][$i];
        $file_name = $_FILES['images']['name'][$i];

        if ($error_code === UPLOAD_ERR_OK) {
            $tmp_name = $_FILES['images']['tmp_name'][$i];
            $ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

            // SADECE SAYI OLARAK İSİMLENDİR
            $new_name = $next_num . "." . $ext;
            $target_file = $target_dir . $new_name;

            if (move_uploaded_file($tmp_name, $target_file)) {
                $uploaded_images[] = "images/urunler/" . $new_name;
                $next_num++;
            } else {
                $upload_errors[] = "$file_name taşınamadı.";
            }
        } else {
            if ($error_code == 1) $upload_errors[] = "$file_name (2MB) çok büyük!";
            else $upload_errors[] = "$file_name Hata: $error_code";
        }
    }
}

$uploaded_images = array_filter($uploaded_images);
$images_str = implode(",", $uploaded_images);

$stmt = $conn->prepare("UPDATE products SET name=?, ref=?, category=?, price=?, old_price=?, discount=?, images=?, sizes=?, colors=?, model_info=?, color_group_id=? WHERE id=?");
$stmt->bind_param("sssssssssssi", $name, $ref, $category, $price, $old_price, $discount, $images_str, $sizes, $colors, $model_info, $color_group_id, $id);

if($stmt->execute()) {
    $msg = "Ürün başarıyla güncellendi!";
    if(count($upload_errors) > 0) $msg .= "\n\nHatalar:\n" . implode("\n", $upload_errors);
    echo json_encode(["success" => true, "message" => $msg]);
} else {
    echo json_encode(["success" => false, "message" => "SQL Hatası: " . $stmt->error]);
}
$conn->close();
?>
