// js/cart.js

// Sepeti LocalStorage'dan al
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Sepeti kaydet ve her yerdeki sayıları güncelle
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

// Fiyat formatlama (Örn: "1.299,00 TL" -> 1299)
function parseCartPrice(priceStr) {
    if(!priceStr) return 0;
    let cleanPrice = priceStr.replace('TL', '').replace(/\./g, '').replace(',', '.').trim();
    return parseFloat(cleanPrice);
}

// Sayı formatlama (Örn: 1299 -> "1.299,00 TL")
function formatCartPrice(priceNum) {
    return priceNum.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL';
}

// Sepet Arayüzünü Güncelle (Badge, Liste, Toplam)
let cartProductsCache = null; // Veritabanı önbelleği

async function updateCartUI() {
    // Veritabanındaki güncel fiyatları 1 kere çek ve önbelleğe al
    if (!cartProductsCache) {
        try {
            let res = await fetch('api.php');
            cartProductsCache = await res.json();
        } catch(e) { cartProductsCache = []; }
    }

    const cart = getCart();
    let totalQuantity = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        totalQuantity += item.quantity;
        totalPrice += (parseCartPrice(item.price) * item.quantity);
    });

    document.querySelectorAll('.cart-badge-count').forEach(badge => { badge.innerText = totalQuantity; });
    const titleCount = document.getElementById('cart-item-count-title');
    if(titleCount) titleCount.innerText = totalQuantity;

    const totalPriceEl = document.getElementById('cart-total-price');
    if(totalPriceEl) totalPriceEl.innerText = formatCartPrice(totalPrice);

    const container = document.getElementById('cart-items-container');
    if(container) {
        if (cart.length === 0) {
            container.innerHTML = '<div class="text-center text-muted mt-5 py-5">Sepetiniz şu an boş.</div>';
        } else {
          container.innerHTML = cart.map((item, index) => {
          const unitPrice = parseCartPrice(item.price);
          const lineTotal = unitPrice * item.quantity;

          // İNDİRİM KONTROLÜ VE YENİ FİYAT GÖRÜNÜMÜ
          let dbProduct = cartProductsCache.find(p => p.id == item.id);
          let priceDisplay = `<div class="fw-bold text-dark" style="font-size: 0.9rem;">${formatCartPrice(lineTotal)}</div>`;

          if (dbProduct) {
              const oldP = dbProduct.old_price || dbProduct.oldPrice;
              if (oldP && oldP !== "0.00 TL" && parseFloat(oldP) > 0) {
                  let oldLineTotal = parseCartPrice(oldP) * item.quantity;
                  priceDisplay = `
                      <div class="d-flex align-items-center gap-2">
                          <span class="text-decoration-line-through text-muted" style="font-size: 0.75rem;">${formatCartPrice(oldLineTotal)}</span>
                          <span class="fw-bold text-danger" style="font-size: 0.9rem;">${formatCartPrice(lineTotal)}</span>
                      </div>`;
              }
          }

          return `
              <div class="d-flex gap-3 mb-4 pb-3 border-bottom position-relative">
                  <img src="${item.image}" alt="${item.name}" style="width: 70px; height: 90px; object-fit: cover;">
                  <div class="flex-grow-1">
                      <h6 class="fw-bold mb-1" style="font-size: 0.85rem;">${item.name}</h6>
                      <div class="text-muted" style="font-size: 0.75rem;">Beden: ${item.size}</div>
                      <div class="d-flex justify-content-between align-items-center mt-2">

                          ${priceDisplay}

                          <div class="d-flex align-items-center gap-2 border px-2">
                              <button class="btn btn-sm p-0 border-0" onclick="changeCartQuantity(${index}, -1)">-</button>
                              <span style="font-size: 0.8rem; min-width: 15px; text-align:center;">${item.quantity}</span>
                              <button class="btn btn-sm p-0 border-0" onclick="changeCartQuantity(${index}, 1)">+</button>
                          </div>
                      </div>
                  </div>
                  <button class="btn-close" style="font-size: 0.6rem;" onclick="removeFromCart(${index})"></button>
              </div>
          `;
          }).join('');
        }
    }

    const checkoutBtn = document.getElementById('go-to-checkout-btn');
    if (checkoutBtn) {
        if (cart.length === 0) {
            checkoutBtn.disabled = true; checkoutBtn.style.opacity = '0.5'; checkoutBtn.style.cursor = 'not-allowed';
        } else {
            checkoutBtn.disabled = false; checkoutBtn.style.opacity = '1'; checkoutBtn.style.cursor = 'pointer';
        }
    }
}

