<?php
header("Content-Type: application/json; charset=UTF-8");
error_reporting(0); // Ekrana gereksiz hata basmasını engeller

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Veritabanı hatası"]));
}

$stats = [
    "pending_orders" => 0,
    "pending_returns" => 0,
    "total_products" => 0,
    "total_users" => 0,
    "monthly_earnings" => 0,
    "recent_orders" => []
];

// 1. Bekleyen Sipariş Sayısı (Sadece "Hazırlanıyor" olanlar)
$res = $conn->query("SELECT COUNT(*) as c FROM orders WHERE status = 'Hazırlanıyor'");
$stats['pending_orders'] = $res->fetch_assoc()['c'];

// 2. Bekleyen İade/İptal Talepleri
$res = $conn->query("SELECT COUNT(*) as c FROM orders WHERE status IN ('İptal Bekliyor', 'İade Bekliyor')");
$stats['pending_returns'] = $res->fetch_assoc()['c'];

// 3. Sistemdeki Toplam Ürün Sayısı
$res = $conn->query("SELECT COUNT(*) as c FROM products");
$stats['total_products'] = $res->fetch_assoc()['c'];

// 4. Toplam Kayıtlı Müşteri (Admin hariç)
$res = $conn->query("SELECT COUNT(*) as c FROM users WHERE role = 'user'");
$stats['total_users'] = $res->fetch_assoc()['c'];

// 5. Bu Ayki Toplam Kazanç (İptal/İade edilenler hariç)
$res = $conn->query("SELECT total_price FROM orders WHERE status NOT IN ('İptal Edildi', 'İade Edildi', 'İptal Bekliyor', 'İade Bekliyor') AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())");
$total_earn = 0;

while($row = $res->fetch_assoc()) {
    $priceStr = $row['total_price'];
    // "2.790,00 TL" formatını matematiğe uygun hale getirme
    $priceStr = str_replace(' TL', '', $priceStr); // TL'yi sil
    $priceStr = str_replace('.', '', $priceStr);   // Binlik ayracını sil
    $priceStr = str_replace(',', '.', $priceStr);  // Kuruş ayracını noktaya çevir
    $total_earn += (float)$priceStr;
}
// Kazancı tekrar düzgün formata çevir
$stats['monthly_earnings'] = number_format($total_earn, 2, ',', '.');

// 6. Son Gelen 5 Siparişi Çek (Ana Ekranda Listelemek İçin)
$res = $conn->query("SELECT id, order_code, user_email, total_price, status, created_at, order_name, order_surname FROM orders ORDER BY created_at DESC LIMIT 5");
while($row = $res->fetch_assoc()) {
    $stats['recent_orders'][] = $row;
}

echo json_encode(["success" => true, "stats" => $stats]);
$conn->close();
?>
