// --- LOGIN FORM GEÇİŞLERİ ---
function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}
// --- GİRİŞ / KAYIT SEKME GEÇİŞİ ---
    function switchTab(tabName) {
        // 1. Elementleri Seç
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const btnLogin = document.getElementById('tab-login');
        const btnRegister = document.getElementById('tab-register');

        // 2. Kontrol (Hata varsa konsola yaz)
        if (!loginForm || !registerForm || !btnLogin || !btnRegister) {
            console.error("HATA: Form veya Buton ID'leri bulunamadı!");
            return;
        }

        // 3. Geçiş Mantığı
        if (tabName === 'login') {
            // Giriş Formunu Göster
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';

            // Buton Stilleri
            btnLogin.classList.add('active');
            btnRegister.classList.remove('active');
        }
        else if (tabName === 'register') {
            // Kayıt Formunu Göster
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';

            // Buton Stilleri
            btnLogin.classList.remove('active');
            btnRegister.classList.add('active');
        }
    }
    // --- KAYIT OL (DATABASE BAĞLANTILI) ---
    function handleRegister(e) {
        e.preventDefault();

        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPass').value;

        fetch('register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Kayıt Başarılı! Şimdi giriş yapabilirsiniz.");
                switchTab('login'); // Giriş ekranına at
            } else {
                alert("Hata: " + data.message);
            }
        })
        .catch(err => console.error("Kayıt Hatası:", err));
    }

    // --- GİRİŞ YAP (GÜNCELLENMİŞ) ---
   function handleLogin(e) {
       e.preventDefault();
       const email = document.getElementById('loginEmail').value;
       const password = document.getElementById('loginPass').value;

       fetch('login.php', {
           method: 'POST',
           body: JSON.stringify({ email, password })
       })
       .then(res => res.json())
       .then(data => {
           if (data.success) {
               // !!! BU SATIRI EKLE !!!
               // Kullanıcı bilgisini tarayıcıya kaydet
               localStorage.setItem('user', JSON.stringify({ name: data.user.name, email: email }));

               alert("Giriş Başarılı!");
               location.reload(); // Sayfayı yenile
           } else {
               alert(data.message);
           }
       })
       .catch(err => console.error(err));
   }
    // --- SAYFA YÜKLENDİĞİNDE KONTROL ---
   document.addEventListener("DOMContentLoaded", function() {
       checkLoginStatus();
   });

   function checkLoginStatus() {
       // localStorage'da kullanıcı var mı? (Login olduğunda kaydetmiştik)
       const user = JSON.parse(localStorage.getItem('user', JSON.stringify(data.user)));

       if (user) {
           // Giriş Yapılmış -> Profil Panelini Göster
           document.getElementById('loginForm').style.display = 'none';
           document.getElementById('registerForm').style.display = 'none';
           document.getElementById('profilePanel').style.display = 'block';

           // Sekmeleri Gizle (Profilde sekme olmaz)
           document.querySelector('.offcanvas-header .d-flex').style.display = 'none';

           // Bilgileri Doldur
           document.getElementById('userNameDisplay').innerText = user.name;
           document.getElementById('userEmailDisplay').innerText = user.email || "";
           document.getElementById('userInitial').innerText = user.name.charAt(0).toUpperCase();
       } else {
           // Giriş Yapılmamış -> Login Formunu Göster
           document.getElementById('loginForm').style.display = 'block';
           document.getElementById('profilePanel').style.display = 'none';
           document.querySelector('.offcanvas-header .d-flex').style.display = 'flex'; // Sekmeleri Aç
       }
   }

   // --- GİRİŞ YAP FONKSİYONUNU GÜNCELLE ---
   // Mevcut handleLogin fonksiyonunun 'success' kısmına şunu ekle:
   /*

   */

   // --- ÇIKIŞ YAP ---
   function handleLogout() {
       localStorage.removeItem('user'); // Veriyi sil
       // PHP Session'ı da bitirmek için logout.php'ye istek atabilirsin
       fetch('logout.php');
       location.reload(); // Sayfayı yenile
   }
   function openProfile(e) {
       e.preventDefault();
       const user = JSON.parse(localStorage.getItem('user')); // Veya Session kontrolü

       if (user) {
           // Giriş yapılmışsa Profil Sayfasına git
           window.location.href = "account.html";
       } else {
           // Giriş yapılmamışsa Login Panelini aç
           const offcanvas = new bootstrap.Offcanvas(document.getElementById('loginOffcanvas'));
           offcanvas.show();
       }
   }
   function checkProfileAuth(e) {
    e.preventDefault();
    // Giriş yapılmış mı kontrol et
    const user = localStorage.getItem('user');

    if (user) {
        // Evet -> Hesabım Sayfasına Git
        window.location.href = "account.html";
    } else {
        // Hayır -> Giriş Panelini Aç
        const loginPanel = new bootstrap.Offcanvas(document.getElementById('loginOffcanvas'));
        loginPanel.show();
    }
}
