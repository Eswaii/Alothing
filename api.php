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

// Tüm ürünleri çek
$sql = "SELECT * FROM products";
$result = $conn->query($sql);

$products = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Veritabanındaki string verileri diziye çevir (Explode)
        $row['category'] = explode(',', $row['category']); // "kadin,indirim" -> ["kadin", "indirim"]
        $row['images'] = explode(',', $row['images']);
        $row['sizes'] = explode(',', $row['sizes']);

        // Fiyat formatı (2500.00 -> 2.500,00 TL)
        $row['price'] = number_format($row['price'], 2, ',', '.') . " TL";
        if($row['old_price']) {
            $row['old_price'] = number_format($row['old_price'], 2, ',', '.') . " TL";
        }

        array_push($products, $row);
    }
}

// JSON olarak çıktı ver
echo json_encode($products);

$conn->close();
?>
