<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");

require 'send_mail.php';

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

// --- SMS GÖNDERME FONKSİYONU ---
function sendSMS($phone, $message) {
    // SMS API Entegrasyon kodları buraya gelecek
}

$data = json_decode(file_get_contents("php://input"));

if ($data && isset($data->order_id) && isset($data->status)) {

    // 1. Kargo Kodu Üretme ve Statü Güncelleme
    if ($data->status === 'Kargoya Verildi') {
        $tracking_code = 'TRK-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));
        $stmt = $conn->prepare("UPDATE orders SET status = ?, tracking_code = IFNULL(tracking_code, ?) WHERE id = ?");
        $stmt->bind_param("ssi", $data->status, $tracking_code, $data->order_id);
    } else {
        $stmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $data->status, $data->order_id);
    }

    if ($stmt->execute()) {

        $info_stmt = $conn->prepare("SELECT user_email, phone, order_name, order_surname, order_code, tracking_code FROM orders WHERE id = ?");
        $info_stmt->bind_param("i", $data->order_id);
        $info_stmt->execute();
        $orderInfo = $info_stmt->get_result()->fetch_assoc();
        $info_stmt->close();

        if ($orderInfo) {
            $email = $orderInfo['user_email'];
            $phone = $orderInfo['phone'];
            $fullName = mb_convert_case($orderInfo['order_name'] . ' ' . $orderInfo['order_surname'], MB_CASE_TITLE, "UTF-8");
            $orderCode = $orderInfo['order_code'];
            $trkCode = $orderInfo['tracking_code'];

            // Ortak E-Posta Şablonu CSS Stilleri
            $emailStyle = "font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #000; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;";

            // ==========================================
            // 1) KARGOYA VERİLDİ
            // ==========================================
            if ($data->status === 'Kargoya Verildi') {
                $subject = "ALOTHING | Siparişiniz Yola Çıktı (#$orderCode)";

                $html = <<<HTML
                <div style="$emailStyle">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="letter-spacing: 3px; margin: 0; font-size: 24px; font-weight: 700;">ALOTHING</h2>
                    </div>
                    <h3 style="font-weight: 400; font-size: 18px; margin-bottom: 20px;">Sayın $fullName,</h3>
                    <p style="font-size: 15px; line-height: 1.6; color: #444;"><strong>#$orderCode</strong> numaralı siparişiniz özenle hazırlandı ve kargo firmasına teslim edildi. Tarzınızı yansıtacak bu özel parçaların size doğru yola çıktığını bildirmekten mutluluk duyarız.</p>

                    <div style="background-color: #fafafa; padding: 25px; text-align: center; margin: 30px 0; border: 1px solid #f0f0f0;">
                        <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #888;">KARGO TAKİP KODUNUZ</p>
                        <p style="margin: 10px 0 0; font-size: 26px; font-weight: bold; letter-spacing: 3px; color: #000;">$trkCode</p>
                    </div>

                    <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
                        <a href="http://localhost/alothing2/order-tracking.html?code=$trkCode" style="background-color: #000; color: #fff; text-decoration: none; padding: 16px 35px; font-size: 14px; font-weight: 600; letter-spacing: 1px; display: inline-block;">KARGOMU TAKİP ET</a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0 20px;">
                    <p style="margin: 0; font-size: 13px; color: #999; text-align: center;">ALOTHING'i tercih ettiğiniz için teşekkür ederiz.</p>
                </div>
HTML;
                sendOrderEmail($email, $subject, $html);

                $smsText = "Sayin $fullName, $orderCode numarali siparisiniz kargoya verilmistir. Takip kodunuz: $trkCode. Bizi tercih ettiginiz icin tesekkurler.";
                sendSMS($phone, $smsText);
            }

            // ==========================================
            // 2) TESLİM EDİLDİ
            // ==========================================
            elseif ($data->status === 'Teslim Edildi') {
                $subject = "ALOTHING | Siparişiniz Teslim Edildi (#$orderCode)";

                $html = <<<HTML
                <div style="$emailStyle">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="letter-spacing: 3px; margin: 0; font-size: 24px; font-weight: 700;">ALOTHING</h2>
                    </div>
                    <h3 style="font-weight: 400; font-size: 18px; margin-bottom: 20px;">Sayın $fullName,</h3>
                    <p style="font-size: 15px; line-height: 1.6; color: #444;">Alothing stilini yansıtan parçalarınızın size ulaştığını bildirmekten mutluluk duyarız! <strong>#$orderCode</strong> numaralı siparişiniz adresinize başarıyla teslim edilmiştir.</p>
                    <p style="font-size: 15px; line-height: 1.6; color: #444;">Ürünlerinizi güzel günlerde kullanmanızı dileriz. Deneyiminizi bizimle paylaşmak isterseniz hesabınızdan siparişinizi değerlendirebilirsiniz.</p>

                    <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
                        <a href="http://localhost/alothing2/account.html?tab=orders" style="background-color: #000; color: #fff; text-decoration: none; padding: 16px 35px; font-size: 14px; font-weight: 600; letter-spacing: 1px; display: inline-block;">SİPARİŞ DETAYINI GÖR</a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0 20px;">
                    <p style="margin: 0; font-size: 13px; color: #999; text-align: center;">Yeni koleksiyonlarda tekrar görüşmek üzere.</p>
                </div>
HTML;
                sendOrderEmail($email, $subject, $html);

                $smsText = "Sayin $fullName, $orderCode numarali siparisiniz teslim edilmistir. Alothing'i tercih ettiginiz icin tesekkur ederiz.";
                sendSMS($phone, $smsText);
            }

            // ==========================================
            // 3) İPTAL EDİLDİ
            // ==========================================
            elseif ($data->status === 'İptal Edildi') {
                $subject = "ALOTHING | Sipariş İptali (#$orderCode)";

                $html = <<<HTML
                <div style="$emailStyle">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="letter-spacing: 3px; margin: 0; font-size: 24px; font-weight: 700;">ALOTHING</h2>
                    </div>
                    <h3 style="font-weight: 400; font-size: 18px; margin-bottom: 20px;">Sayın $fullName,</h3>
                    <p style="font-size: 15px; line-height: 1.6; color: #444;"><strong>#$orderCode</strong> numaralı siparişinizin iptal işlemi talebiniz doğrultusunda/operasyonel süreçler nedeniyle tamamlanmıştır.</p>

                    <div style="background-color: #fafafa; padding: 20px; margin: 25px 0; border-left: 4px solid #000;">
                        <p style="margin: 0; font-size: 14px; color: #333;"><strong>İade Bilgilendirmesi:</strong> Ödemiş olduğunuz tutarın iade işlemi bankanıza iletilmiştir. Bankanızın süreçlerine bağlı olarak tutar, <strong>1-3 iş günü</strong> içerisinde ekstrenize yansıyacaktır.</p>
                    </div>

                    <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
                        <a href="http://localhost/alothing2" style="background-color: #000; color: #fff; text-decoration: none; padding: 16px 35px; font-size: 14px; font-weight: 600; letter-spacing: 1px; display: inline-block;">ALIŞVERİŞE DEVAM ET</a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0 20px;">
                    <p style="margin: 0; font-size: 13px; color: #999; text-align: center;">Sorularınız için müşteri hizmetlerimizle iletişime geçebilirsiniz.</p>
                </div>
HTML;
                sendOrderEmail($email, $subject, $html);
            }

            // ==========================================
            // 4) İADE EDİLDİ
            // ==========================================
            elseif ($data->status === 'İade Edildi') {
                $subject = "ALOTHING | İade İşleminiz Onaylandı (#$orderCode)";

                $html = <<<HTML
                <div style="$emailStyle">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="letter-spacing: 3px; margin: 0; font-size: 24px; font-weight: 700;">ALOTHING</h2>
                    </div>
                    <h3 style="font-weight: 400; font-size: 18px; margin-bottom: 20px;">Sayın $fullName,</h3>
                    <p style="font-size: 15px; line-height: 1.6; color: #444;">Göndermiş olduğunuz ürün/ürünler merkez depomuza ulaşmış ve kalite kontrol ekibimiz tarafından incelenerek <strong>iadeniz onaylanmıştır.</strong></p>

                    <div style="background-color: #fafafa; padding: 20px; margin: 25px 0; border: 1px solid #f0f0f0;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #000; text-align: center;"><strong>Sipariş No:</strong> #$orderCode</p>
                        <p style="margin: 0; font-size: 14px; color: #555; text-align: center;">Tutar iadeniz gerçekleştirilmiş olup, kısa süre içerisinde ödeme yaptığınız kartınıza yansıyacaktır.</p>
                    </div>

                    <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
                        <a href="http://localhost/alothing2" style="background-color: #000; color: #fff; text-decoration: none; padding: 16px 35px; font-size: 14px; font-weight: 600; letter-spacing: 1px; display: inline-block;">YENİ KOLEKSİYONU KEŞFET</a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0 20px;">
                    <p style="margin: 0; font-size: 13px; color: #999; text-align: center;">ALOTHING Ekibi</p>
                </div>
HTML;
                sendOrderEmail($email, $subject, $html);

                $smsText = "Sayin $fullName, $orderCode numarali siparisinizin iade islemi depomuz tarafindan onaylanmis ve ucret iadeniz yapilmistir.";
                sendSMS($phone, $smsText);
            }
        }

        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Güncellenemedi."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Eksik veri."]);
}
?>
