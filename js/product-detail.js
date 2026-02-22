// --- PRODUCT-DETAIL.JS (RENK SORUNU GİDERİLDİ) ---

fetch('api.php')
    .then(response => response.json())
    .then(productsData => {
        initDetailPage(productsData);
    })
    .catch(error => console.error('Veri hatası:', error));

function initDetailPage(products) {
    const urlParams = new URLSearchParams(window.location.search);
    const urlId = urlParams.get('id');
    if (!urlId) return;

    // ID eşleşmesi (Tip güvenli)
    const product = products.find(p => p.id == urlId);

    if (product) {

        // --- VERİ TEMİZLİĞİ (STRING -> ARRAY) ---
        // Resimler
        if (typeof product.images === 'string') {
            // Köşeli parantez varsa JSON parse, yoksa virgül ayır
            product.images = product.images.includes('[') ? JSON.parse(product.images) : product.images.split(',');
        } else if (!product.images) {
            product.images = ["https://placehold.co/600x800"];
        }

        // Bedenler
        if (typeof product.sizes === 'string') product.sizes = product.sizes.split(',').map(s => s.trim());

        // --- RENK GRUPLAMA (KARDEŞ ÜRÜNLERİ BULMA) ---
        // Aynı gruptaki diğer ürünleri bul
        let variants = [];
        if (product.color_group_id) {
            // color_group_id'si aynı olanları bul (String/Int farketmez)
            variants = products.filter(p => p.color_group_id == product.color_group_id);
        } else {
            // Grubu yoksa sadece kendisi
            variants = [product];
        }


        // --- TEMEL BİLGİLER ---
        document.getElementById('p-name').innerText = product.name;
        if(document.getElementById('p-ref')) document.getElementById('p-ref').innerText = product.ref || "";

        // Sticky Bar
        if(document.getElementById('sticky-name')) document.getElementById('sticky-name').innerText = product.name;
        if(document.getElementById('sticky-img')) document.getElementById('sticky-img').src = product.images[0];

        // Fiyat
        const priceHTML = product.old_price
            ? `<div class="d-flex align-items-center gap-2"><span class="text-danger fw-bold fs-4">${product.price}</span><span class="badge bg-danger">${product.discount||'%'}</span><span class="text-decoration-line-through text-muted small">${product.old_price}</span></div>`
            : `<span class="fs-5 fw-bold text-dark">${product.price}</span>`;

        if(document.getElementById('p-price')) document.getElementById('p-price').innerHTML = priceHTML;
        if(document.getElementById('sticky-price-box')) document.getElementById('sticky-price-box').innerHTML = priceHTML;


        // --- RENK SEÇİM ALANI (BURASI DÜZELDİ) ---
        const colorContainer = document.getElementById('color-container');
        const colorNameLabel = document.getElementById('color-name');

        if (colorContainer) {
            colorContainer.innerHTML = ""; // Temizle

            variants.forEach(variant => {
                // Her varyantın kendi rengini parse et
                let vColors = variant.colors;
                if (typeof vColors === 'string') {
                    try { vColors = JSON.parse(vColors); } catch(e) { vColors = []; }
                }

                // İlk rengi al (Genelde 1 ürün = 1 renk kodu)
                const colorData = (vColors && vColors.length > 0) ? vColors[0] : {code: '#000', name: 'Standart'};
                const isActive = variant.id == product.id;

                if (isActive) {
                    if(colorNameLabel) colorNameLabel.innerText = colorData.name;
                    // Sticky Bar Rengi
                    const sDot = document.getElementById('sticky-color-dot');
                    const sName = document.getElementById('sticky-color-name');
                    if(sDot) sDot.style.backgroundColor = colorData.code;
                    if(sName) sName.innerText = colorData.name;
                }

                // Butonu Oluştur
                const btn = document.createElement('div');
                btn.className = `color-option ${isActive ? 'active' : ''}`;
                btn.style.backgroundColor = colorData.code;
                btn.title = colorData.name;

                // Tıklayınca Git
                btn.onclick = function() {
                    if (!isActive) window.location.href = `product-detail.html?id=${variant.id}`;
                };
                colorContainer.appendChild(btn);
            });
        }

// --- MODEL ---
const modelInfoData = product.model_info || product.modelInfo || "Model bilgisi standart";
if(document.getElementById('model-info')) {
    document.getElementById('model-info').innerText = modelInfoData;
}
        // --- BEDENLER ---
        const sizeContainer = document.getElementById('size-container');
        if (sizeContainer && product.sizes) {
            sizeContainer.innerHTML = "";
            product.sizes.forEach(size => {
                const btn = document.createElement('div');
                btn.className = 'size-option';
                btn.innerText = size;
                btn.onclick = function() {
                    document.querySelectorAll('.size-option').forEach(el => el.classList.remove('active'));
                    this.classList.add('active');
                };
                sizeContainer.appendChild(btn);
            });
        }

        // --- RESİMLER (GRID) ---
        const imgContainer = document.getElementById('image-container');
        if(imgContainer) {
            imgContainer.innerHTML = "";
            imgContainer.className = "row g-1";
            const total = product.images.length;
            const isEven = total % 2 === 0;

            product.images.forEach((img, i) => {
                let cls = 'col-6';
                if (total === 1) cls = 'col-12';
                else if (total >= 5 && !isEven && i >= total - 3) cls = 'col-4';

                const col = document.createElement('div');
                col.className = cls;
                col.innerHTML = `<img src="${img.trim()}" class="product-grid-img w-100" style="object-fit:cover;">`;
                imgContainer.appendChild(col);
            });
        }

        // --- İLGİNİZİ ÇEKEBİLİR (FİLTRELEME DÜZELDİ) ---
        const similarGrid = document.getElementById('similar-products-grid');
        if (similarGrid) {
            // 1. Kategorileri Çıkar
            let pCats = typeof product.category === 'string' ? product.category.split(',') : (Array.isArray(product.category) ? product.category : []);

            // 2. Filtrele
            let related = products.filter(p => {
                // Kendisi olmasın
                if (p.id == product.id) return false;

                // Aynı renk grubundan (kardeşi) olmasın! (BU YENİ)
                if (product.color_group_id && p.color_group_id == product.color_group_id) return false;

                // Kategori eşleşmesi var mı?
                let otherCats = typeof p.category === 'string' ? p.category.split(',') : (Array.isArray(p.category) ? p.category : []);
                return pCats.some(c => otherCats.includes(c.trim()));
            });

            // Yetersizse doldur
            if(related.length < 4) {
                const others = products.filter(p => p.id != product.id && (!product.color_group_id || p.color_group_id != product.color_group_id) && !related.includes(p));
                related = related.concat(others);
            }

            const finalRelated = related.slice(0, 8);

            // HTML Bas
            if (finalRelated.length > 0) {
                similarGrid.innerHTML = finalRelated.map(p => {
                    let pImg = (typeof p.images === 'string' ? p.images.split(',')[0] : (Array.isArray(p.images) ? p.images[0] : p.image)) || "https://placehold.co/600x800";
                    let priceDisp = `<span class="fw-bold text-dark small">${p.price}</span>`;
                    if (p.old_price) priceDisp = `<span class="text-decoration-line-through text-muted small me-1">${p.old_price}</span> <span class="fw-bold text-danger small">${p.price}</span>`;

                    return `
                    <div class="col-6 col-md-4 col-lg-3">
                        <div class="product-card border-0" onclick="window.location.href='product-detail.html?id=${p.id}'" style="cursor:pointer;">
                            <div class="card-img-wrapper bg-light mb-2" style="aspect-ratio: 3/4; overflow:hidden;">
                                <img src="${pImg}" class="w-100 h-100 object-fit-cover" style="transition:0.5s;">
                            </div>
                            <div class="d-flex justify-content-between align-items-start">
                                <div><div class="fw-bold text-dark small text-truncate" style="max-width:150px;">${p.name}</div><div>${priceDisp}</div></div>
                                <div><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg></div>
                            </div>
                        </div>
                    </div>`;
                }).join('');
            }
        }

        // --- SCROLL EVENT ---
        window.addEventListener('scroll', function() {
            const bar = document.getElementById('sticky-cart-bar');
            const sec = document.getElementById('similar-products-grid');
            if (bar && sec) {
                // Bölümün tepesinden 300px sonra aç
                if ((window.scrollY + window.innerHeight) > (sec.offsetTop + 300)) bar.classList.add('visible');
                else bar.classList.remove('visible');
            }
        });

    } else { alert("Ürün bulunamadı!"); }
}
