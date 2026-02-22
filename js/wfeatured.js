// --- ANASAYFA İLGİNİZİ ÇEKEBİLİR (SLIDER + FİLTRELİ) ---
fetch('api.php')
    .then(response => response.json())
    .then(products => {
        const scrollContainer = document.getElementById('product-scroll-container'); // ID'yi güncelledik

        if (scrollContainer) {
            // 1. İSTEDİĞİN KATEGORİLER
            const hedefKategoriler = ["wceket", "wpantolon", "wsweatshirt", "wtisort", "wgomlek", "wsort", "wkazak", "wkot-pantolon","wayakkabi","wsapka","elbise","canta","bluz","crop","abiye","tayt","etek"];

            // 2. FİLTRELEME
            const erkekUrunleri = products.filter(p => {
                let pCat = p.category;
                if (typeof pCat === 'string') return pCat.includes(',') ? hedefKategoriler.some(k => pCat.includes(k)) : hedefKategoriler.includes(pCat);
                if (Array.isArray(pCat)) return pCat.some(c => hedefKategoriler.includes(c));
                return false;
            });

            // 3. KARIŞTIR VE İLK 10 TANEYİ AL
            const randomProducts = erkekUrunleri.sort(() => 0.5 - Math.random()).slice(0, 10);

            // 4. HTML OLUŞTUR (YENİ SLIDER TASARIMI)
            scrollContainer.innerHTML = randomProducts.map(p => {

                // Resim Seçimi
                let img = "https://placehold.co/600x800";
                if (Array.isArray(p.images) && p.images.length > 0) img = p.images[0];
                else if (typeof p.images === 'string') {
                    if (p.images.includes('[')) { try { img = JSON.parse(p.images)[0]; } catch(e){} }
                    else if (p.images.includes(',')) { img = p.images.split(',')[0]; }
                    else if (p.images.trim() !== "") { img = p.images; }
                }
                img = img.trim();

                // Fiyat Tasarımı
                let priceHTML = `<div class="fw-bold text-dark">${p.price}</div>`;
                if(p.old_price && p.old_price !== "0.00 TL") {
                    priceHTML = `
                        <div class="price-row">
                            <span class="current-price-red">${p.price}</span>
                            <span class="discount-box-red">${p.discount || '%'}</span>
                        </div>
                        <div class="old-price-gray mt-1">${p.old_price}</div>
                    `;
                }

                return `
                <div class="slider-product-card" onclick="window.location.href='product-detail.html?id=${p.id}'">
                    <div class="bg-light mb-2 overflow-hidden position-relative" style="aspect-ratio: 3/4;">
                        <img src="${img}" class="w-100 h-100 object-fit-cover" style="transition: transform 0.3s;">
                    </div>
                    <div class="px-1">
                        <div class="text-dark small fw-bold text-truncate mb-1">${p.name}</div>
                        ${priceHTML}
                    </div>
                </div>
                `;
            }).join('');

            // 5. BUTON OLAYLARI (Sağa Sola Kaydırma)
            const btnRight = document.getElementById('slideRight');
            const btnLeft = document.getElementById('slideLeft');

            if(btnRight) {
                btnRight.onclick = () => scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
            }
            if(btnLeft) {
                btnLeft.onclick = () => scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
            }
        }
    })
    .catch(err => console.error(err));
