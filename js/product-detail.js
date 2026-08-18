// ==========================================
// SEPET, NAVBAR VE ÜRÜN İŞLEMLERİ
// ==========================================
// TOAST BİLDİRİM SİSTEMİ
function injectToastSystem() { if (document.getElementById('alothing-toast-style')) return; const style = document.createElement('style'); style.id = 'alothing-toast-style'; style.innerHTML = `#alothing-toast-container { position: fixed; top: 30px; left: 50%; transform: translateX(-50%); z-index: 999999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; } .alothing-toast { min-width: 320px; background-color: #000; color: #fff; padding: 16px 24px; border-radius: 4px; font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 500; box-shadow: 0 15px 35px rgba(0,0,0,0.2); display: flex; align-items: center; opacity: 0; transform: translateY(-20px); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); letter-spacing: 0.5px; } .alothing-toast.show { opacity: 1; transform: translateY(0); } .alothing-toast.error { background-color: #dc2626; } .alothing-toast svg { margin-right: 12px; flex-shrink: 0; }`; document.head.appendChild(style); if (!document.getElementById('alothing-toast-container')) { const container = document.createElement('div'); container.id = 'alothing-toast-container'; document.body.appendChild(container); } }
function showNotification(msg, type = 'success') { injectToastSystem(); const container = document.getElementById('alothing-toast-container'); const toast = document.createElement('div'); toast.className = `alothing-toast ${type === 'error' ? 'error' : ''}`; const icon = type === 'error' ? `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>` : `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`; toast.innerHTML = `${icon} <span>${msg}</span>`; container.appendChild(toast); setTimeout(() => toast.classList.add('show'), 10); setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3500); }
let currentCartImage = "";

