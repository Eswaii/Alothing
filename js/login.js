function injectToastSystem() {
    if (document.getElementById('alothing-toast-style')) return;

    const style = document.createElement('style');
    style.id = 'alothing-toast-style';
    style.innerHTML = `
        #alothing-toast-container { position: fixed; top: 30px; left: 50%; transform: translateX(-50%); z-index: 999999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
        .alothing-toast { min-width: 320px; background-color: #000; color: #fff; padding: 16px 24px; border-radius: 4px; font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 500; box-shadow: 0 15px 35px rgba(0,0,0,0.2); display: flex; align-items: center; opacity: 0; transform: translateY(-20px); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); letter-spacing: 0.5px; }
        .alothing-toast.show { opacity: 1; transform: translateY(0); }
        .alothing-toast.error { background-color: #dc2626; }
        .alothing-toast svg { margin-right: 12px; flex-shrink: 0; }
    `;
    document.head.appendChild(style);

    if (!document.getElementById('alothing-toast-container')) {
        const container = document.createElement('div');
        container.id = 'alothing-toast-container';
        document.body.appendChild(container);
    }
}

function showNotification(message, type = 'success') {
    injectToastSystem();
    const container = document.getElementById('alothing-toast-container');
    const toast = document.createElement('div');
    toast.className = `alothing-toast ${type === 'error' ? 'error' : ''}`;

    const icon = type === 'error'
        ? `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
        : `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}
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
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const btnLogin = document.getElementById('tab-login');
    const btnRegister = document.getElementById('tab-register');

    if (!loginForm || !registerForm || !btnLogin || !btnRegister) return;

    if (tabName === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        btnLogin.classList.add('active');
        btnRegister.classList.remove('active');
    }
    else if (tabName === 'register') {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        btnLogin.classList.remove('active');
        btnRegister.classList.add('active');
    }
}

// --- KAYIT OL ---
function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;

    // Şifre Güvenlik Kuralı (En az 8 karakter, 1 büyük, 1 küçük harf)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
          return showNotification("Şifreniz en az 8 karakter uzunluğunda olmalı; en az 1 büyük harf ve 1 küçük harf içermelidir.","error");
    }

    fetch('register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showNotification("Kayıt Başarılı! Şimdi giriş yapabilirsiniz.");
            switchTab('login');
        } else {
showNotification(data.message, "error");        }
    })
    .catch(err => console.error("Kayıt Hatası:", err));
}

// --- GİRİŞ YAP (DÜZELTİLDİ: ROLÜ ARTIK ÇÖPE ATMIYOR) ---
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
            // PHP'den gelen "user" paketini (id, name, email, role) BÜTÜN OLARAK kaydet
            localStorage.setItem('user', JSON.stringify(data.user));

            showNotification("Giriş Başarılı!");
            setTimeout(() => location.reload(), 1000);
        } else {
            showNotification(data.message, "error");
        }
    })
    .catch(err => console.error(err));
}

// --- SAYFA YÜKLENDİĞİNDE KONTROL ---
document.addEventListener("DOMContentLoaded", function() {
    checkLoginStatus();
});

function checkLoginStatus() {
    // getItem içindeki yazım hatası düzeltildi
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('profilePanel').style.display = 'block';

        const headerTabs = document.querySelector('.offcanvas-header .d-flex');
        if(headerTabs) headerTabs.style.display = 'none';

        if(document.getElementById('userNameDisplay')) document.getElementById('userNameDisplay').innerText = user.name;
        if(document.getElementById('userEmailDisplay')) document.getElementById('userEmailDisplay').innerText = user.email || "";
        if(document.getElementById('userInitial')) document.getElementById('userInitial').innerText = user.name.charAt(0).toUpperCase();
    } else {
        document.getElementById('loginForm').style.display = 'block';
        if(document.getElementById('profilePanel')) document.getElementById('profilePanel').style.display = 'none';

        const headerTabs = document.querySelector('.offcanvas-header .d-flex');
        if(headerTabs) headerTabs.style.display = 'flex';
    }
}

// --- ÇIKIŞ YAP ---
function handleLogout() {
    localStorage.removeItem('user');
    fetch('logout.php').catch(err => console.log(err)); // Arka planda session'ı da kapat
    location.reload();
}

function checkProfileAuth(e) {
    e.preventDefault();
    const user = localStorage.getItem('user');

    if (user) {
        window.location.href = "account.html";
    } else {
        const loginPanel = new bootstrap.Offcanvas(document.getElementById('loginOffcanvas'));
        loginPanel.show();
    }
}

// --- FOOTER'DAN GİRİŞ/KAYIT PANELİNİ AÇMA ---
function openLoginOffcanvas(tabName) {
    const loginOffcanvasEl = document.getElementById('loginOffcanvas');
    if (loginOffcanvasEl) {
        let loginPanel = bootstrap.Offcanvas.getInstance(loginOffcanvasEl);
        if (!loginPanel) {
            loginPanel = new bootstrap.Offcanvas(loginOffcanvasEl);
        }
        loginPanel.show();

        // Hangi sekmeye tıklandıysa onu aktif et
        if (typeof switchTab === 'function') {
            setTimeout(() => switchTab(tabName), 150); // Panel açılırken geçiş efekti için
        }
    } else {
        // Eğer bulunulan sayfada loginOffcanvas yoksa ana sayfaya yönlendir
        window.location.href = 'index.html';
    }
}