// Miktar değiştirme
window.changeCartQuantity = function(index, delta) {
    let cart = getCart();
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    saveCart(cart);
};

// Ürün silme
window.removeFromCart = function(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
};

// ==========================================
// YENİ PROFESYONEL POP-UP (MODAL) SİSTEMİ
// ==========================================
function showPremiumPopup(title, message, btnText, callback) {
    // Eskisi varsa sil
    const existing = document.getElementById('alothing-premium-popup');
    if (existing) existing.remove();

    // Arka planı bulanıklaştıran karanlık overlay
    const overlay = document.createElement('div');
    overlay.id = 'alothing-premium-popup';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999999; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(5px); opacity:0; transition:opacity 0.3s ease;';

    // Şık, minimal beyaz kutu
    const box = document.createElement('div');
    box.style.cssText = 'background:#fff; padding:40px 30px; text-align:center; max-width:400px; width:90%; box-shadow:0 25px 50px rgba(0,0,0,0.2); transform:translateY(20px); transition:transform 0.3s ease; border-radius:4px;';

    // İçerik
    box.innerHTML = `
        <div style="margin-bottom:20px;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        </div>
        <h3 style="font-family:'Inter',sans-serif; font-weight:700; font-size:1.1rem; letter-spacing:1px; margin-bottom:15px; color:#000; text-transform:uppercase;">${title}</h3>
        <p style="font-family:'Inter',sans-serif; color:#555; font-size:0.9rem; line-height:1.6; margin-bottom:30px;">${message}</p>
        <button id="premium-popup-btn" style="background:#000; color:#fff; border:none; padding:16px; font-family:'Inter',sans-serif; font-weight:700; font-size:0.85rem; letter-spacing:1.5px; width:100%; cursor:pointer; transition:background 0.2s;">${btnText}</button>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Animasyonla sahneye al
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        box.style.transform = 'translateY(0)';
    });

    // Butona tıklandığında pop-up'ı kapat ve işlemi yap
    document.getElementById('premium-popup-btn').addEventListener('click', () => {
        overlay.style.opacity = '0';
        box.style.transform = 'translateY(20px)';
        setTimeout(() => {
            overlay.remove();
            if (callback) callback();
        }, 300);
    });
}

// ==========================================
// AKILLI "ÖDEMEYE GEÇ" FONKSİYONU
// ==========================================
window.goToCheckout = function() {
    const cart = getCart();

    // 1. SEPET BOŞSA HİÇBİR YERE GÖNDERME
    if(cart.length === 0) {
        showPremiumPopup(
            "SEPETİNİZ BOŞ",
            "Ödemeye geçmek için lütfen sepetinize en az bir ürün ekleyin.",
            "ALIŞVERİŞE DEVAM ET"
        );
        return;
    }

    // 2. KULLANICI GİRİŞ YAPMAMIŞSA (Zurnanın zırt dediği yer)
    const user = localStorage.getItem('user');
    if(!user) {
        showPremiumPopup(
            "GİRİŞ GEREKLİ",
            "Siparişinizi tamamlamak için lütfen hesabınıza giriş yapın veya yeni bir hesap oluşturun.",
            "GİRİŞ YAP / KAYIT OL",
            () => {
                // Sepet ekranı kapatılabilirse kapat (Eğer offcanvas sepetse)
                const cartOffcanvas = document.getElementById('cartOffcanvas');
                if (cartOffcanvas) {
                    const bsCart = bootstrap.Offcanvas.getInstance(cartOffcanvas);
                    if (bsCart) bsCart.hide();
                }

                // Sağdan Giriş Yap panelini doğrudan aç
                if (typeof openLoginOffcanvas === 'function' && document.getElementById('loginOffcanvas')) {
                    openLoginOffcanvas('login');
                } else {
                    // Eğer bulunulan sayfada loginOffcanvas yapısı yoksa index'e gönder
                    window.location.href = 'index.html?openAuth=login';
                }
            }
        );
        return;
    }

    // 3. HER ŞEY TAMAMSA ÖDEMEYE (CHECKOUT) GÖNDER
    window.location.href = 'checkout.html';
};

// Sayfa ilk yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', updateCartUI);