// --- DİNAMİK TASARIM (CSS) VE MODAL EKLENTİSİ ---
(function injectTooltipAndModal() {
    const style = document.createElement('style');
    style.innerHTML = `
        /* ANA ÜRÜN BEDENLERİ */
        .size-wrapper { position: relative; display: inline-block; margin-right: 12px; margin-top: 25px; margin-bottom: 10px; }
        .fp-size-text.out-of-stock { color: #ccc !important; text-decoration: line-through !important; border-color: #eee !important; cursor: pointer; }

        /* ORTAK TOOLTIP (Haber Ver) */
        .size-tooltip {
            position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
            margin-top: 10px; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            padding: 12px 18px; border-radius: 2px; text-align: center;
            z-index: 100; width: max-content; min-width: 130px;
            visibility: hidden; opacity: 0; transition: all 0.2s ease; border: 1px solid #f0f0f0;
        }
        .size-tooltip::before { content: ''; position: absolute; top: -7px; left: 50%; transform: translateX(-50%); border-width: 0 7px 7px 7px; border-style: solid; border-color: transparent transparent #fff transparent; }
        .size-tooltip::after { content: ''; position: absolute; top: -8px; left: 50%; transform: translateX(-50%); border-width: 0 8px 8px 8px; border-style: solid; border-color: transparent transparent #f0f0f0 transparent; z-index: -1; }
        .size-wrapper:hover .size-tooltip { visibility: visible; opacity: 1; margin-top: 8px; }
        .tooltip-title { font-size: 0.75rem; color: #999; margin-bottom: 6px; letter-spacing: 0.5px; }
        .tooltip-action { font-size: 0.85rem; font-weight: 700; color: #000; cursor: pointer; border-bottom: 1px solid transparent; transition: 0.2s; display:inline-block;}
        .tooltip-action:hover { border-bottom-color: #000; }

        /* SON 1 ROZETİ */
        .last-one-text {
            position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
            margin-bottom: 6px; font-size: 0.6rem; color: #854d0e; font-weight: 800; white-space: nowrap; background: #fef08a; padding: 3px 6px; border-radius: 2px; pointer-events: none; letter-spacing: 0.5px;
        }
        .last-one-text::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border-width: 4px; border-style: solid; border-color: #fef08a transparent transparent transparent; }

        /* ========================================== */
        /* 🔥 İLGİNİZİ ÇEKEBİLİR İÇİN KART (HIZLI EKLE & FAVORİ) CSS */
        /* ========================================== */
        .qa-size-wrapper { position: relative; display: inline-block; margin-right: 5px; margin-bottom: 5px; }
        .qa-size-btn { border: 1px solid #ddd; background: #fff; color: #000; font-size: 0.75rem; font-weight: 600; padding: 5px 10px; min-width: 35px; cursor: pointer; transition: 0.2s; }
        .qa-size-btn:hover:not(.out-of-stock) { border-color: #000; }
        .qa-size-btn.out-of-stock { color: #ccc !important; text-decoration: line-through !important; border-color: #eee !important; cursor: pointer !important; background: #f9f9f9 !important; }

        .qa-size-tooltip {
            position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 8px;
            background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.15); padding: 10px 15px; border-radius: 2px; text-align: center;
            z-index: 100; width: max-content; min-width: 120px; visibility: hidden; opacity: 0; transition: all 0.2s ease; border: 1px solid #f0f0f0;
        }
        .qa-size-tooltip::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border-width: 6px; border-style: solid; border-color: #fff transparent transparent transparent; }
        .qa-size-wrapper:hover .qa-size-tooltip { visibility: visible; opacity: 1; margin-bottom: 12px; }

        .qa-tooltip-title { font-size: 0.7rem; color: #999; margin-bottom: 4px; letter-spacing: 0.5px; }
        .qa-tooltip-action { font-size: 0.8rem; font-weight: 700; color: #000; cursor: pointer; border-bottom: 1px solid transparent; transition: 0.2s; display:inline-block;}
        .qa-tooltip-action:hover { border-bottom-color: #000; }

        .qa-last-one { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 6px; color: #854d0e; font-weight: 800; white-space: nowrap; background: #fef08a; padding: 2px 5px; border-radius: 2px; pointer-events: none; letter-spacing: 0.5px; z-index: 10; font-size: 0.55rem; }
        .qa-last-one::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border-width: 3px; border-style: solid; border-color: #fef08a transparent transparent transparent; }

        .quick-add-panel { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.95); padding: 10px; transform: translateY(100%); transition: transform 0.3s ease; display: flex; justify-content: center; align-items: center; z-index: 10; }
        .pc-img-wrapper:hover .quick-add-panel { transform: translateY(0); }
        .qa-sizes { display: flex; flex-wrap: wrap; justify-content: center; gap: 5px; }

        /* KART İÇİ FAVORİ BUTONU */
        .pc-fav-btn { position: absolute; top: 10px; right: 10px; background: transparent; border: none; padding: 5px; z-index: 20; cursor: pointer; outline: none; }
        .pc-fav-btn svg { transition: transform 0.2s ease, fill 0.2s ease; }
        .pc-fav-btn:hover svg { transform: scale(1.1); }
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

function parsePrice(priceStr) {
    if(!priceStr) return 0;
    return parseFloat(priceStr.replace('TL', '').replace(/\./g, '').replace(',', '.').trim());
}
function formatPrice(priceNum) {
    return priceNum.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL';
}

function getValidImages(imageInput) {
    if (!imageInput || imageInput === 'null') return ["images/default.jpg"];
    let imgArray = [];
    if (Array.isArray(imageInput)) { imgArray = imageInput; }
    else if (typeof imageInput === 'string') {
        if (imageInput.trim() === "") return ["images/default.jpg"];
        if (imageInput.trim().startsWith('[')) {
            try { imgArray = JSON.parse(imageInput); } catch(e) { imgArray = imageInput.split(','); }
        } else { imgArray = imageInput.split(','); }
    } else { return ["images/default.jpg"]; }

    imgArray = imgArray.map(img => {
        if (typeof img !== 'string') return "";
        let clean = img.trim();
        if (clean.startsWith('../')) clean = clean.substring(3);
        if (clean.startsWith('/')) clean = clean.substring(1);
        return clean;
    }).filter(img => img !== "");

    return imgArray.length > 0 ? imgArray : ["images/default.jpg"];
}

// ==========================================
// 1. VERİ ÇEKME VE SAYFAYI OLUŞTURMA
// ==========================================
fetch('api.php')
    .then(response => response.json())
    .then(productsData => { initDetailPage(productsData); })
    .catch(error => console.error('Veri hatası:', error));

async function checkInitialFavoriteState(productId) {
    const user = JSON.parse(localStorage.getItem('user'));
    let isFav = false;

    // 🔥 SENKRONİZASYON ADIMI: Eğer giriş yapmışsa DB'deki favorileri çeker ve LocalStorage'ı günceller
    if (user && user.email) {
        try {
            const res = await fetch(`get_favorites.php?email=${user.email}`);
            const data = await res.json();
            if(data.success) {
                localStorage.setItem('favorites', JSON.stringify(data.favorites.map(String))); // Senkronize edildi!
                if(data.favorites.map(String).includes(String(productId))) isFav = true;
            }
        } catch(e) {}
    } else {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (favorites.includes(String(productId))) isFav = true;
    }

    if (isFav) {
        document.querySelectorAll('.bookmark-icon').forEach(svg => { svg.setAttribute('fill', 'black'); });
    }
}

// 🔥 DİKKAT: Artık async yapıldı ki favoriler senkronize olmadan kartları basmasın
async function initDetailPage(products) {
    const urlParams = new URLSearchParams(window.location.search);
    const urlId = urlParams.get('id');
    if (!urlId) return;

    const product = products.find(p => p.id == urlId);

    if (product) {
        // --- DİNAMİK SEKME (TITLE) BAŞLIĞI EKLENDİ ---
        document.title = product.name + " | ALOTHING";

        // Önce DB'den favorileri çekip sistemi senkronize etmesini bekle
        await checkInitialFavoriteState(product.id);

        product.images = getValidImages(product.images);
        currentCartImage = product.images.length > 4 ? product.images[4].trim() : product.images[0].trim();

        if (typeof product.sizes === 'string') product.sizes = product.sizes.split(',').map(s => s.trim());

        let variants = product.color_group_id ? products.filter(p => p.color_group_id == product.color_group_id) : [product];

        document.getElementById('p-name').innerText = product.name;
        if(document.getElementById('p-ref')) document.getElementById('p-ref').innerText = product.ref || "0000/000";

        const modelInfoEl = document.getElementById('model-info');
        if(modelInfoEl) {
            const dbModelInfo = product.model_info || product.modelInfo;
            if(dbModelInfo && dbModelInfo.trim() !== "") {
                modelInfoEl.innerText = dbModelInfo;
                modelInfoEl.style.display = "block";
            } else { modelInfoEl.style.display = "none"; }
        }

        const priceBox = document.getElementById('p-price');
        if (product.old_price && product.old_price !== "0.00 TL" && parseFloat(product.old_price) > 0) {
            priceBox.innerHTML = `
                <div class="fp-price-top-row">
                    <span class="new-price-red">${product.price}</span>
                    <span class="discount-badge">${product.discount || '-%30'}</span>
                </div>
                <span class="old-price">${product.old_price}</span>
            `;
        } else {
            priceBox.innerHTML = `<span style="font-size:1.15rem; font-weight:800;">${product.price}</span>`;
        }

        const colorContainer = document.getElementById('color-container');
        let activeColorName = "STANDART";
        if (colorContainer) {
            colorContainer.innerHTML = "";
            variants.forEach(variant => {
                let vColors = variant.colors;
                if (typeof vColors === 'string') { try { vColors = JSON.parse(vColors); } catch(e) { vColors = []; } }
                const colorData = (vColors && vColors.length > 0) ? vColors[0] : {code: '#000', name: 'STANDART'};
                const isActive = variant.id == product.id;

                if (isActive) {
                    activeColorName = colorData.name;
                    document.getElementById('color-name').innerText = activeColorName.toUpperCase();
                }

                const btn = document.createElement('div');
                btn.className = `color-square ${isActive ? 'active' : ''}`;
                btn.style.backgroundColor = colorData.code;
                btn.title = colorData.name;
                btn.onclick = () => { if (!isActive) window.location.href = `product-detail.html?id=${variant.id}`; };
                colorContainer.appendChild(btn);
            });
        }

        // ==========================================
        // ANA ÜRÜN BEDENLERİ
        // ==========================================
        const sizeContainer = document.getElementById('size-container');
        let sizeData = [];
        if (sizeContainer && product.sizes) {
            sizeContainer.innerHTML = "";

            product.sizes.forEach(s => {
                if (s.includes(':')) {
                    let parts = s.split(':');
                    sizeData.push({ name: parts[0].trim().toUpperCase(), stock: parseInt(parts[1]) || 0 });
                } else {
                    sizeData.push({ name: s.trim().toUpperCase(), stock: 999 });
                }
            });

            sizeData.forEach(item => {
                const isOut = item.stock <= 0;
                const isLastOne = item.stock === 1;

                const wrapper = document.createElement('div');
                wrapper.className = 'size-wrapper';

                const btn = document.createElement('span');
                btn.className = isOut ? 'fp-size-text out-of-stock m-0' : 'fp-size-text m-0';
                btn.innerText = item.name;

                if (isOut) {
                    const tooltip = document.createElement('div');
                    tooltip.className = 'size-tooltip';
                    tooltip.innerHTML = `
                        <div class="tooltip-title">Tükendi</div>
                        <div class="tooltip-action" onclick="openNotifyModal(${product.id}, '${item.name}')">Haber ver</div>
                    `;
                    wrapper.appendChild(btn);
                    wrapper.appendChild(tooltip);
                } else {
                    if (isLastOne) {
                        const badge = document.createElement('div');
                        badge.className = 'last-one-text';
                        badge.innerText = 'SON 1';
                        wrapper.appendChild(badge);
                    }

                    btn.onclick = function() {
                        document.querySelectorAll('.fp-size-text').forEach(el => el.classList.remove('active'));
                        this.classList.add('active');

                        document.querySelectorAll('.psb-size').forEach(el => {
                            el.classList.remove('active', 'error');
                            if(el.getAttribute('data-size') === item.name) el.classList.add('active');
                        });
                    };
                    wrapper.appendChild(btn);
                }
                sizeContainer.appendChild(wrapper);
            });
        }

        const track = document.getElementById('slider-track');
        if(track) {
            let singleSetHTML = product.images.map(img => `<img src="${img}" class="slider-image" draggable="false">`).join('');
            track.innerHTML = singleSetHTML.repeat(7);
            initSlider();
        }

        // ==========================================
        // İLGİNİZİ ÇEKEBİLİR (KART SİSTEMİ)
        // ==========================================
        const parseCategories = (categoryData) => {
            if (typeof categoryData === 'string') return categoryData.split(',').map(c => c.trim().toLowerCase());
            if (Array.isArray(categoryData)) return categoryData.map(c => c.trim().toLowerCase());
            return [];
        };

        const womenCats = ["wceket", "wpantolon", "wkot-pantolon", "elbise", "wsweatshirt", "wkazak", "wtisort", "wayakkabi", "canta", "wsapka", "bluz", "crop", "abiye", "tayt", "wsort", "etek"];
        const menCats = ["ceket", "pantolon", "kot-pantolon", "sweatshirt", "kazak", "tisort", "gomlek", "ayakkabi", "canta", "sapka", "sort"];

        const similarGrid = document.getElementById('similar-products-grid');
        if (similarGrid) {
            const pCats = parseCategories(product.category);
            let isWomanProduct = pCats.some(c => womenCats.includes(c));
            let isManProduct = pCats.some(c => menCats.includes(c));

            const related = products.filter(p => {
                if (p.id === product.id) return false;
                if (product.color_group_id && p.color_group_id && product.color_group_id === p.color_group_id) return false;

                const otherCats = parseCategories(p.category);
                let otherIsWoman = otherCats.some(c => womenCats.includes(c));
                let otherIsMan = otherCats.some(c => menCats.includes(c));

                if (isWomanProduct && otherIsWoman) return true;
                if (isManProduct && otherIsMan) return true;

                return false;
            }).slice(0);

            // DB'den senkronize olan en güncel veriyi çeker
            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

            if (related.length > 0) {
                similarGrid.innerHTML = related.map(p => {
                    let priceHTML = `<span class="fw-bold text-dark small">${p.price}</span>`;
                    if (p.old_price && p.old_price !== "0.00 TL" && parseFloat(p.old_price) > 0) {
                        priceHTML = `<span class="text-decoration-line-through text-muted small me-1">${p.old_price}</span> <span class="fw-bold text-danger small">${p.price}</span>`;
                    }

                    // Varyant Renkleri
                    let colorsHTML = '<div class="d-flex align-items-center mt-1">';
                    let relVariants = p.color_group_id ? products.filter(vp => vp.color_group_id == p.color_group_id) : [p];

                    let addedColors = new Set();
                    relVariants.forEach(variant => {
                        let vColors = variant.colors;
                        if (typeof vColors === 'string') { try { vColors = JSON.parse(vColors); } catch(e) { vColors = []; } }

                        let cCode = (vColors && vColors.length > 0 && vColors[0].code) ? vColors[0].code : '#000';
                        let cName = (vColors && vColors.length > 0 && vColors[0].name) ? vColors[0].name : 'Renk';

                        let vImgList = getValidImages(variant.images);
                        let vImg1 = vImgList.length > 0 ? vImgList[0].trim() : (variant.image || "images/default.jpg");
                        let vImg2 = vImgList.length > 4 ? vImgList[4].trim() : (vImgList.length > 1 ? vImgList[1].trim() : "");
                        let vCartImg = vImgList.length > 4 ? vImgList[4].trim() : vImg1;

                        let vSizesStr = variant.sizes || "";
                        if (Array.isArray(vSizesStr)) vSizesStr = vSizesStr.join(',');
                        let safeName = variant.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');

                        if(!addedColors.has(cCode)) {
                            addedColors.add(cCode);
                            let isActive = (variant.id === p.id) ? 'active-color' : '';

                            colorsHTML += `<span class="color-dot ${isActive}" style="background-color:${cCode};" title="${cName}"
                                data-img1="${vImg1}" data-img2="${vImg2}" data-cartimg="${vCartImg}" data-id="${variant.id}" data-name="${safeName}" data-price="${variant.price}" data-sizes="${vSizesStr}"
                                onclick="event.stopPropagation(); changeVariant(this)"></span>`;
                        }
                    });
                    colorsHTML += '</div>';

                    // Resimler
                    let imgList = getValidImages(p.images);
                    let primaryImgSrc = imgList.length > 0 ? imgList[0].trim() : (p.image || "images/default.jpg");
                    let secondaryImgSrc = imgList.length > 4 ? imgList[4].trim() : (imgList.length > 1 ? imgList[1].trim() : "");
                    let cartImgSrc = imgList.length > 4 ? imgList[4].trim() : primaryImgSrc;

                    let imagesHTML = `<img src="${primaryImgSrc}" class="pc-img primary-img w-100 h-100 object-fit-cover" alt="${p.name}" style="transition:0.5s;">`;
                    if(secondaryImgSrc) imagesHTML += `<img src="${secondaryImgSrc}" class="pc-img secondary-img" alt="${p.name}" style="display:none;">`;

                    // Hızlı Ekle Bedenleri
                    let sizesHTML = "";
                    if (p.sizes) {
                        let sizesArr = typeof p.sizes === 'string' ? p.sizes.split(',') : p.sizes;
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

                            let escapedName = p.name.replace(/'/g, "\\'");
                            const isOut = stockCount <= 0;
                            const isLastOne = stockCount === 1;

                            if (isOut) {
                                return `
                                <div class="qa-size-wrapper" onclick="event.stopPropagation()">
                                    <button class="qa-size-btn out-of-stock">${sizeName}</button>
                                    <div class="qa-size-tooltip">
                                        <div class="qa-tooltip-title">Tükendi</div>
                                        <div class="qa-tooltip-action" onclick="openNotifyModal(${p.id}, '${sizeName}')">Haber ver</div>
                                    </div>
                                </div>`;
                            } else {
                                let badgeHtml = isLastOne ? `<div class="qa-last-one">SON 1</div>` : '';
                                return `
                                <div class="qa-size-wrapper">
                                    ${badgeHtml}
                                    <button class="qa-size-btn" onclick="quickAddToCart(event, ${p.id}, '${escapedName}', '${p.price}', '${sizeName}', '${cartImgSrc}')">${sizeName}</button>
                                </div>`;
                            }
                        }).join('');
                    }

                    // Senkronize Kalp Durumu Kontrolü
                    let isFavorited = favorites.includes(p.id.toString());
                    let heartFill = isFavorited ? "black" : "none";

                    return `
                    <div class="col-6 col-md-3 mb-4">
                        <div class="premium-card border-0" onclick="window.location.href='product-detail.html?id=${p.id}'" style="cursor:pointer; position:relative;">

                            <div class="card-img-wrapper pc-img-wrapper bg-light mb-2" style="aspect-ratio: 3/4; overflow:hidden; position:relative;">
                                ${imagesHTML}

                                <button class="pc-fav-btn" onclick="event.stopPropagation(); toggleHeart(this, ${p.id})">
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

                            <div class="fw-bold text-dark small text-truncate">${p.name}</div>
                            <div>${priceHTML}</div>
                            ${colorsHTML}
                        </div>
                    </div>`;
                }).join('');
            } else {
                similarGrid.innerHTML = `<p class="text-center text-muted">Önerilecek ürün bulunamadı.</p>`;
            }
        }

        // ==========================================
        // ALT STICKY BAR VERİ DOLDURMA
        // ==========================================
        const psbTitle = document.getElementById('psb-title');
        const psbImg = document.getElementById('psb-img');
        if(psbImg) psbImg.src = currentCartImage;
        const psbColor = document.getElementById('psb-color');
        if(psbColor) psbColor.innerText = activeColorName.toUpperCase();
        const psbPrice = document.getElementById('psb-price');
        const psbSizesContainer = document.getElementById('psb-sizes-container');

        if(psbTitle) psbTitle.innerText = product.name;
        if(psbPrice) psbPrice.innerHTML = `<span class="fw-bold">${product.price}</span>`;

        if (psbSizesContainer && sizeData.length > 0) {
            psbSizesContainer.innerHTML = "";

            sizeData.forEach(item => {
                const span = document.createElement('span');
                const isOut = item.stock <= 0;

                span.className = `psb-size ${isOut ? 'out-of-stock' : ''}`;
                span.setAttribute('data-size', item.name);
                span.innerText = item.name;

                if(!isOut) {
                    span.onclick = function() {
                        document.querySelectorAll('.psb-size, .fp-size-text').forEach(el => el.classList.remove('active', 'error'));
                        this.classList.add('active');
                        document.querySelectorAll('.fp-size-text').forEach(el => {
                            if(el.innerText === item.name) el.classList.add('active');
                        });
                    };
                } else {
                    span.style.opacity = '0.4';
                    span.style.textDecoration = 'line-through';
                    span.style.cursor = 'pointer';
                    span.title = "Haber Ver";
                    span.onclick = () => openNotifyModal(product.id, item.name);
                }
                psbSizesContainer.appendChild(span);
            });
        }

        // ==========================================
        // SEPETE EKLEME KONTROLÜ
        // ==========================================
        const addToCartLogic = () => {
            const selectedSizeEl = document.querySelector('.fp-size-text.active') || document.querySelector('.psb-size.active');

            if (!selectedSizeEl) {
                const psbSizes = document.querySelectorAll('.psb-size');
                if (psbSizes.length > 0) {
                    psbSizes.forEach(el => {
                        el.classList.remove('error');
                        void el.offsetWidth;
                        el.classList.add('error');
                    });
                } else { showNotification("Lütfen sepete eklemeden önce bir beden seçin.","error"); }
                return;
            }

            if (selectedSizeEl.classList.contains('out-of-stock')) {
                showNotification("Bu beden tükendiği için sepete eklenemez. Stok gelince haber ver sistemine kayıt olabilirsiniz.","error");
                return;
            }

            const selectedSize = selectedSizeEl.innerText;
            const cartItem = {
                id: product.id, name: product.name, price: product.price,
                size: selectedSize, image: currentCartImage, quantity: 1
            };

            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItemIndex = cart.findIndex(item => item.id === cartItem.id && item.size === cartItem.size);

            if (existingItemIndex > -1) cart[existingItemIndex].quantity += 1;
            else cart.push(cartItem);

            localStorage.setItem('cart', JSON.stringify(cart));
            if (typeof updateCartUI === 'function') updateCartUI();

            const cartOffcanvasEl = document.getElementById('cartOffcanvas');
            if (cartOffcanvasEl) bootstrap.Offcanvas.getOrCreateInstance(cartOffcanvasEl).show();
        };

        const addBtnMain = document.querySelector('.fp-add-to-cart');
        if(addBtnMain) addBtnMain.onclick = addToCartLogic;

        const addBtnSticky = document.getElementById('psb-add-btn');
        if(addBtnSticky) addBtnSticky.onclick = addToCartLogic;
    }
}

// ==========================================
// 3. SLIDER, MODAL İŞLEMLERİ
// ==========================================
function initSlider() {
    const track = document.getElementById('slider-track');
    const playBtn = document.getElementById('play-pause-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const sliderSection = document.querySelector('.hero-slider-section');

    let isDown = false; let startX, scrollLeftPos;
    let autoPlayInterval; let isPlaying = true;

    setTimeout(() => { let setWidth = track.scrollWidth / 7; track.scrollLeft = setWidth * 1; }, 150);

    function startAutoPlay() {
        if(!isPlaying) return;
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(() => {
            if(!isDown) { track.style.scrollBehavior = 'smooth'; track.scrollLeft += track.querySelector('.slider-image').clientWidth; }
        }, 2000);
    }

    function pauseAutoPlay() { clearInterval(autoPlayInterval); }
    startAutoPlay();

    if(playBtn) {
        playBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            if(isPlaying) { startAutoPlay(); playIcon.style.display = 'none'; pauseIcon.style.display = 'block'; }
            else { pauseAutoPlay(); playIcon.style.display = 'block'; pauseIcon.style.display = 'none'; }
        });
    }

    if(fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) { sliderSection.requestFullscreen().catch(err => console.log(err)); }
            else { document.exitFullscreen(); }
        });
    }

    track.addEventListener('mousedown', (e) => {
        isDown = true; track.style.scrollBehavior = 'auto';
        startX = e.pageX - track.offsetLeft; scrollLeftPos = track.scrollLeft; pauseAutoPlay();
    });

    track.addEventListener('mouseleave', () => { isDown = false; if(isPlaying) startAutoPlay(); });
    track.addEventListener('mouseup', () => { isDown = false; if(isPlaying) startAutoPlay(); });

    track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        track.scrollLeft = scrollLeftPos - ((e.pageX - track.offsetLeft - startX) * 1.2);
        let setWidth = track.scrollWidth / 7;
        if (track.scrollLeft < setWidth * 2) { track.scrollLeft += setWidth * 2; scrollLeftPos += setWidth * 2; }
        else if (track.scrollLeft > setWidth * 5) { track.scrollLeft -= setWidth * 2; scrollLeftPos -= setWidth * 2; }
    });

    track.addEventListener('scroll', () => {
        if(isDown) return;
        let setWidth = track.scrollWidth / 7;
        if(track.scrollLeft > setWidth * 5.5) {
            setTimeout(() => { track.style.scrollBehavior = 'auto'; track.scrollLeft -= setWidth * 2; }, 300);
        }
    });
}

// ==========================================
// 🔥 TAM SENKRONİZE EDİLMİŞ FAVORİ FONKSİYONLARI
// ==========================================

// BU FONKSİYON ANA SAYFADAKİ KOCAMAN KALP İÇİN
async function toggleFavorite() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (!productId) return;

    const svgs = document.querySelectorAll('.bookmark-icon');
    if(svgs.length === 0) return;

    let isCurrentlyFilled = svgs[0].getAttribute('fill') === 'black';
    let newFill = isCurrentlyFilled ? 'none' : 'black';

    svgs.forEach(svg => {
        svg.setAttribute('fill', newFill);
        svg.style.transform = "scale(1.2)";
        setTimeout(() => { svg.style.transform = "scale(1)"; }, 150);
    });

    // 1. HER ZAMAN ÖNCE LOCALSTORAGE'I GÜNCELLE (Arayüz Senkronizasyonu)
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let strId = String(productId);
    if (isCurrentlyFilled) {
        favorites = favorites.filter(id => id !== strId);
    } else {
        if(!favorites.includes(strId)) favorites.push(strId);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));

    // 2. KULLANICI GİRİŞ YAPMIŞSA DB'Yİ DE GÜNCELLE
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
        try {
            await fetch('toggle_favorite.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, product_id: productId })
            });
        } catch(e) { console.log("DB Hatası"); }
    }
}

// BU FONKSİYON KARTLARDAKİ (İLGİNİZİ ÇEKEBİLİR) KÜÇÜK KALP İÇİN
async function toggleHeart(btn, productId) {
    const svg = btn.querySelector('svg');
    let isFilled = svg.getAttribute('fill') === 'black';

    svg.setAttribute('fill', isFilled ? 'none' : 'black');
    svg.style.transform = "scale(1.2)";
    setTimeout(() => { svg.style.transform = "scale(1)"; }, 150);

    // 1. HER ZAMAN ÖNCE LOCALSTORAGE'I GÜNCELLE (Arayüz Senkronizasyonu)
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let strId = productId.toString();
    if (isFilled) {
        favorites = favorites.filter(id => id !== strId);
    } else {
        if(!favorites.includes(strId)) favorites.push(strId);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));

    // 2. KULLANICI GİRİŞ YAPMIŞSA DB'Yİ DE GÜNCELLE
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
        try {
            await fetch('toggle_favorite.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, product_id: productId })
            });
        } catch(e) { console.log("DB Hatası", e); }
    }
}

// STICKY BAR GİZLE/GÖSTER
document.addEventListener('DOMContentLoaded', () => {
    const stickyBar = document.getElementById('bottom-sticky-bar');
    if(stickyBar) {
        stickyBar.style.position = 'fixed'; stickyBar.style.bottom = '0';
        stickyBar.style.left = '0';
        stickyBar.style.width = '100%';
        stickyBar.style.zIndex = '999';
        stickyBar.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        stickyBar.style.transform = 'translateY(100%)';
        stickyBar.style.opacity = '0';
        stickyBar.style.visibility = 'hidden';
    }
});

window.addEventListener('scroll', () => {
    const mainAddToCartBtn = document.querySelector('.fp-add-to-cart');
    const premiumStickyBar = document.getElementById('premium-sticky-bar');

    if (mainAddToCartBtn && premiumStickyBar) {
        const btnRect = mainAddToCartBtn.getBoundingClientRect();
        if (btnRect.bottom < 0) {
            premiumStickyBar.classList.add('visible');
        } else {
            premiumStickyBar.classList.remove('visible');
        }
    }
});

// ==========================================
// HABER VER MODALI VE İŞLEMLERİ
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

// ==========================================
// HIZLI SEPETE EKLEME FONKSİYONU
// ==========================================
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
                img2El.className = "pc-img secondary-img w-100 h-100 object-fit-cover";
                img2El.style.position = "absolute";
                img2El.style.top = "0";
                img2El.style.left = "0";
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

    card.setAttribute('onclick', `window.location.href='product-detail.html?id=${newId}'`);

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
// ==========================================
// ÖLÇÜ REHBERİ (SIZE GUIDE) SİSTEMİ
// ==========================================
function openSizeGuide(e) {
    if(e) e.preventDefault();

    // Eğer modal daha önce eklenmediyse, HTML içine dinamik olarak yaratıp ekler
    if (!document.getElementById('sizeGuideModal')) {
        const modalHtml = `
        <div class="modal fade" id="sizeGuideModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content rounded-0 border-0 shadow-lg">
                    <div class="modal-header border-bottom-0 p-4 pb-2">
                        <h5 class="modal-title fw-bold text-uppercase" style="letter-spacing: 1px;">ÖLÇÜ REHBERİ</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4 pt-0">

                        <ul class="nav nav-tabs mb-4" id="sizeTabs" style="border-bottom: 2px solid #eaeaea;">
                          <li class="nav-item">
                            <button class="nav-link active fw-bold px-4 py-3" id="women-tab" data-bs-toggle="tab" data-bs-target="#women-size" type="button" style="color: #000; border: none; border-bottom: 2px solid #000; margin-bottom: -2px;">KADIN</button>
                          </li>
                          <li class="nav-item">
                            <button class="nav-link fw-bold px-4 py-3 text-muted" id="men-tab" data-bs-toggle="tab" data-bs-target="#men-size" type="button" style="border: none; border-bottom: 2px solid transparent; margin-bottom: -2px;">ERKEK</button>
                          </li>
                        </ul>

                        <div class="tab-content" id="sizeTabsContent">
                          <div class="tab-pane fade show active" id="women-size">
                              <div class="table-responsive">
                                  <table class="table table-bordered text-center align-middle mb-0">
                                      <thead class="bg-light text-muted small" style="letter-spacing:1px;">
                                          <tr><th>BEDEN</th><th>GÖĞÜS (cm)</th><th>BEL (cm)</th><th>BASEN (cm)</th></tr>
                                      </thead>
                                      <tbody>
                                          <tr><td class="fw-bold">XS / 34</td><td>82 - 86</td><td>62 - 66</td><td>90 - 94</td></tr>
                                          <tr><td class="fw-bold">S / 36</td><td>86 - 90</td><td>66 - 70</td><td>94 - 98</td></tr>
                                          <tr><td class="fw-bold">M / 38</td><td>90 - 94</td><td>70 - 74</td><td>98 - 102</td></tr>
                                          <tr><td class="fw-bold">L / 40</td><td>94 - 100</td><td>74 - 80</td><td>102 - 108</td></tr>
                                          <tr><td class="fw-bold">XL / 42</td><td>100 - 106</td><td>80 - 86</td><td>108 - 114</td></tr>
                                      </tbody>
                                  </table>
                              </div>
                          </div>

                          <div class="tab-pane fade" id="men-size">
                              <div class="table-responsive">
                                  <table class="table table-bordered text-center align-middle mb-0">
                                      <thead class="bg-light text-muted small" style="letter-spacing:1px;">
                                          <tr><th>BEDEN</th><th>GÖĞÜS (cm)</th><th>BEL (cm)</th><th>BASEN (cm)</th></tr>
                                      </thead>
                                      <tbody>
                                          <tr><td class="fw-bold">S</td><td>90 - 94</td><td>78 - 82</td><td>94 - 98</td></tr>
                                          <tr><td class="fw-bold">M</td><td>94 - 98</td><td>82 - 86</td><td>98 - 102</td></tr>
                                          <tr><td class="fw-bold">L</td><td>98 - 102</td><td>86 - 90</td><td>102 - 106</td></tr>
                                          <tr><td class="fw-bold">XL</td><td>102 - 106</td><td>90 - 94</td><td>106 - 110</td></tr>
                                          <tr><td class="fw-bold">XXL</td><td>106 - 110</td><td>94 - 98</td><td>110 - 114</td></tr>
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                        </div>

                        <p class="text-muted small mt-4 text-center mb-0" style="line-height:1.6;">Bu ölçüler standart vücut tipleri için referans amaçlıdır. Modele ve kesime (Oversize, Slim Fit vb.) göre ufak farklılıklar gösterebilir.</p>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Sekme Değişimlerinde Siyah Alt Çizgi Efekti
        document.querySelectorAll('#sizeTabs .nav-link').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('#sizeTabs .nav-link').forEach(t => {
                    t.style.color = '#6c757d';
                    t.style.borderBottomColor = 'transparent';
                });
                this.style.color = '#000';
                this.style.borderBottomColor = '#000';
            });
        });
    }

    // Modalı Aç
    const modalInstance = bootstrap.Modal.getOrCreateInstance(document.getElementById('sizeGuideModal'));
    modalInstance.show();
}
// ==========================================
// MÜŞTERİ YORUMLARI SİSTEMİ (OFFCANVAS)
// ==========================================

