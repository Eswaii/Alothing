// --- CATEGORY.JS (HIZLI EKLE & VARYANT RENKLERİ & INDEX 4 RESİM & ARAMA DESTEĞİ & AKILLI STOK & DİNAMİK SEKME BAŞLIĞI) ---
// TOAST BİLDİRİM SİSTEMİ
function injectToastSystem() { if (document.getElementById('alothing-toast-style')) return; const style = document.createElement('style'); style.id = 'alothing-toast-style'; style.innerHTML = `#alothing-toast-container { position: fixed; top: 30px; left: 50%; transform: translateX(-50%); z-index: 999999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; } .alothing-toast { min-width: 320px; background-color: #000; color: #fff; padding: 16px 24px; border-radius: 4px; font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 500; box-shadow: 0 15px 35px rgba(0,0,0,0.2); display: flex; align-items: center; opacity: 0; transform: translateY(-20px); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); letter-spacing: 0.5px; } .alothing-toast.show { opacity: 1; transform: translateY(0); } .alothing-toast.error { background-color: #dc2626; } .alothing-toast svg { margin-right: 12px; flex-shrink: 0; }`; document.head.appendChild(style); if (!document.getElementById('alothing-toast-container')) { const container = document.createElement('div'); container.id = 'alothing-toast-container'; document.body.appendChild(container); } }
function showNotification(msg, type = 'success') { injectToastSystem(); const container = document.getElementById('alothing-toast-container'); const toast = document.createElement('div'); toast.className = `alothing-toast ${type === 'error' ? 'error' : ''}`; const icon = type === 'error' ? `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>` : `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`; toast.innerHTML = `${icon} <span>${msg}</span>`; container.appendChild(toast); setTimeout(() => toast.classList.add('show'), 10); setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3500); }

