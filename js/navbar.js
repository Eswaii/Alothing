// navbar.js
document.addEventListener('DOMContentLoaded', function() {
    fetch('navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data;

            // Navbar DOM'a eklendiğinde sepet sayısını güncelle
            if (typeof updateCartUI === 'function') {
                updateCartUI();
            }

            // NAVBAR YÜKLENDİKTEN SONRA ADMİN KONTROLÜNÜ YAP
            checkAdminAccess();
        })
        .catch(err => console.error("Navbar yüklenemedi:", err));
});

// Admin yetkisi varsa "Yönetim" butonunu navbara ekleyen fonksiyon
// Admin yetkisi varsa "Yönetim" butonunu navbara ekleyen fonksiyon
function checkAdminAccess() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.role === 'admin') {
        // MASAÜSTÜ MENÜ (Büyük Ekran)
        const desktopMenu = document.querySelector('.navbar-nav');
        if (desktopMenu) {
            const adminLi = document.createElement('li');
            adminLi.className = 'nav-item ms-lg-2'; // Hafif boşluk

            const currentPath = window.location.pathname;
            const linkHref = currentPath.includes('/admin/') ? 'index.html' : 'admin/index.html';

            adminLi.innerHTML = `
                <a class="nav-link tracking-wider d-flex align-items-center gap-1" href="${linkHref}" style="color: #000; font-weight: 600;">

                    YÖNETİM
                </a>
            `;
            desktopMenu.appendChild(adminLi);
        }

        // MOBİL MENÜ (Çekmece - Offcanvas)
        // Eğer mobilden girilirse diye sol menünün en altına Hesabım'ın yanına ekleyelim
        const mobileMenuLinks = document.querySelector('.offcanvas-body .px-3.d-flex.flex-column');
        if (mobileMenuLinks) {
            const currentPath = window.location.pathname;
            const linkHref = currentPath.includes('/admin/') ? 'index.html' : 'admin/index.html';

            const adminMobileLink = document.createElement('a');
            adminMobileLink.href = linkHref;
            adminMobileLink.className = "text-decoration-none text-dark d-flex align-items-center gap-2 small fw-bold mt-2";
            adminMobileLink.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Yönetim Paneli
            `;
            mobileMenuLinks.appendChild(adminMobileLink);
        }
    }
}
function handleNavbarSearch(event) {
    // Sadece Enter tuşuna basıldığında tetiklenir
    if (event.key === "Enter") {
        const query = event.target.value.trim();
        if (query.length > 0) {
            // Arama kelimesini URL parametresi olarak gönderiyoruz
            window.location.href = `category.html?search=${encodeURIComponent(query)}`;
        }
    }
}
// --- SON ARAMALAR MANTIĞI ---

// 1. Aramayı Tetikleyen ve Kaydeden Fonksiyon
function handleNavbarSearch(event) {
    if (event.key === "Enter") {
        const query = event.target.value.trim();
        if (query.length > 0) {
            saveRecentSearch(query);
            window.location.href = `category.html?search=${encodeURIComponent(query)}`;
        }
    }
}

// 2. localStorage'a Kaydetme
function saveRecentSearch(query) {
    let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];

    // Aynı arama varsa önce onu listeden çıkar (başa almak için)
    searches = searches.filter(s => s.toLowerCase() !== query.toLowerCase());

    // Yeni aramayı başa ekle
    searches.unshift(query);

    // Sadece son 5 aramayı tut
    searches = searches.slice(0, 5);

    localStorage.setItem('recentSearches', JSON.stringify(searches));
}

// 3. Aramaları Ekrana Basma
function renderRecentSearches() {
    const container = document.getElementById('recent-searches-container');
    const title = document.getElementById('search-history-title');
    if (!container) return;

    const searches = JSON.parse(localStorage.getItem('recentSearches')) || [];

    if (searches.length === 0) {
        title.style.display = 'none'; // Geçmiş yoksa başlığı gizle
        container.innerHTML = '<span class="text-muted small">Henüz bir arama yapmadınız.</span>';
        return;
    }

    title.style.display = 'block';
    container.innerHTML = searches.map(s => `
        <a href="category.html?search=${encodeURIComponent(s)}" class="btn btn-light btn-sm rounded-0 px-3 py-2">
            ${s}
        </a>
    `).join('');
}

// Arama paneli her açıldığında listeyi yenilemek için dinleyici ekle
document.addEventListener('shown.bs.offcanvas', function (event) {
    if (event.target.id === 'searchPanel') {
        renderRecentSearches();
    }
});
