<?php
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

$order_id = isset($_GET['id']) ? $_GET['id'] : '';
$email = isset($_GET['email']) ? $_GET['email'] : '';

if ($order_id && $email) {
    // Güvenlik: Siparişin gerçekten bu kullanıcıya ait olup olmadığını kontrol ediyoruz
    $stmt = $conn->prepare("SELECT * FROM orders WHERE id = ? AND user_email = ?");
    $stmt->bind_param("is", $order_id, $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // Ürünleri temizleyip diziye çeviriyoruz (Daha önce kurduğumuz mantık)
        $row['items'] = json_decode(stripslashes($row['items']), true);
        if (is_string($row['items'])) {
            $row['items'] = json_decode($row['items'], true);
        }

        echo json_encode(["success" => true, "order" => $row]);
    } else {
        echo json_encode(["success" => false, "message" => "Sipariş bulunamadı."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Geçersiz istek."]);
}
?>
