<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) { die(json_encode(["success" => false, "message" => "Veritabanı hatası"])); }

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

if(empty($name) || empty($price)) {
    die(json_encode(["success" => false, "message" => "Ürün adı ve fiyat boş olamaz."]));
}

$uploaded_images = [];
$upload_errors = [];

// KLASÖR YOLU
$target_dir = __DIR__ . "/images/urunler/";
if (!file_exists($target_dir)) { mkdir($target_dir, 0777, true); }

if (!empty($_FILES['images']['name'][0])) {
    foreach ($_FILES['images']['name'] as $key => $file_name) {
        $tmp_name = $_FILES['images']['tmp_name'][$key];
        $error_code = $_FILES['images']['error'][$key];

        if ($error_code == 0) {
            $ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
            $new_name = uniqid("urun_") . "_" . time() . "." . $ext;
            $target_file = $target_dir . $new_name;

            if (move_uploaded_file($tmp_name, $target_file)) {
                $uploaded_images[] = "images/urunler/" . $new_name;
            } else {
                $upload_errors[] = "$file_name klasöre kopyalanamadı!";
            }
        } else {
            if ($error_code == 1) $upload_errors[] = "$file_name boyutu çok büyük!";
            else $upload_errors[] = "$file_name yüklenemedi. Hata Kodu: $error_code";
        }
    }
}

$images_str = implode(",", $uploaded_images);

$stmt = $conn->prepare("INSERT INTO products (name, ref, category, price, old_price, discount, images, sizes, colors, model_info, color_group_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssssssssi", $name, $ref, $category, $price, $old_price, $discount, $images_str, $sizes, $colors, $model_info, $color_group_id);

if($stmt->execute()) {
    $new_product_id = $conn->insert_id;

    // ==========================================
    // YENİ ÜRÜNÜN BEDENLERİNİ STOK TABLOSUNA EKLE
    // ==========================================
    if(!empty($sizes)) {
        $sizes_arr = explode(',', $sizes);
        foreach($sizes_arr as $s) {
            $s = trim($s);
            if(empty($s)) continue;

            $s_name = $s;
            $s_count = 0;

            // Eğer admin S:15, M:2 şeklinde girmişse ayırıyoruz
            if(strpos($s, ':') !== false) {
                $p = explode(':', $s);
                $s_name = trim($p[0]);
                $s_count = (int)$p[1];
            }

            $st_stmt = $conn->prepare("INSERT INTO product_stocks (product_id, size, stock_count) VALUES (?, ?, ?)");
            $st_stmt->bind_param("isi", $new_product_id, $s_name, $s_count);
            $st_stmt->execute();
        }
    }
    // ==========================================

    $msg = count($upload_errors) > 0 ? "Resim Hataları: " . implode(" ", $upload_errors) : "Başarılı";
    echo json_encode(["success" => true, "message" => $msg]);
} else {
    echo json_encode(["success" => false, "message" => "Kayıt Hatası: " . $stmt->error]);
}
?>