// 1. TOOLTIP VE HABER VER MODALI İÇİN DİNAMİK CSS
(function injectTooltipAndModal() {
    if (document.getElementById('cat-stock-styles')) return;
    const style = document.createElement('style');
    style.id = 'cat-stock-styles';
    style.innerHTML = `
        /* Hızlı Ekle Beden Konteyneri */
        .qa-size-wrapper { position: relative; display: inline-block; margin-right: 5px; margin-bottom: 5px; }

        /* Tükendi Stili (Hızlı Ekle Butonu İçin) */
        .qa-size-btn.out-of-stock {
            color: #ccc !important;
            text-decoration: line-through !important;
            border-color: #eee !important;
            cursor: pointer !important;
            background: #f9f9f9 !important;
        }

        /* Haber Ver Tooltip */
        .qa-size-tooltip {
            position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
            margin-bottom: 8px; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            padding: 10px 15px; border-radius: 2px; text-align: center;
            z-index: 100; width: max-content; min-width: 120px;
            visibility: hidden; opacity: 0; transition: all 0.2s ease; border: 1px solid #f0f0f0;
        }
        .qa-size-tooltip::after {
            content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
            border-width: 6px; border-style: solid; border-color: #fff transparent transparent transparent;
        }
        .qa-size-wrapper:hover .qa-size-tooltip { visibility: visible; opacity: 1; margin-bottom: 12px; }
        .qa-tooltip-title { font-size: 0.7rem; color: #999; margin-bottom: 4px; letter-spacing: 0.5px; }
        .qa-tooltip-action { font-size: 0.8rem; font-weight: 700; color: #000; cursor: pointer; border-bottom: 1px solid transparent; transition: 0.2s; display:inline-block;}
        .qa-tooltip-action:hover { border-bottom-color: #000; }

        /* Son 1 Ürün Rozeti */
        .qa-last-one {
            position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
            margin-bottom: 6px; font-size: 0.55rem; color: #854d0e; font-weight: 800;
            white-space: nowrap; background: #fef08a; padding: 2px 5px; border-radius: 2px;
            pointer-events: none; letter-spacing: 0.5px; z-index: 10;
        }
        .qa-last-one::after {
            content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
            border-width: 3px; border-style: solid; border-color: #fef08a transparent transparent transparent;
        }
    `;
    document.head.appendChild(style);

    window.addEventListener('DOMContentLoaded', () => {
        if(!document.getElementById('notifyStockModal')) {
            const modalHtml = `
            <div class="modal fade" id="notifyStockModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content rounded-0 border-0 shadow-lg">
                        <div class="modal-header border-bottom-0 p-4 pb-2">
                            <h6 class="modal-title fw-bold text-uppercase" style="letter-spacing: 1px;">Gelince Haber Ver</h6>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4 pt-0 text-center">
                            <p class="small text-muted mb-4">Bu beden stoklara girdiğinde size e-posta ile haber vereceğiz.</p>
                            <input type="hidden" id="notifyProductId">
                            <input type="hidden" id="notifySize">
                            <input type="email" id="notifyEmailInput" class="form-control rounded-0 border-dark mb-3 shadow-none text-center" placeholder="E-Posta Adresiniz" required>
                            <button onclick="submitNotifyEmail()" class="btn btn-dark w-100 py-2 rounded-0 fw-bold" style="letter-spacing: 1px;">KAYDET</button>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }
    });
})();

// ==========================================
// YENİ: HABER VER MODALI VE İŞLEMLERİ (BUG FİX)
// ==========================================
window.openNotifyModal = function(pId, size) {
    if (window.event) {
        window.event.stopPropagation();
        window.event.preventDefault();
    }

    document.getElementById('notifyProductId').value = pId;
    document.getElementById('notifySize').value = size;

    const user = JSON.parse(localStorage.getItem('user'));
    if(user && user.email) {
        document.getElementById('notifyEmailInput').value = user.email;
    } else {
        document.getElementById('notifyEmailInput').value = '';
    }

    const modalEl = document.getElementById('notifyStockModal');
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl, {
        backdrop: 'static',
        keyboard: false
    });

    modalInstance.show();
};

window.submitNotifyEmail = async function() {
    const email = document.getElementById('notifyEmailInput').value.trim();
    const pId = document.getElementById('notifyProductId').value;
    const size = document.getElementById('notifySize').value;

    if(!email || !email.includes('@')) {
        showNotification("Lütfen geçerli bir e-posta adresi girin.","error");
        return;
    }

    const btn = window.event ? window.event.target : null;
    if (btn) { btn.disabled = true; btn.innerText = "KAYDEDİLİYOR..."; }

    try {
        const res = await fetch('request_stock.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, product_id: pId, size: size })
        });
        const result = await res.json();

        showNotification(result.message);

        const modalEl = document.getElementById('notifyStockModal');
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstance.hide();

    } catch(e) {
        showNotification("Bağlantı hatası yaşandı. Lütfen tekrar deneyin.","error");
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = "KAYDET"; }
    }
};

const categoryNames = {
    "wceket": "Ceketler ve Montlar", "ceket": "Ceketler ve Montlar",
    "pantolon": "Pantolonlar", "wpantolon": "Pantolonlar",
    "kot-pantolon": "Kot Pantolonlar", "wkot-pantolon": "Kot Pantolonlar",
    "elbise": "Elbiseler",
    "sweatshirt": "Sweatshirt ve Hoodieler", "wsweatshirt": "Sweatshirt ve Hoodieler",
    "kazak": "Kazaklar ve Hırkalar", "wkazak": "Kazaklar ve Hırkalar",
    "tisort": "Tişörtler", "wtisort": "Tişörtler",
    "gomlek": "Gömlekler",
    "ayakkabi": "Ayakkabılar", "wayakkabi": "Ayakkabılar",
    "canta": "Çantalar",
    "sapka": "Şapkalar", "wsapka": "Şapkalar",
    "bluz": "Gömlekler ve Bluzlar",
    "sort": "Şortlar", "wsort": "Şortlar",
    "etek": "Etekler", "indirim": "İNDİRİM", "windirim": "İNDİRİM"
};

const parseImages = (imgData) => {
    if (!imgData || imgData === 'null') return [];
    if (Array.isArray(imgData)) return imgData;
    if (typeof imgData === 'string') {
        if (imgData.trim().startsWith('[')) {
            try { return JSON.parse(imgData); } catch(e) { return imgData.split(','); }
        }
        return imgData.split(',');
    }
    return [];
};

fetch('api.php')
    .then(response => response.json())
    .then(productsData => {
        initCategoryPage(productsData);
    })
    .catch(error => {
        document.getElementById('product-grid').innerHTML = "<p class='text-center text-danger'>Veritabanına bağlanılamadı.</p>";
    });

function initCategoryPage(allProducts) {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFilter = urlParams.get('cat');
    const searchQuery = urlParams.get('search');

    const grid = document.getElementById('product-grid');
    const title = document.getElementById('category-title');

    let filteredProducts = allProducts;
    let newDocumentTitle = "ALOTHING | Tüm Ürünler"; // Varsayılan Sekme Başlığı

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        title.innerText = `ARAMA SONUÇLARI: "${searchQuery.toUpperCase()}"`;
        newDocumentTitle = `"${searchQuery}" Arama Sonuçları | ALOTHING`; // Arama Sekme Başlığı

        filteredProducts = allProducts.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.tag && p.tag.toLowerCase().includes(q))
        );
    } else if (categoryFilter) {
        title.innerText = (categoryNames[categoryFilter] || categoryFilter).toUpperCase();

        // --- SEKMEYE DİNAMİK BAŞLIK (TITLE) YAZDIRMA ALGORİTMASI ---
        let catNameForTitle = categoryNames[categoryFilter] || categoryFilter;
        let gender = "Erkek";

        // Sadece kadınlara özel kategoriler
        const womenCats = ['elbise', 'etek', 'bluz', 'canta'];

        // Eğer kategori "w" ile başlıyorsa veya özel kadın kategorisiyse "Kadın" yap
        if (categoryFilter.startsWith('w') || womenCats.includes(categoryFilter)) {
            gender = "Kadın";
        }

        // İndirim özel durumu
        if (categoryFilter === 'indirim' || categoryFilter === 'windirim') {
            catNameForTitle = "İndirimli Ürünler";
        }

        newDocumentTitle = `${catNameForTitle} - ${gender} | ALOTHING`;

        filteredProducts = allProducts.filter(p => {
            let cats = p.category;
            if (typeof cats === 'string' && cats.includes(',')) cats = cats.split(',');
            if (Array.isArray(cats)) return cats.map(c => c.trim()).includes(categoryFilter);
            return cats === categoryFilter;
        });
    } else {
        title.innerText = "TÜM ÜRÜNLER";
        newDocumentTitle = "Tüm Ürünler | ALOTHING";
    }

    // TARAYICI (SEKME) BAŞLIĞINI DEĞİŞTİR
    document.title = newDocumentTitle;

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (filteredProducts.length > 0) {
        grid.innerHTML = filteredProducts.map(product => {

            const oldPriceVal = product.old_price || product.oldPrice;
            let priceHTML = `<span class="product-price">${product.price}</span>`;
            if (oldPriceVal && oldPriceVal !== "0.00 TL" && oldPriceVal !== "0") {
                priceHTML = `
                    <span class="old-price">${oldPriceVal}</span>
                    <span class="text-danger fw-bold product-price">${product.price}</span>
                    <span class="discount-badge">${product.discount || '%'}</span>
                `;
            }

            let colorsHTML = '<div class="d-flex align-items-center mt-1">';

            let variants = product.color_group_id
                ? allProducts.filter(p => p.color_group_id == product.color_group_id)
                : [product];

            let addedColors = new Set();
            variants.forEach(variant => {
                let vColors = variant.colors;
                if (typeof vColors === 'string') { try { vColors = JSON.parse(vColors); } catch(e) { vColors = []; } }

                let cCode = (vColors && vColors.length > 0 && vColors[0].code) ? vColors[0].code : '#000';
                let cName = (vColors && vColors.length > 0 && vColors[0].name) ? vColors[0].name : 'Renk';

                let vImgList = parseImages(variant.images);
                let vImg1 = vImgList.length > 0 ? vImgList[0].trim() : (variant.image || "images/default.jpg");
                let vImg2 = vImgList.length > 4 ? vImgList[4].trim() : (vImgList.length > 1 ? vImgList[1].trim() : "");
                let vCartImg = vImgList.length > 4 ? vImgList[4].trim() : vImg1;

                let vSizesStr = variant.sizes || "";
                if (Array.isArray(vSizesStr)) vSizesStr = vSizesStr.join(',');
                let safeName = variant.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');

                if(!addedColors.has(cCode)) {
                    addedColors.add(cCode);
                    let isActive = (variant.id === product.id) ? 'active-color' : '';

                    colorsHTML += `<span class="color-dot ${isActive}" style="background-color:${cCode};" title="${cName}"
                        data-img1="${vImg1}" data-img2="${vImg2}" data-cartimg="${vCartImg}" data-id="${variant.id}" data-name="${safeName}" data-price="${variant.price}" data-sizes="${vSizesStr}"
                        onclick="event.stopPropagation(); changeVariant(this)"></span>`;
                }
            });
            colorsHTML += '</div>';

            let imgList = parseImages(product.images);
            let primaryImgSrc = imgList.length > 0 ? imgList[0].trim() : (product.image || "images/default.jpg");
            let secondaryImgSrc = imgList.length > 4 ? imgList[4].trim() : (imgList.length > 1 ? imgList[1].trim() : "");
            let cartImgSrc = imgList.length > 4 ? imgList[4].trim() : primaryImgSrc;

            let imagesHTML = `<img src="${primaryImgSrc}" class="pc-img primary-img" alt="${product.name}" onerror="this.src='https://placehold.co/600x800?text=Resim+Yok'">`;
            if(secondaryImgSrc) imagesHTML += `<img src="${secondaryImgSrc}" class="pc-img secondary-img" alt="${product.name}">`;

            // AKILLI BEDENLER VE STOK KORUMASI
            let sizesHTML = "";
            if (product.sizes) {
                let sizesArr = typeof product.sizes === 'string' ? product.sizes.split(',') : product.sizes;

                sizesHTML = sizesArr.map(s => {
                    let sizeName = s;
                    let stockCount = 999;

                    if (s.includes(':')) {
                        let parts = s.split(':');
                        sizeName = parts[0].trim().toUpperCase();
                        stockCount = parseInt(parts[1]) || 0;
                    } else {
                        sizeName = s.trim().toUpperCase();
                    }

                    let escapedName = product.name.replace(/'/g, "\\'");
                    const isOut = stockCount <= 0;
                    const isLastOne = stockCount === 1;

                    if (isOut) {
                        return `
                        <div class="qa-size-wrapper" onclick="event.stopPropagation()">
                            <button class="qa-size-btn out-of-stock">${sizeName}</button>
                            <div class="qa-size-tooltip">
                                <div class="qa-tooltip-title">Tükendi</div>
                                <div class="qa-tooltip-action" onclick="openNotifyModal(${product.id}, '${sizeName}')">Haber ver</div>
                            </div>
                        </div>`;
                    } else {
                        let badgeHtml = isLastOne ? `<div class="qa-last-one">SON 1</div>` : '';
                        return `
                        <div class="qa-size-wrapper">
                            ${badgeHtml}
                            <button class="qa-size-btn" onclick="quickAddToCart(event, ${product.id}, '${escapedName}', '${product.price}', '${sizeName}', '${cartImgSrc}')">${sizeName}</button>
                        </div>`;
                    }
                }).join('');
            }

            let tagHTML = product.tag ? `<div class="promo-tag">${product.tag}</div>` : '';
            let isFavorited = favorites.includes(product.id.toString());
            let heartFill = isFavorited ? "black" : "none";

            return `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="premium-card" onclick="goToDetail(${product.id})">

                    <div class="pc-img-wrapper">
                        ${imagesHTML}

                        <button class="pc-fav-btn" onclick="event.stopPropagation(); toggleHeart(this, ${product.id})">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="${heartFill}" stroke="black" stroke-width="1.8" stroke-linecap="square" stroke-linejoin="miter">
                                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                            </svg>
                        </button>

                        <div class="quick-add-panel">
                            <div class="qa-sizes">
                                ${sizesHTML}
                            </div>
                        </div>
                    </div>

                    <div class="pc-info">
                        <div class="product-name text-truncate"><b>${product.name}</b></div>
                        <div>${priceHTML}</div>
                        ${colorsHTML}
                        ${tagHTML}
                    </div>

                </div>
            </div>
            `;
        }).join('');
    } else {
        grid.innerHTML = `<div class='col-12 text-center mt-5'><h4 class='text-muted'>"${searchQuery || categoryFilter}" ile ilgili ürün bulunamadı.</h4></div>`;
    }
}

function changeVariant(dotEl) {
    const card = dotEl.closest('.premium-card');
    const newImg1 = dotEl.getAttribute('data-img1');
    const newImg2 = dotEl.getAttribute('data-img2');
    const newCartImg = dotEl.getAttribute('data-cartimg');
    const newId = dotEl.getAttribute('data-id');
    const newName = dotEl.getAttribute('data-name');
    const newPrice = dotEl.getAttribute('data-price');
    const newSizesStr = dotEl.getAttribute('data-sizes');

    const wrapper = card.querySelector('.pc-img-wrapper');
    const img1El = wrapper.querySelector('.primary-img');
    let img2El = wrapper.querySelector('.secondary-img');

    if(img1El) {
        img1El.style.transition = "opacity 0.2s ease-in-out";
        img1El.style.opacity = 0.5;
    }

    setTimeout(() => {
        if(img1El) { img1El.src = newImg1; img1El.style.opacity = ""; }
        if(newImg2) {
            if(!img2El) {
                img2El = document.createElement('img');
                img2El.className = "pc-img secondary-img";
                wrapper.insertBefore(img2El, img1El.nextSibling);
            }
            img2El.src = newImg2;
        } else {
            if(img2El) img2El.remove();
        }
    }, 200);

    const dots = card.querySelectorAll('.color-dot');
    dots.forEach(d => d.classList.remove('active-color'));
    dotEl.classList.add('active-color');

    card.setAttribute('onclick', `goToDetail(${newId})`);

    const sizesContainer = card.querySelector('.qa-sizes');
    if(sizesContainer && newSizesStr) {
        let sizesArr = newSizesStr.split(',');
        let newSizesHTML = sizesArr.map(s => {
            let sizeName = s;
            let stockCount = 999;
            if (s.includes(':')) {
                let parts = s.split(':');
                sizeName = parts[0].trim().toUpperCase();
                stockCount = parseInt(parts[1]) || 0;
            } else {
                sizeName = s.trim().toUpperCase();
            }

            let escapedName = newName.replace(/'/g, "\\\\'");
            const isOut = stockCount <= 0;
            const isLastOne = stockCount === 1;

            if (isOut) {
                return `
                <div class="qa-size-wrapper" onclick="event.stopPropagation()">
                    <button class="qa-size-btn out-of-stock">${sizeName}</button>
                    <div class="qa-size-tooltip">
                        <div class="qa-tooltip-title">Tükendi</div>
                        <div class="qa-tooltip-action" onclick="openNotifyModal(${newId}, '${sizeName}')">Haber ver</div>
                    </div>
                </div>`;
            } else {
                let badgeHtml = isLastOne ? `<div class="qa-last-one">SON 1</div>` : '';
                return `
                <div class="qa-size-wrapper">
                    ${badgeHtml}
                    <button class="qa-size-btn" onclick="quickAddToCart(event, ${newId}, '${escapedName}', '${newPrice}', '${sizeName}', '${newCartImg}')">${sizeName}</button>
                </div>`;
            }
        }).join('');
        sizesContainer.innerHTML = newSizesHTML;
    }
}

function goToDetail(id) {
    window.location.href = `product-detail.html?id=${id}`;
}

async function toggleHeart(btn, productId) {
    const svg = btn.querySelector('svg');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    let user = userStr ? JSON.parse(userStr) : null;
    let isFilled = svg.getAttribute('fill') === 'black';

    svg.setAttribute('fill', isFilled ? 'none' : 'black');
    svg.style.transform = "scale(1.2)";
    setTimeout(() => { svg.style.transform = "scale(1)"; }, 150);

    if (user && user.email) {
        try {
            await fetch('toggle_favorite.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, product_id: productId })
            });
        } catch(e) { console.log("DB Hatası", e); }
    } else {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        let strId = productId.toString();
        if (isFilled) { favorites = favorites.filter(id => id !== strId); }
        else { if(!favorites.includes(strId)) favorites.push(strId); }
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

function quickAddToCart(event, id, name, price, size, image) {
    event.stopPropagation();
    const btn = event.currentTarget;
    const originalText = btn.innerText;

    btn.innerText = "✓";
    btn.style.background = "#000";
    btn.style.color = "#fff";
    btn.style.borderColor = "#000";

    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = "#fff";
        btn.style.color = "#333";
        btn.style.borderColor = "#ddd";
    }, 1500);

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.id == id && item.size == size);

    if(existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price, size, image, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    if(typeof updateCartUI === 'function') updateCartUI();

    const cartOffcanvasEl = document.getElementById('cartOffcanvas');
    if(cartOffcanvasEl) {
        bootstrap.Offcanvas.getOrCreateInstance(cartOffcanvasEl).show();
    }
}
