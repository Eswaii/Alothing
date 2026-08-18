// TOAST BİLDİRİM SİSTEMİ
function injectToastSystem() { if (document.getElementById('alothing-toast-style')) return; const style = document.createElement('style'); style.id = 'alothing-toast-style'; style.innerHTML = `#alothing-toast-container { position: fixed; top: 30px; left: 50%; transform: translateX(-50%); z-index: 999999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; } .alothing-toast { min-width: 320px; background-color: #000; color: #fff; padding: 16px 24px; border-radius: 4px; font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 500; box-shadow: 0 15px 35px rgba(0,0,0,0.2); display: flex; align-items: center; opacity: 0; transform: translateY(-20px); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); letter-spacing: 0.5px; } .alothing-toast.show { opacity: 1; transform: translateY(0); } .alothing-toast.error { background-color: #dc2626; } .alothing-toast svg { margin-right: 12px; flex-shrink: 0; }`; document.head.appendChild(style); if (!document.getElementById('alothing-toast-container')) { const container = document.createElement('div'); container.id = 'alothing-toast-container'; document.body.appendChild(container); } }
function showNotification(msg, type = 'success') { injectToastSystem(); const container = document.getElementById('alothing-toast-container'); const toast = document.createElement('div'); toast.className = `alothing-toast ${type === 'error' ? 'error' : ''}`; const icon = type === 'error' ? `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>` : `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`; toast.innerHTML = `${icon} <span>${msg}</span>`; container.appendChild(toast); setTimeout(() => toast.classList.add('show'), 10); setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3500); }
let currentOrder = null; // Talebi gönderirken kullanmak için

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    const user = JSON.parse(localStorage.getItem('user'));

    // Eğer ID veya kullanıcı yoksa geri gönder
    if (!orderId || !user) {
        window.location.href = "account.html";
        return;
    }

    // Veritabanından siparişi çek
    fetch(`get_order_detail.php?id=${orderId}&email=${user.email}`)
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                renderOrderDetail(res.order);
            } else {
                document.getElementById('orderContent').innerHTML = `<div class="alert alert-danger text-center">${res.message}</div>`;
            }
        })
        .catch(err => {
            console.error("Veri çekme hatası:", err);
            document.getElementById('orderContent').innerHTML = `<div class="alert alert-danger text-center">Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.</div>`;
        });
});