// Sayfa Yüklenirken Yorum Skorunu Çek
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pId = urlParams.get('id');
    if(pId) {
        fetch(`get_comments.php?id=${pId}`)
            .then(res => res.json())
            .then(data => {
                if(data.success && data.comments.length > 0) {
                    const avgDisplay = document.getElementById('avgRatingDisplay');
                    if(avgDisplay) avgDisplay.innerText = data.avgRating + " / 5";
                }
            }).catch(e => console.log(e));
    }
});

// Yıldız Seçim Sistemini Başlat (Titreşim Hatası Giderildi)
function initStarRating() {
    const container = document.getElementById('starRatingSelector');
    if(!container) return;

    container.innerHTML = "";
    for(let i=1; i<=5; i++) {
        const star = document.createElement('span');
        star.style.cursor = 'pointer';
        star.style.padding = "0 3px"; // Tıklama alanı biraz daha genişletildi

        // İçerik silinip yazılmayacak, sadece renk özelliği değiştirilecek.
        star.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" style="transition: all 0.2s ease;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#ccc" stroke-width="2" fill="none"/></svg>`;
        star.dataset.val = i;

        // Sadece rengi (fill ve stroke) değiştiren akıllı hover sistemi
        star.addEventListener('mouseover', () => updateStars(container, i));
        star.addEventListener('mouseleave', () => updateStars(container, document.getElementById('selectedRating').value || 5));

        star.addEventListener('click', () => {
            document.getElementById('selectedRating').value = i;
            updateStars(container, i);
        });

        container.appendChild(star);
    }

    // Form ilk açıldığında 5 yıldız seçili gelsin
    document.getElementById('selectedRating').value = 5;
    updateStars(container, 5);
}

