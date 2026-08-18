<?php
// CORS İzinleri (Siteye erişim izni)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Veritabanı Bağlantısı
$conn = new mysqli("localhost", "root", "", "alothing_db");

if ($conn->connect_error) {
    die(json_encode(["error" => "Bağlantı hatası"]));
}

// Türkçe Karakter Sorunu İçin
$conn->set_charset("utf8mb4");

// Tüm ürünleri çek ve 'product_stocks' tablosundaki güncel stokları 'real_sizes' olarak yanına ekle
$sql = "SELECT p.*,
        (SELECT GROUP_CONCAT(CONCAT(size, ':', stock_count) SEPARATOR ',')
         FROM product_stocks
         WHERE product_id = p.id) as real_sizes
        FROM products p ORDER BY p.id DESC";

$result = $conn->query($sql);

$products = array();

// MANTIKLI BEDEN SIRALAMASI İÇİN HARİTA (Küçükten Büyüğe)
$size_order_map = [
    'XXS' => 1, 'XS' => 2, 'S' => 3, 'M' => 4, 'L' => 5,
    'XL' => 6, 'XXL' => 7, '2XL' => 7, '3XL' => 8, '4XL' => 9, 'STANDART' => 99
];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {

        if (!empty($row['real_sizes'])) {
            $row['sizes'] = $row['real_sizes'];
        }
        unset($row['real_sizes']);

        $row['category'] = explode(',', $row['category']);
        $row['images'] = explode(',', $row['images']);

        // Bedenleri diziye çevir
        $sizes_array = explode(',', $row['sizes']);

        // 🔥 AKILLI SIRALAMA MOTORU BURADA ÇALIŞIYOR 🔥
        usort($sizes_array, function($a, $b) use ($size_order_map) {
            // "S:0" veya "38:5" formatından sadece beden adını al ve boşlukları temizle
            $sizeA = strtoupper(trim(explode(':', $a)[0]));
            $sizeB = strtoupper(trim(explode(':', $b)[0]));

            // Beden haritada varsa o değeri al. Yoksa ve sayıysa (Örn: 38, 42) sayıyı al. Hiçbiri değilse sona (999) at.
            $valA = isset($size_order_map[$sizeA]) ? $size_order_map[$sizeA] : (is_numeric($sizeA) ? (int)$sizeA : 999);
            $valB = isset($size_order_map[$sizeB]) ? $size_order_map[$sizeB] : (is_numeric($sizeB) ? (int)$sizeB : 999);

            // Değerleri küçükten büyüğe karşılaştır
            return $valA <=> $valB;
        });

        // Sıralanmış diziyi tekrar yerine koy
        $row['sizes'] = $sizes_array;

        $row['price'] = number_format((float)$row['price'], 2, ',', '.') . " TL";
        if(!empty($row['old_price']) && $row['old_price'] > 0) {
            $row['old_price'] = number_format((float)$row['old_price'], 2, ',', '.') . " TL";
        }

        array_push($products, $row);
    }
}

echo json_encode($products);

$conn->close();
?>
