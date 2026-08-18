<?php
// İndirdiğimiz PHPMailer dosyalarını projeye dahil ediyoruz
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

function sendOrderEmail($to, $subject, $htmlContent) {
    $mail = new PHPMailer(true);

    try {
        // SMTP Sunucu Ayarları
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';       // Gmail'in sunucusu
        $mail->SMTPAuth   = true;
        $mail->Username   = 'alothinginfo@gmail.com'; // KENDİ GMAIL ADRESİN
        $mail->Password   = 'wswuojecjxoqiccn'; // AZ ÖNCE ALDIĞIN 16 HANELİ ŞİFRE
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Türkçe karakter desteği
        $mail->CharSet = 'UTF-8';

        // Gönderen ve Alıcı Bilgileri
        // (Hosting'e geçince info@alothing.com gibi yapabilirsin)
        $mail->setFrom('senin.mailin@gmail.com', 'ALOTHING');
        $mail->addAddress($to); // Müşterinin e-postası

        // E-posta İçeriği
        $mail->isHTML(true); // HTML formatında gönderilsin
        $mail->Subject = $subject;
        $mail->Body    = $htmlContent;

        $mail->send();
        return true;
    } catch (Exception $e) {
        // Hata olursa loglara yazdır (Geliştirici için)
        error_log("Mail Gönderim Hatası: {$mail->ErrorInfo}");
        return false;
    }
}
?>