function renderOrderDetail(order) {
    currentOrder = order;
    const container = document.getElementById('orderContent');

    // Ürünleri Güvenli Olarak Al (Null ise boş dizi yap)
    const items = Array.isArray(order.items) ? order.items : [];

    // Duruma göre buton metni ve fonksiyonu (İptal veya İade)
    let actionBtn = "";
    if (order.status === "Hazırlanıyor") {
        actionBtn = `<button class="btn btn-outline-danger px-5 py-3 fw-bold rounded-0" onclick="openRequestModal('İptal')">SİPARİŞİ İPTAL ET</button>`;
    } else if (order.status === "Teslim Edildi") {
        actionBtn = `<button class="btn btn-outline-dark px-5 py-3 fw-bold rounded-0" onclick="openRequestModal('İade')">İADE TALEBİ OLUŞTUR</button>`;
    } else if (order.status === "İptal Bekliyor" || order.status === "İade Bekliyor") {
        actionBtn = `<div class="alert alert-warning fw-bold text-center border-0 rounded-0">Talebiniz alınmıştır. İnceleniyor.</div>`;
    }

    // ÜRÜNLERİ HTML'E ÇEVİR
    let itemsHtml = items.length > 0 ? items.map(item => `
        <div class="d-flex gap-4 border-bottom py-4">
            <img src="${item.image || 'images/default.jpg'}" class="item-img shadow-sm" style="width: 100px; height: 130px; object-fit: cover;">
            <div class="flex-grow-1">
                <h5 class="fw-bold mb-1">${item.name || 'Ürün'}</h5>
                <p class="text-muted small mb-3">Beden: ${item.size || '-'} | Adet: ${item.quantity || 1}</p>
                <div class="fw-bold">${item.price || ''}</div>
            </div>
        </div>
    `).join('') : '<p class="text-muted small py-3">Bu siparişte ürün detayı okunamadı.</p>';

    // --- KARGO TAKİP KODU KONTROLÜ VE HTML'İ ---
    let trackingHtml = "";
    if (order.tracking_code && order.tracking_code.trim() !== '') {
        trackingHtml = `
            <div class="alert alert-dark d-flex flex-column flex-md-row justify-content-between align-items-center p-4 border-0 mb-4" style="background-color: #f8f9fa; border-radius: 8px;">
                <div class="mb-3 mb-md-0 text-center text-md-start">
                    <span class="text-muted d-block" style="font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">KARGO TAKİP KODU</span>
                    <strong class="fs-4 text-dark" style="letter-spacing: 2px;">${order.tracking_code}</strong>
                </div>
                <div>
                    <a href="order-tracking.html?code=${order.tracking_code}" class="btn-black d-inline-block text-center" style="padding: 12px 25px; border-radius: 4px; text-decoration:none;">
                        🚚 KARGOMU TAKİP ET
                    </a>
                </div>
            </div>
        `;
    }

    // EKRANI ÇİZ
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center border-bottom pb-4 mb-4">
            <div>
                <h2 class="fw-bold mb-0">SİPARİŞ #${order.order_code}</h2>
                <p class="text-muted mb-0 small">Tarih: ${new Date(order.created_at).toLocaleDateString('tr-TR')}</p>
            </div>
            <span class="badge bg-dark status-badge px-3 py-2" style="font-size: 0.9rem;">${order.status.toUpperCase()}</span>
        </div>

        ${trackingHtml} <div class="row mb-5">
            <div class="col-md-6 border-end">
                <h6 class="fw-bold text-uppercase mb-3 small" style="letter-spacing:1px;">Teslimat Adresi</h6>
                <p class="mb-1 fw-bold">${order.order_name || 'Alıcı Bilgisi Yok'} ${order.order_surname || ''}</p>
                <p class="text-muted small mb-1">${order.order_address_line || 'Adres detayı veritabanında bulunamadı.'}</p>
                <p class="text-muted small">${order.order_district || ''} ${order.order_city ? ' / ' + order.order_city : ''}</p>
            </div>
            <div class="col-md-6 ps-md-4">
                <h6 class="fw-bold text-uppercase mb-3 small" style="letter-spacing:1px;">İletişim Bilgileri</h6>
                <p class="mb-1 small"><b>E-posta:</b> ${order.user_email}</p>
                <p class="small"><b>Telefon:</b> +90 ${order.phone}</p>
            </div>
        </div>

        <div class="mb-4">
            <h6 class="fw-bold text-uppercase mb-3 small" style="letter-spacing:1px;">Ürünler</h6>
            ${itemsHtml}
        </div>

        <div class="bg-light p-4 d-flex justify-content-between align-items-center">
            <div class="text-end w-100">
                <span class="text-muted small">Genel Toplam:</span>
                <h3 class="fw-bold mb-0">${order.total_price}</h3>
            </div>
        </div>

        <div class="mt-5 text-center">
            ${actionBtn}
        </div>
    `;
}

// Modal'ı (Pop-up) açan fonksiyon
function openRequestModal(type) {
    document.getElementById('modalTitle').innerText = type === 'İptal' ? 'SİPARİŞ İPTALİ' : 'İADE TALEBİ';
    document.getElementById('modalDescription').innerText = `Lütfen bu siparişi ${type.toLowerCase()} etme nedeninizi seçiniz.`;
    const myModal = new bootstrap.Modal(document.getElementById('cancelReturnModal'));
    myModal.show();
}

// İptal/İade Talebini PHP'ye gönderen fonksiyon
async function submitCancelReturnRequest() {
    const reason = document.getElementById('requestReason').value;
    if (!reason) return showNotification("Lütfen işleme devam etmek için bir neden seçin.","error");

    // Mevcut duruma göre İptal veya İade Bekliyor yazdır
    let newStatus = currentOrder.status === "Hazırlanıyor" ? "İptal Bekliyor" : "İade Bekliyor";

    try {
        const response = await fetch('update_order_request.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                order_id: currentOrder.id,
                status: newStatus,
                reason: reason
            })
        });

        const res = await response.json();
        if(res.success) {
            showNotification("Talebiniz başarıyla alınmıştır. İşlem detaylarını siparişlerim ekranından takip edebilirsiniz.");
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showNotification("Hata: " + res.message,"error");
        }
    } catch(err) {
        console.error("Sunucuya bağlanılamadı:", err);
        showNotification("Bağlantı hatası oluştu, lütfen tekrar deneyin.","error");
    }
}
