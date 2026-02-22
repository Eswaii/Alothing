// --- CATEGORY.JS (VERİTABANI ENTEGRELİ) ---

// KATEGORİ SÖZLÜĞÜ (URL Kodu -> Ekranda Görünen İsim)
const categoryNames = {
    "wceket": "Ceketler ve Montlar",
    "ceket": "Ceketler ve Montlar",
    "pantolon": "Pantolonlar",
    "wpantolon": "Pantolonlar",
    "kot-pantolon": "Kot Pantolonlar",
    "wkot-pantolon": "Kot Pantolonlar",
    "elbise": "Elbiseler",
    "sweatshirt": "Sweatshirt ve Hoodieler",
    "wsweatshirt": "Sweatshirt ve Hoodieler",
    "kazak": "Kazaklar ve Hırkalar",
    "wkazak": "Kazaklar ve Hırkalar",
    "tisort": "Tişörtler",
    "wtisort": "Tişörtler",
    "gomlek": "Gömlekler",
    "ayakkabi": "Ayakkabılar",
    "wayakkabi": "Ayakkabılar",
    "canta": "Çantalar",
    "sapka": "Şapkalar",
    "wsapka": "Şapkalar",
    "bluz": "Bluzlar",
    "crop": "Croplar",
    "abiye": "Abiyeler",
    "tayt": "Taytlar",
    "sort": "Şortlar",
    "wsort": "Şortlar",
    "etek": "Etekler",
    "indirim": "indirim",
    "windirim": "indirim"
};

// 1. VERİYİ ÇEK VE SAYFAYI BAŞLAT
// 'products.js' yerine 'api.php' kullanıyoruz
fetch('api.php')
    .then(response => response.json())
    .then(productsData => {
        // Veriyi Aldık, Şimdi Sayfayı Oluşturuyoruz
        initCategoryPage(productsData);
    })
    .catch(error => {
        console.error('Veri çekme hatası:', error);
        document.getElementById('product-grid').innerHTML = "<p class='text-center text-danger'>Veritabanına bağlanılamadı.</p>";
    });


// 2. SAYFAYI OLUŞTURAN ANA FONKSİYON
function initCategoryPage(allProducts) {

    // URL'den kategori parametresini al (Örn: category.html?cat=ceket)
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFilter = urlParams.get('cat');

    const grid = document.getElementById('product-grid');
    const title = document.getElementById('category-title');

    // BAŞLIĞI GÜNCELLE
    if (categoryFilter) {
        const displayTitle = categoryNames[categoryFilter] || categoryFilter;
        title.innerText = displayTitle.toUpperCase();
    } else {
        title.innerText = "TÜM ÜRÜNLER";
    }

    // ÜRÜNLERİ FİLTRELE
    const filteredProducts = categoryFilter
        ? allProducts.filter(p => {
            // Eğer ürünün kategorisi bir dizi ise (Veritabanından gelince bazen string array olabilir)
            let cats = p.category;

            // Eğer string olarak geliyorsa (virgüllü ise) diziye çevir
            if (typeof cats === 'string' && cats.includes(',')) {
                cats = cats.split(',');
            }

            if (Array.isArray(cats)) {
                // Dizide trim yaparak boşlukları temizle ve kontrol et
                return cats.map(c => c.trim()).includes(categoryFilter);
            }
            // Tekil string ise
            return cats === categoryFilter;
        })
        : allProducts;

    // ÜRÜNLERİ EKRANA BAS
    if (filteredProducts.length > 0) {
        grid.innerHTML = filteredProducts.map(product => {

            // Fiyat (Veritabanından old_price olarak gelebilir, JS'de oldPrice olabilir)
            // İkisini de kontrol ediyoruz
            const oldPriceVal = product.old_price || product.oldPrice;

            let priceHTML = `<span class="product-price">${product.price}</span>`;

            if (oldPriceVal && oldPriceVal !== "0.00 TL" && oldPriceVal !== "0") {
                priceHTML = `
                    <span class="old-price">${oldPriceVal}</span>
                    <span class="text-danger fw-bold product-price">${product.price}</span>
                    <span class="discount-badge">${product.discount || '%'}</span>
                `;
            }

            // Renk Topları (+1 Renk mantığı)
            let colorsHTML = "";
            // Veritabanından renkler bazen JSON string, bazen obje gelir
            let colors = product.colors;
            if (typeof colors === 'string') {
                try { colors = JSON.parse(colors); } catch(e) { colors = []; }
            }

            if(colors && colors.length > 0) {
                // İlk rengi göster
                colorsHTML = `<span class="color-dot" style="background-color:${colors[0].code || '#000'}"></span>`;

                if(colors.length > 1) {
                    colorsHTML += `<span class="plus-color ms-1">+${colors.length - 1} Renk</span>`;
                }
            }

            // Bedenler
            let sizes = product.sizes;
            if(typeof sizes === 'string') sizes = sizes.split(','); // "S,M,L" -> ["S","M","L"]

            let sizesHTML = "";
            if(sizes && Array.isArray(sizes)) {
                sizesHTML = sizes.map(s =>
                    `<span class="size-span">${s}</span>`
                ).join('');
            }

            // Kampanya Yazısı
            let tagHTML = product.tag ? `<div class="promo-tag">${product.tag}</div>` : '';

            // Resim Seçimi
            let imageSrc = "https://placehold.co/600x800";
            let images = product.images;

            // String ise diziye çevir
            if(typeof images === 'string') images = images.split(',');

            if(images && images.length > 0) imageSrc = images[0];
            else if(product.image) imageSrc = product.image;

            // Resim yolunda başında / yoksa ekle (güvenlik için)
            if(!imageSrc.startsWith('http') && !imageSrc.startsWith('/')) imageSrc = imageSrc;

            return `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="product-card" onclick="goToDetail(${product.id})">

                    <!-- Görsel Alanı -->
                    <div class="card-img-wrapper">
                        <img src="${imageSrc}" class="card-img" alt="${product.name}" onerror="this.src='https://placehold.co/600x800?text=Resim+Yok'">

                        <!-- Kalp İkonu -->
                        <button class="wishlist-btn" onclick="event.stopPropagation(); toggleHeart(this)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="black" stroke-width="1.5" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        </button>

                        <!-- Hover Beden Seçimi -->
                        <div class="size-selector-overlay">
                            <div class="small mb-2 text-muted">Beden seç</div>
                            <div>${sizesHTML}</div>
                        </div>
                    </div>

                    <!-- Bilgi Alanı -->
                    <div class="product-info">
                        <div class="w-100">
                            <div class="product-name text-truncate">${product.name}</div>
                            <div class="mt-1">${priceHTML}</div>
                            <div>${colorsHTML}</div>
                            ${tagHTML}
                        </div>
                    </div>

                </div>
            </div>
            `;
        }).join('');
    } else {
        grid.innerHTML = "<div class='col-12 text-center mt-5'><h4 class='text-muted'>Bu kategoride henüz ürün bulunmuyor.</h4></div>";
    }
}

// Yönlendirme Fonksiyonu
function goToDetail(id) {
    window.location.href = `product-detail.html?id=${id}`;
}

// Kalp Animasyonu
function toggleHeart(btn) {
    const svg = btn.querySelector('svg');
    if (svg.getAttribute('fill') === 'none') {
        svg.setAttribute('fill', 'black');
    } else {
        svg.setAttribute('fill', 'none');
    }
}
