<?php
error_reporting(0);
header("Content-Type: application/json; charset=UTF-8");

// PHPMailer dosyaları
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

$conn = new mysqli("localhost", "root", "", "alothing_db");
$conn->set_charset("utf8mb4");

$data = json_decode(file_get_contents("php://input"));

if ($data && isset($data->email)) {
    $email = trim($data->email);

    // E-posta veritabanında var mı?
    $stmt = $conn->prepare("SELECT id, name FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Benzersiz Token ve Son Kullanma Tarihi (1 saat) üret
        $token = bin2hex(random_bytes(32));
        $expires = date("Y-m-d H:i:s", strtotime("+1 hour"));

        $upd_stmt = $conn->prepare("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?");
        $upd_stmt->bind_param("ssi", $token, $expires, $user['id']);

        if ($upd_stmt->execute()) {

            // MAİL GÖNDERİM İŞLEMİ
            $mail = new PHPMailer(true);
            try {
                $mail->isSMTP();
                $mail->Host       = 'smtp.gmail.com';
                $mail->SMTPAuth   = true;
                $mail->Username   = 'alothinginfo@gmail.com'; // KENDİ BİLGİLERİNİ GİR
                $mail->Password   = 'wswuojecjxoqiccn'; // UYGULAMA ŞİFRESİ
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port       = 587;
                $mail->CharSet    = 'UTF-8';

                $mail->setFrom('alothinginfo@gmail.com', 'ALOTHING');
                $mail->addAddress($email);

                $resetLink = "http://localhost/alothing2/reset-password.html?token=" . $token; // KENDİ SİTE ADRESİNİ YAZ

                $mail->Subject = "ALOTHING | Şifre Sıfırlama Talebi";
                $mail->isHTML(true);

                // Premium Zara Tarzı E-Posta Şablonu
                $mail->Body = "
                <div style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 60px 20px; text-align: center; background-color: #ffffff; color: #000000;\">
                    <div style=\"font-size: 32px; font-weight: 800; letter-spacing: 6px; margin-bottom: 40px; text-transform: uppercase;\">ALOTHING</div>
                    <div style=\"font-size: 20px; font-weight: 700; letter-spacing: 1px; margin-bottom: 20px; text-transform: uppercase;\">ŞİFRE SIFIRLAMA TALEBİ</div>
                    <div style=\"font-size: 15px; line-height: 1.6; color: #333333; margin-bottom: 40px; padding: 0 20px;\">
                        Sayın " . mb_convert_case($user['name'], MB_CASE_TITLE, "UTF-8") . ",<br><br>
                        Hesabınıza ait şifreyi sıfırlamak için bir talepte bulundunuz. İşlemi tamamlamak ve hesabınız için yeni bir şifre belirlemek amacıyla aşağıdaki butona tıklayabilirsiniz.
                        <br><br><span style=\"font-size: 12px; color: #888;\">(Bu bağlantı güvenliğiniz için 1 saat boyunca geçerlidir.)</span>
                    </div>
                    <a href=\"$resetLink\" style=\"background-color: #000000; color: #ffffff; text-decoration: none; padding: 18px 40px; font-size: 12px; font-weight: bold; letter-spacing: 2px; display: inline-block; text-transform: uppercase;\">ŞİFREMİ YENİLE</a>
                </div>";

                $mail->send();
                echo json_encode(["success" => true]);
            } catch (Exception $e) {
                echo json_encode(["success" => false, "message" => "E-posta gönderilemedi."]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Veritabanı hatası."]);
        }
    } else {
        // Güvenlik: Mail olmasa bile varmış gibi davranmak Brute Force saldırılarını önler.
        echo json_encode(["success" => true]);
    }
}
?>
