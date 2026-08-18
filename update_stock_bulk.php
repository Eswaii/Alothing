<?php
header("Content-Type: application/json; charset=UTF-8");
$conn = new mysqli("localhost", "root", "", "alothing_db");

$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->updates)) {
    $conn->begin_transaction(); // Hız ve güvenlik için işlem (transaction) başlatalım

    try {
        foreach($data->updates as $update) {
            $stmt = $conn->prepare("UPDATE product_stocks SET stock_count = ? WHERE id = ?");
            $stmt->bind_param("ii", $update->count, $update->id);
            $stmt->execute();
        }
        $conn->commit();
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}
// update_stock_bulk.php içine eklenecek mantık (Commit öncesi)
foreach($data->updates as $update) {
    if ($update->count > 0) {
        // Bu ürün ve beden için bekleyen mail var mı?
        $checkReq = $conn->query("SELECT user_email FROM stock_requests WHERE id = {$update->id} AND status = 'Bekliyor'");
        while($req = $checkReq->fetch_assoc()) {
            // send_mail.php fonksiyonunu çağır
            sendOrderEmail($req['user_email'], "Stoklar Yenilendi!", "İstediğiniz ürünün stoğu güncellendi. Hemen satın alabilirsiniz.");
            // Talebi "Gönderildi" yap
            $conn->query("UPDATE stock_requests SET status = 'Gonderildi' WHERE id = {$update->id}");
        }
    }
}
?>
