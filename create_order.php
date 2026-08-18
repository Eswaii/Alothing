<?php
header("Content-Type: application/json; charset=UTF-8");
error_reporting(E_ALL);
ini_set('display_errors', 1);

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB Hatası: " . $conn->connect_error]);
    exit;
}

$input = file_get_contents("php://input");
$data = json_decode($input);

if (!$data || empty($data->email) || empty($data->items)) {
    echo json_encode(["success" => false, "message" => "Eksik veri gönderildi."]);
    exit;
}

$user_email = $data->email;

// JAVASCRIPT'TEN GELEN ADRES VERİLERİNİ YAKALA
$order_name = isset($data->order_name) ? $data->order_name : '';
$order_surname = isset($data->order_surname) ? $data->order_surname : '';
$order_phone = isset($data->order_phone) ? $data->order_phone : '';
$order_address_line = isset($data->order_address_line) ? $data->order_address_line : '';
$order_city = isset($data->order_city) ? $data->order_city : '';
$order_district = isset($data->order_district) ? $data->order_district : '';

$stmt_user = $conn->prepare("SELECT phone FROM users WHERE email = ?");
$stmt_user->bind_param("s", $user_email);
$stmt_user->execute();
$res_user = $stmt_user->get_result();
$user_row = $res_user->fetch_assoc();

$user_phone = ($user_row && isset($user_row['phone'])) ? trim($user_row['phone']) : '';

if ($user_phone === '' || $user_phone === 'Belirtilmedi') {
    $final_phone = $order_phone;
} else {
    $final_phone = $user_phone;
}

if (empty(trim($final_phone))) {
    $final_phone = 'Belirtilmedi';
}

$query = $conn->query("SELECT MAX(id) as max_id FROM orders");
$row = $query->fetch_assoc();
$next_id = ($row['max_id'] ? $row['max_id'] : 0) + 1;
$order_code = "ALO-" . str_pad($next_id, 6, "0", STR_PAD_LEFT);

$stmt = $conn->prepare("INSERT INTO orders (user_email, phone, order_code, items, total_price, order_name, order_surname, order_address_line, order_city, order_district, order_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "SQL Hazırlama Hatası: " . $conn->error]);
    exit;
}

$stmt->bind_param("sssssssssss", $user_email, $final_phone, $order_code, $data->items, $data->total_price, $order_name, $order_surname, $order_address_line, $order_city, $order_district, $order_phone);

if ($stmt->execute()) {

    // ==========================================
    // 🔥 STOK DÜŞÜRME İŞLEMİ (YENİ EKLENDİ) 🔥
    // ==========================================
    $items_array = json_decode($data->items, true);

    foreach ($items_array as $item) {
        $product_id = $item['id'];
        // Kategori JS'den "36:2" gibi gelmişse, sadece bedeni ("36") alıyoruz
        $size_parts = explode(':', $item['size']);
        $size_name = trim($size_parts[0]);
        $quantity = (int)$item['quantity'];

        // Veritabanındaki "product_stocks" tablosundan o bedenin stoğunu düşür
        $stock_update_stmt = $conn->prepare("UPDATE product_stocks SET stock_count = stock_count - ? WHERE product_id = ? AND size = ? AND stock_count >= ?");
        // Eğer stok 0'ın altına düşmeyecekse günceller (stock_count >= quantity)
        $stock_update_stmt->bind_param("iisi", $quantity, $product_id, $size_name, $quantity);
        $stock_update_stmt->execute();

        // Not: Çok yoğun sistemlerde burada execute() kontrolü yapılıp,
        // 0 satır güncellendiyse (stok yetmediyse) siparişin iptal edilmesi kurgulanabilir.
        // Ancak şu an temel entegrasyonu yapıyoruz.
    }
    // ==========================================

    // 1. E-posta dosyamızı sisteme dahil et
    require_once 'send_mail.php';

    // 2. Sepetteki ürünleri Resimli HTML Tablosuna çevir
    $site_url = "";
    $items_html = "<table style='width: 100%; border-collapse: collapse; margin-top: 10px;'>";
    foreach($items_array as $item) {
        $img_src = $site_url . $item['image'];
        $items_html .= "
        <tr>
            <td style='padding: 10px 0; border-bottom: 1px solid #eee; width: 80px; vertical-align: top;'>
                <img src='" . $img_src . "' alt='" . $item['name'] . "' style='width: 70px; height: auto; border-radius: 6px; display: block;'>
            </td>
            <td style='padding: 10px 0; border-bottom: 1px solid #eee; vertical-align: middle;'>
                <b style='font-size: 16px; color: #333;'>" . $item['name'] . "</b><br>
                <span style='color: #777; font-size: 14px;'>Beden: " . $item['size'] . " &nbsp;|&nbsp; Adet: " . $item['quantity'] . "</span><br>
                <strong style='color: #000; font-size: 15px; display: inline-block; margin-top: 5px;'>" . $item['price'] . "</strong>
            </td>
        </tr>";
    }
    $items_html .= "</table>";

    // 3. E-postanın İçeriğini (Tasarımını) Hazırla
    $subject = "Siparişiniz Alındı! - " . $order_code;
    $message = "
    <html>
    <head><title>ALOTHING Sipariş Detayı</title></head>
    <body style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>
        <div style='max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;'>
            <h2 style='color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;'>Merhaba $order_name,</h2>
            <p>Siparişiniz başarıyla alınmıştır. Bizi tercih ettiğiniz için teşekkür ederiz!</p>
            <p><b>Sipariş Kodunuz:</b> <span style='color: #e74c3c; font-size: 1.2em;'>$order_code</span></p>
            <h3 style='margin-top: 20px;'>Sipariş Özeti:</h3>
            $items_html
            <h3 style='text-align: right;'>Toplam Tutar: $data->total_price</h3>
            <div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;'>
                <b>Teslimat Adresi:</b><br>
                $order_address_line<br>
                $order_district / $order_city<br>
                Tel: $final_phone
            </div>
            <p style='margin-top: 30px; font-size: 0.9em; color: #777; text-align: center;'>Siparişiniz kargoya verildiğinde size tekrar bilgi vereceğiz.</p>
        </div>
    </body>
    </html>
    ";

    // 4. Hazırladığımız PHPMailer Fonksiyonunu Çalıştır
    sendOrderEmail($user_email, $subject, $message);

    // 5. JavaScript'e Başarılı Yanıtı Gönder
    echo json_encode([
        "success" => true,
        "order_code" => $order_code,
        "email" => $user_email,
        "phone" => $final_phone,
        "message" => "Sipariş başarıyla oluşturuldu."
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Kaydetme hatası: " . $stmt->error]);
}
?>
