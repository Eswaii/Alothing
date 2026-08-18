<?php
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) { die(json_encode(["success" => false, "message" => "Bağlantı hatası"])); }

// 1. Mevcut tüm ürünleri çek
$products = $conn->query("SELECT id, sizes FROM products");
$inserted_count = 0;

while ($product = $products->fetch_assoc()) {
    $product_id = $product['id'];
    $sizes_str = $product['sizes']; // Örn: "S:10, M:0, L:5" veya "S, M, L"

    if (empty($sizes_str)) continue;

    // Virgüllere göre ayır
    $size_array = explode(',', $sizes_str);

    foreach ($size_array as $size_item) {
        $size_item = trim($size_item);
        $size_name = "";
        $stock_count = 0;

        if (strpos($size_item, ':') !== false) {
            // "S:10" formatındaysa parçala
            $parts = explode(':', $size_item);
            $size_name = trim($parts[0]);
            $stock_count = (int)trim($parts[1]);
        } else {
            // Sadece "S" yazılmışsa varsayılan 0 veya 100 yapabilirsin
            $size_name = $size_item;
            $stock_count = 0;
        }

        if (empty($size_name)) continue;

        // 2. product_stocks tablosuna ekle (Varsa güncelleme, yoksa ekle - ON DUPLICATE KEY)
        $stmt = $conn->prepare("INSERT INTO product_stocks (product_id, size, stock_count)
                                VALUES (?, ?, ?)
                                ON DUPLICATE KEY UPDATE stock_count = VALUES(stock_count)");
        $stmt->bind_param("isi", $product_id, $size_name, $stock_count);
        $stmt->execute();
        $inserted_count++;
    }
}

echo json_encode([
    "success" => true,
    "message" => "Senkronizasyon tamamlandı!",
    "total_rows" => $inserted_count
]);

$conn->close();
?>