// Sadece SVG içindeki Path'in Rengini Değiştirir
function updateStars(container, count) {
    Array.from(container.children).forEach((star, index) => {
        const path = star.querySelector('path');
        if (index < count) {
            path.setAttribute('fill', '#000');   // İçini siyah doldur
            path.setAttribute('stroke', '#000'); // Çerçevesini siyah yap
        } else {
            path.setAttribute('fill', 'none');   // İçini boşalt
            path.setAttribute('stroke', '#ccc'); // Çerçevesini gri yap
        }
    });
}

// Offcanvas'ı Aç ve Yorumları Yükle
function openCommentsOffcanvas() {
    const urlParams = new URLSearchParams(window.location.search);
    const pId = urlParams.get('id');
    if(!pId) return;

    initStarRating();

    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = `<div class="text-center py-5"><span class="spinner-border spinner-border-sm text-dark"></span></div>`;

    const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('commentsOffcanvas'));
    offcanvas.show();

    fetch(`get_comments.php?id=${pId}`)
        .then(res => res.json())
        .then(data => {
            if(data.success && data.comments.length > 0) {
                commentsList.innerHTML = data.comments.map(c => `
                    <div class="mb-4 pb-3 border-bottom border-light">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="fw-bold" style="font-size: 0.85rem;">${c.user_name}</span>
                            <span class="text-muted" style="font-size: 0.7rem;">${new Date(c.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div class="mb-2 d-flex gap-1">
                            ${`<svg width="14" height="14" fill="#000" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`.repeat(c.rating)}
                            ${`<svg width="14" height="14" fill="none" stroke="#ccc" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`.repeat(5 - c.rating)}
                        </div>
                        <p class="text-muted mb-0" style="font-size: 0.9rem; line-height: 1.5;">${c.comment}</p>
                    </div>
                `).join('');
                document.getElementById('avgRatingDisplay').innerText = data.avgRating + " / 5";
            } else {
                commentsList.innerHTML = `<div class="text-center text-muted small py-5 mt-4">Bu ürün için henüz yorum yapılmamış.<br>İlk yorum yapan siz olun!</div>`;
            }
        }).catch(() => {
            commentsList.innerHTML = `<div class="text-center text-danger small py-5 mt-4">Yorumlar yüklenemedi. Lütfen sayfayı yenileyin.</div>`;
        });
}

// Yorum Gönder
async function submitComment(e) {
    e.preventDefault();

    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if(!user) {
        showNotification("Yorum yapabilmek için giriş yapmalısınız.", "error");
        setTimeout(() => {
            bootstrap.Offcanvas.getInstance(document.getElementById('commentsOffcanvas')).hide();
            if(typeof openLoginOffcanvas === 'function') openLoginOffcanvas('login');
        }, 1000);
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const pId = urlParams.get('id');
    const commentText = document.getElementById('commentText').value.trim();
    const rating = document.getElementById('selectedRating').value || 5;

    const btn = document.getElementById('btnSubmitComment');
    btn.disabled = true; btn.innerText = "GÖNDERİLİYOR...";

    try {
        const res = await fetch('add_comment.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: pId, user_email: user.email, user_name: user.name, rating: rating, comment: commentText })
        });
        const result = await res.json();

        if(result.success) {
                // YENİ BİLDİRİM VE İŞLEM
                showNotification("Yorumunuz alındı. Yönetici onayından sonra yayınlanacaktır.");
                document.getElementById('commentForm').reset();
                initStarRating();
                // Paneli kapatalım ki kullanıcı yorumunu anında göremeyince hata sanmasın
                bootstrap.Offcanvas.getInstance(document.getElementById('commentsOffcanvas')).hide();
            } else  {
            showNotification("Yorum gönderilemedi.", "error");
        }
    } catch(err) {
        showNotification("Bağlantı hatası.", "error");
    } finally {
        btn.disabled = false; btn.innerText = "GÖNDER";
    }
}
