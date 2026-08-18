// --- GLOBAL DEĞİŞKENLER ---
let currentAddresses = [];
let allOrders = []; // Tüm siparişleri hafızada tutmak için ekledik

// --- SAYFA YÜKLENİNCE ---
document.addEventListener("DOMContentLoaded", function() {
    checkUserAuth();
    loadProfileData();

    // Sadece 5 ile başlayan katı telefon kuralı fonksiyonu
    function strictPhoneMask(e) {
        let val = this.value.replace(/\D/g, ''); // Harf ve şekilleri sil
        if (val.startsWith('905')) val = val.substring(2);
        else if (val.startsWith('05')) val = val.substring(1);
        if (val.length > 0 && val[0] !== '5') val = ''; // 5 ile başlamıyorsa sil
        this.value = val.substring(0, 10); // Sadece 10 rakam
    }

    // Profildeki "Kişisel Bilgiler" telefon kutusu
    const profilePhone = document.getElementById('pPhone');
    if(profilePhone) profilePhone.addEventListener('input', strictPhoneMask);

    // Profildeki "Kayıtlı Adresler" telefon kutusu
    const addrPhone = document.getElementById('addrPhone');
    if(addrPhone) addrPhone.addEventListener('input', strictPhoneMask);

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
        loadMyOrders(user.email);
    }
});

// --- KULLANICI KONTROLÜ ---
function checkUserAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        if(document.getElementById('userNameText')) document.getElementById('userNameText').innerText = user.name;
        if(document.getElementById('userEmailText')) document.getElementById('userEmailText').innerText = user.email;
        if(document.getElementById('pEmailDisplay')) document.getElementById('pEmailDisplay').innerText = user.email;
    } else {
        window.location.href = "index.html";
    }
}

// --- MENÜ GEÇİŞLERİ ---
function openSection(sectionId, element) {
    document.querySelectorAll('.account-section').forEach(el => el.style.display = 'none');
    const targetSection = document.getElementById(sectionId);
    if(targetSection) targetSection.style.display = 'block';

    if(element) {
        document.querySelectorAll('.account-nav-link').forEach(el => {
            el.classList.remove('active');
            el.style.color = '#777';
        });
        element.classList.add('active');
        element.style.color = '#000';
    }

    const user = JSON.parse(localStorage.getItem('user'));
    // Siparişlerim VEYA İadelerim sekmesine tıklandığında veriyi çek
    if((sectionId === 'section-orders' || sectionId === 'section-returns') && user) {
        loadMyOrders(user.email);
    }
    if(sectionId === 'section-address') loadAddresses();
    // YENİ: Mesajlarım sekmesine tıklandığında
    if(sectionId === 'section-messages' && user) {
        loadMyMessages(user.email);
    }
}

function openSubSection(id) {
    document.querySelectorAll('.account-section').forEach(el => el.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

// ==========================================
// 1. KİŞİSEL BİLGİLER (PROFİL) YÖNETİMİ
// ==========================================
function saveProfile(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    const newName = document.getElementById('pName').value;
    const newSurname = document.getElementById('pSurname').value;
    const fullName = newName + " " + newSurname;

    let gender = "";
    if(document.getElementById('genderF')?.checked) gender = "Kadin";
    else if(document.getElementById('genderM')?.checked) gender = "Erkek";

    const data = {
        email: user.email, name: newName, surname: newSurname,
        phone: document.getElementById('pPhone').value,
        tc_no: document.getElementById('pTc')?.value,
        address: document.getElementById('pAddress')?.value,
        apartment: document.getElementById('pApartment')?.value,
        zip_code: document.getElementById('pZip')?.value,
        city: document.getElementById('pCity')?.value,
        district: document.getElementById('pDistrict')?.value,
        gender: gender
    };

    fetch('update_profile.php', {
        method: 'POST', body: JSON.stringify(data)
    }).then(r => r.json()).then(res => {
        if(res.success) {
            showToast("Bilgileriniz güncellendi");
            user.name = fullName;
            localStorage.setItem('user', JSON.stringify(user));
            if(document.getElementById('userNameText')) document.getElementById('userNameText').innerText = fullName;
            loadProfileData();
        } else alert("Hata: " + res.message);
    });
}

function loadProfileData() {
    const user = JSON.parse(localStorage.getItem('user'));
    if(!user) return;

    fetch(`get_profile.php?email=${user.email}`)
        .then(res => res.json())
        .then(res => {
            if(res.success && res.data) {
                const d = res.data;
                setValue('pName', d.name); setValue('pSurname', d.surname); setValue('pPhone', d.phone);
                if (d.gender === "Kadin") { let el = document.getElementById('genderF'); if(el) el.checked = true; }
                if (d.gender === "Erkek") { let el = document.getElementById('genderM'); if(el) el.checked = true; }
                if(document.getElementById('pPhoneDisplay')) document.getElementById('pPhoneDisplay').innerText = d.phone || 'Belirtilmedi';
            }
        });
}

// ==========================================
// 2. ADRES YÖNETİMİ
// ==========================================
function loadAddresses() {
    const user = JSON.parse(localStorage.getItem('user'));
    if(!user) return;

    fetch(`get_addresses.php?email=${user.email}`)
        .then(res => res.json())
        .then(data => {
            currentAddresses = data;
            const container = document.getElementById('address-container');
            const emptyState = document.getElementById('address-empty-state');
            const addLink = document.getElementById('address-add-link');

            if(container) container.innerHTML = "";
            if (Array.isArray(data) && data.length > 0) {
                if(emptyState) emptyState.style.display = 'none';
                if(addLink) addLink.style.display = 'block';

                data.forEach(addr => {
                    container.innerHTML += `
                    <div class="border p-4 mb-3 rounded-1 d-flex justify-content-between align-items-center bg-white">
                        <div>
                            <h6 class="fw-bold mb-2 text-dark">${addr.address_line}, ${addr.district}</h6>
                            <p class="text-muted mb-1 small">${addr.zip_code} ${addr.city}</p>
                            <p class="text-muted mb-0 small">${addr.name} ${addr.surname} +90 ${addr.phone}</p>
                        </div>
                        <button onclick="editAddress(${addr.id})" class="btn btn-outline-dark rounded-pill px-4 py-2 fw-bold" style="font-size: 0.8rem;">Düzenle</button>
                    </div>`;
                });
            } else {
                if(emptyState) emptyState.style.display = 'block';
                if(addLink) addLink.style.display = 'none';
            }
        });
}

function editAddress(id) {
    const addr = currentAddresses.find(a => a.id == id);
    if(addr) {
        document.getElementById('addrName').value = addr.name; document.getElementById('addrSurname').value = addr.surname;
        document.getElementById('addrPhone').value = addr.phone; document.getElementById('addrLine').value = addr.address_line;
        document.getElementById('addrApt').value = addr.apartment; document.getElementById('addrZip').value = addr.zip_code;
        document.getElementById('addrCity').value = addr.city; document.getElementById('addrDistrict').value = addr.district;
        document.getElementById('editAddressId').value = addr.id;
        document.getElementById('addrFormTitle').innerText = "Adresi düzenle";
        document.getElementById('btnSaveAddress').innerText = "KAYDET";
        document.getElementById('btnDeleteAddress').style.display = 'block';
        document.getElementById('address-list-view').style.display = 'none';
        document.getElementById('address-form-view').style.display = 'block';
    }
}

function showAddressForm() {
    document.querySelector('#address-form-view form').reset();
    document.getElementById('editAddressId').value = "";
    document.getElementById('addrFormTitle').innerText = "Adres ekle";
    document.getElementById('btnSaveAddress').innerText = "ADRES EKLE";
    document.getElementById('btnDeleteAddress').style.display = 'none';
    document.getElementById('address-list-view').style.display = 'none';
    document.getElementById('address-form-view').style.display = 'block';
}

function hideAddressForm() {
    document.getElementById('address-form-view').style.display = 'none';
    document.getElementById('address-list-view').style.display = 'block';
}

function saveAddress(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    const editId = document.getElementById('editAddressId').value;
    const data = {
        email: user.email, id: editId,
        name: document.getElementById('addrName').value, surname: document.getElementById('addrSurname').value,
        phone: document.getElementById('addrPhone').value, address: document.getElementById('addrLine').value,
        apartment: document.getElementById('addrApt').value, zip: document.getElementById('addrZip').value,
        city: document.getElementById('addrCity').value, district: document.getElementById('addrDistrict').value
    };

    const apiUrl = editId ? 'update_address.php' : 'add_address.php';
    fetch(apiUrl, { method: 'POST', body: JSON.stringify(data) })
        .then(r => r.json()).then(res => {
            if(res.success) { hideAddressForm(); loadAddresses(); showToast(editId ? "Adres güncellendi" : "Adres eklendi"); }
            else alert(res.message);
        });
}

function deleteAddress() {
    const id = document.getElementById('editAddressId').value;
    if(confirm("Silmek istediğinize emin misiniz?")) {
        fetch('delete_address.php', { method: 'POST', body: JSON.stringify({ id: id }) })
            .then(r => r.json()).then(res => {
                if(res.success) { hideAddressForm(); loadAddresses(); showToast("Adres silindi"); }
            });
    }
}

// ==========================================
// 3. SİPARİŞ YÖNETİMİ & DETAY GÖRÜNÜMÜ (YENİ)
// ==========================================

// YENİ EKLENEN TAMİRCİ FONKSİYON: Veritabanı metinlerini düzgün diziye (array) çevirir.
function parseOrderItems(itemsString) {
    if (!itemsString || itemsString === 'null') return [];

    try {
        let parsed = itemsString;
        if (typeof parsed === 'string') {
            parsed = parsed.replace(/\\"/g, '"');
            if (parsed.startsWith('"') && parsed.endsWith('"')) {
                parsed = parsed.substring(1, parsed.length - 1);
            }
            parsed = JSON.parse(parsed);
        }
        if (typeof parsed === 'string') { parsed = JSON.parse(parsed); }

        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === 'object') return Object.values(parsed);
    } catch (error) {
        console.error("Ürünler dönüştürülemedi:", error, itemsString);
    }
    return [];
}

// ==========================================
// DEDEKTİF MODU: SİPARİŞ YÜKLEME FONKSİYONU
// ==========================================
function loadMyOrders(email) {
    const ordersContainer = document.getElementById('myOrdersContainer');
    const returnsContainer = document.getElementById('myReturnsContainer');

    if(ordersContainer) ordersContainer.innerHTML = '<p class="text-muted small">Yükleniyor...</p>';

    fetch(`get_orders.php?email=${email}`)
        .then(res => res.json())
        .then(res => {
            // Eğer veritabanında bu kişiye ait HİÇBİR sipariş yoksa:
            if (!res.success || !res.orders || res.orders.length === 0) {
                if(ordersContainer) renderOrderUI([], ordersContainer, false);
                if(returnsContainer) renderOrderUI([], returnsContainer, true);
                return;
            }

            allOrders = res.orders;

            const activeOrders = allOrders.filter(o =>
                o.status !== 'İptal Edildi' &&
                o.status !== 'İade Edildi' &&
                o.status !== 'İptal Bekliyor' &&
                o.status !== 'İade Bekliyor'
            );

            const returnedOrders = allOrders.filter(o =>
                o.status === 'İptal Edildi' ||
                o.status === 'İade Edildi' ||
                o.status === 'İptal Bekliyor' ||
                o.status === 'İade Bekliyor'
            );

            if(ordersContainer) renderOrderUI(activeOrders, ordersContainer, false);
            if(returnsContainer) renderOrderUI(returnedOrders, returnsContainer, true);
        })
        .catch(err => console.error(err));
}

// Sipariş Kartlarını (Tıklanabilir Özet) Çizen Fonksiyon
// YENİ TASARIM: Modern "App-Style" Sipariş Kartları Çizen Fonksiyon
function renderOrderUI(orders, container, isReturn) {

    // --- SİPARİŞ VEYA İADE YOKSA ÇIKACAK ŞIK TASARIM ---
    if(orders.length === 0) {
        if (!isReturn) {
            // SİPARİŞLERİM BOŞSA
            container.innerHTML = `
            <div class="text-center py-5 mt-4">
                <h5 class="fw-bold mb-2">Henüz siparişin yok</h5>
                <p class="text-muted mb-4 mx-auto" style="max-width: 400px; font-size: 0.95rem;">Siparişini bulamıyorsan, farklı bir e-posta adresiyle alışveriş yapmış olabilirsin.</p>
                <a href="index.html" class="btn btn-black px-4 py-3 rounded-0 fw-bold">ALIŞVERİŞE BAŞLA</a>
            </div>`;
        } else {
            // İADELERİM BOŞSA
            container.innerHTML = `
            <div class="text-center py-5 mt-4">
                <h5 class="fw-bold mb-2">İptal veya İade talebin yok</h5>
                <p class="text-muted mx-auto" style="max-width: 350px; font-size: 0.95rem;">İade talebini ilgili siparişinin detay sayfasından gerçekleştirebilirsin.</p>
            </div>`;
        }
        return;
    }
    // ----------------------------------------------------

    // --- SİPARİŞ VARSA KARTLARI ÇİZ ---
    container.innerHTML = orders.map(order => {
        const safeItems = parseOrderItems(order.items);
        let imagesHtml = '';
        let remainingCount = 0;

        if (safeItems.length > 0) {
            const displayItems = safeItems.slice(0, 3);
            remainingCount = safeItems.length - 3;

            imagesHtml = displayItems.map(item => `
                <div style="position: relative;">
                    <img src="${item.image || 'images/default.jpg'}" style="width: 65px; height: 65px; object-fit: cover; border-radius: 12px; border: 1px solid #eaeaea; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                </div>
            `).join('');

            if (remainingCount > 0) {
                imagesHtml += `
                    <div class="d-flex align-items-center justify-content-center text-muted fw-bold" style="width: 65px; height: 65px; border-radius: 12px; background: #f4f4f4; border: 1px solid #eaeaea; font-size: 0.9rem;">
                        +${remainingCount}
                    </div>
                `;
            }
        } else {
            imagesHtml = `<div class="text-muted small">Ürün görseli bulunamadı.</div>`;
        }

        const badgeBg = isReturn ? '#fef2f2' : '#f6f6f6';
        const badgeColor = isReturn ? '#dc2626' : '#111';

        // İptal Bekliyor veya İade Bekliyor ise rozeti SARI yap
        let finalBadgeBg = badgeBg;
        let finalBadgeColor = badgeColor;
        if (order.status === "İptal Bekliyor" || order.status === "İade Bekliyor") {
            finalBadgeBg = '#fff3cd'; // Açık Sarı
            finalBadgeColor = '#856404'; // Koyu Sarı/Kahverengi
        }

        return `
        <div class="order-card-modern mb-4 p-4" style="background: #fff; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f0f0f0; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);"
             onclick="window.location.href='order-detail.html?id=${order.id}'"
             onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(0,0,0,0.06)'; this.style.borderColor='#e2e2e2';"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.03)'; this.style.borderColor='#f0f0f0';">

            <div class="d-flex justify-content-between align-items-center mb-4">
                <div class="d-flex align-items-center gap-3">
                    <div class="d-flex justify-content-center align-items-center rounded-circle" style="width: 48px; height: 48px; background-color: #fafafa; border: 1px solid #eee;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    </div>
                    <div>
                        <div class="fw-bold" style="font-size: 1.05rem; color: #000;">${new Date(order.created_at).toLocaleDateString('tr-TR', {day:'numeric', month:'long', year:'numeric'})}</div>
                        <div class="text-muted" style="font-size: 0.8rem; letter-spacing: 0.5px;">SİPARİŞ NO: ${order.order_code || '-'}</div>
                    </div>
                </div>
                <span class="badge rounded-pill" style="background-color: ${finalBadgeBg}; color: ${finalBadgeColor}; padding: 8px 16px; font-weight: 600; font-size: 0.75rem; border: 1px solid rgba(0,0,0,0.05);">${order.status || 'İşleniyor'}</span>
            </div>

            <div class="d-flex justify-content-between align-items-end mt-2 pt-3" style="border-top: 1px dashed #eee;">
                <div>
                    <div class="text-muted mb-2" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Paket İçeriği</div>
                    <div class="d-flex gap-2">
                        ${imagesHtml}
                    </div>
                </div>
                <div class="text-end">
                    <div class="text-muted mb-1" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Toplam Tutar</div>
                    <div class="fw-bold" style="font-size: 1.3rem; color: #000; line-height: 1;">${order.total_price || ''}</div>
                </div>
            </div>
        </div>
    `}).join('');
}
// Siparişin İçine Tıklanınca Açılan Modal
function showOrderDetails(orderId) {
    const order = allOrders.find(o => o.id == orderId);
    if(!order) return;

    const isCancelled = (order.status === 'İptal Edildi' || order.status === 'İade Edildi');
    const actionButton = isCancelled ? '' : `<button class="btn btn-outline-danger rounded-0 w-100 py-3 mt-4 fw-bold" style="letter-spacing:1px;" onclick="cancelOrder(${order.id})">SİPARİŞİ İPTAL ET</button>`;

    // Artık PHP bize temiz bir dizi (Array) yolladığı için doğrudan kullanıyoruz
    const items = Array.isArray(order.items) ? order.items : [];

    const itemsHtml = items.length > 0 ? items.map(item => `
        <div class="d-flex gap-3 mb-3 pb-3 border-bottom">
            <img src="${item.image}" style="width: 70px; height: 90px; object-fit: cover;">
            <div class="flex-grow-1">
                <h6 class="fw-bold mb-1" style="font-size: 0.9rem;">${item.name}</h6>
                <div class="text-muted small mb-2">Beden: ${item.size}</div>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="small bg-light px-2 py-1">Adet: <b>${item.quantity}</b></div>
                    <div class="fw-bold">${item.price}</div>
                </div>
            </div>
        </div>
    `).join('') : '<p class="text-center text-muted small my-3">Ürün detayı bulunamadı.</p>';

    const modalBody = document.getElementById('orderDetailModalBody');
    if(!modalBody) return;

    modalBody.innerHTML = `
        <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
            <div>
                <div class="text-muted small">Sipariş Kodu</div>
                <div class="fw-bold fs-5">${order.order_code}</div>
            </div>
            <div class="text-end">
                <div class="text-muted small">Sipariş Tarihi</div>
                <div class="fw-bold">${new Date(order.created_at).toLocaleDateString('tr-TR')}</div>
            </div>
        </div>

        <div class="mb-4">
            <div class="alert ${isCancelled ? 'alert-danger' : 'alert-dark'} border-0 rounded-0 text-center fw-bold py-2 mb-0">
                DURUM: ${order.status ? order.status.toUpperCase() : 'BİLİNMİYOR'}
            </div>
        </div>

        <h6 class="fw-bold mb-3 text-uppercase" style="font-size: 0.85rem; letter-spacing: 1px;">Satın Alınan Ürünler</h6>
        ${itemsHtml}

        <div class="d-flex justify-content-between align-items-center mt-4 bg-light p-3 border">
            <span class="fs-6 text-muted">Genel Toplam</span>
            <span class="fs-5 fw-bold text-dark">${order.total_price}</span>
        </div>

        ${actionButton}
    `;

    const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
    modal.show();
}

// İptal Et İşlemini Veritabanına Gönderen Fonksiyon
function cancelOrder(orderId) {
    if(!confirm("Bu siparişi iptal etmek istediğinize emin misiniz? İşlem geri alınamaz.")) return;

    const user = JSON.parse(localStorage.getItem('user'));

    fetch('cancel_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, email: user.email })
    })
    .then(r => r.json())
    .then(res => {
        if(res.success) {
            // Modalı Kapat
            const modalEl = document.getElementById('orderDetailModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if(modalInstance) modalInstance.hide();

            showToast("Sipariş başarıyla iptal edildi.");

            // Sipariş listelerini güncelle (Aktiften silinip İadelere düşecek)
            loadMyOrders(user.email);
        } else {
            alert("Hata: " + res.message);
        }
    });
}

// ==========================================
// 4. HESAP AYARLARI VE YARDIMCILAR
// ==========================================
// --- E-POSTA DEĞİŞTİRME FONKSİYONU ---
function handleChangeEmail(e) {
    e.preventDefault();

    const currentPass = document.getElementById('ce-password').value;
    const newEmail = document.getElementById('ce-new-email').value;
    const confirmEmail = document.getElementById('ce-confirm-email').value;

    // 1. E-postalar uyuşuyor mu?
    if (newEmail !== confirmEmail) {
        return alert("Yeni girdiğiniz e-posta adresleri birbiriyle uyuşmuyor!");
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    // 2. PHP'ye Gönder
    fetch('update_email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            currentEmail: user.email,
            password: currentPass,
            newEmail: newEmail
        })
    })
    .then(res => res.json())
    .then(res => {
        if(res.success) {
            showToast("E-posta adresiniz başarıyla güncellendi.");

            // LocalStorage'ı Güncelle
            user.email = newEmail;
            localStorage.setItem('user', JSON.stringify(user));

            // Ekrandaki Yazıları Güncelle
            if(document.getElementById('userEmailText')) document.getElementById('userEmailText').innerText = newEmail;
            if(document.getElementById('pEmailDisplay')) document.getElementById('pEmailDisplay').innerText = newEmail;

            // Formu Temizle ve Ana Ekrana Dön
            document.getElementById('ce-password').value = '';
            document.getElementById('ce-new-email').value = '';
            document.getElementById('ce-confirm-email').value = '';
            openSection('section-info');
        } else {
            alert("Hata: " + res.message);
        }
    })
    .catch(err => alert("Bağlantı hatası oluştu."));
}
function handleChangePassword(e) {
    e.preventDefault();

    const currentPass = document.getElementById('cp-current').value;
    const newPass = document.getElementById('cp-new').value;
    const confirmPass = document.getElementById('cp-confirm').value;

    // 1. Şifreler uyuşuyor mu kontrolü
    if (newPass !== confirmPass) {
        return alert("Yeni şifreler birbiriyle uyuşmuyor!");
    }

    // 2. Şifre Güvenlik Kuralı (En az 8 karakter, 1 büyük, 1 küçük harf)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(newPass)) {
        return alert("Şifreniz en az 8 karakter uzunluğunda olmalı; en az 1 büyük harf ve 1 küçük harf içermelidir.");
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    fetch('update_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: user.email,
            currentPass: currentPass,
            newPass: newPass
        })
    })
    .then(res => res.json())
    .then(res => {
        if(res.success) {
            showToast("Şifreniz başarıyla güncellendi.");
            // Formu temizle ve Kişisel Bilgiler sekmesine geri dön
            document.getElementById('cp-current').value = '';
            document.getElementById('cp-new').value = '';
            document.getElementById('cp-confirm').value = '';
            openSection('section-info');
        } else {
            alert("Hata: " + res.message);
        }
    })
    .catch(err => alert("Bağlantı hatası oluştu."));
}
// --- HESAP SİLME FONKSİYONU ---
function deleteAccount() {
    if (!confirm("Hesabınızı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm geçmiş verileriniz kaybolur!")) {
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    fetch('delete_account.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
    })
    .then(res => res.json())
    .then(res => {
        if(res.success) {
            alert("Hesabınız başarıyla silindi. Sizi özleyeceğiz...");
            // Oturumu kapatıp ana sayfaya yönlendir
            localStorage.removeItem('user');
            window.location.href = "index.html";
        } else {
            alert("Hata: " + res.message);
        }
    })
    .catch(err => alert("Bağlantı hatası oluştu."));
}
function showToast(msg) {
    const toast = document.getElementById('toast-message');
    if(toast) { toast.querySelector('span').innerText = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); }
    else alert(msg);
}
function setValue(id, val) { const el = document.getElementById(id); if(el) el.value = val || ""; }
function logout() { localStorage.removeItem('user'); window.location.href = "index.html"; }

// ==========================================
// 5. MÜŞTERİ MESAJLARI (DESTEK TALEPLERİ)
// ==========================================
function loadMyMessages(email) {
    const container = document.getElementById('myMessagesContainer');
    if(!container) return;

    fetch(`get_my_messages.php?email=${email}`)
        .then(res => res.json())
        .then(res => {
            if(!res.success || res.messages.length === 0) {
                container.innerHTML = `
                <div class="text-center py-5 mt-4 border rounded bg-light">
                    <h6 class="fw-bold mb-2">Henüz bir destek talebiniz yok</h6>
                    <p class="text-muted small mb-3">Müşteri hizmetlerimizle iletişime geçmek isterseniz iletişim sayfasını kullanabilirsiniz.</p>
                    <a href="contact.html" class="btn btn-outline-dark btn-sm rounded-0 fw-bold px-4">BİZE YAZIN</a>
                </div>`;
                return;
            }

            container.innerHTML = res.messages.map(m => {
                const statusBadge = m.status === 'Cevaplandı'
                    ? `<span class="badge bg-success rounded-0 px-2 py-1 small">YANITLANDI</span>`
                    : `<span class="badge bg-secondary rounded-0 px-2 py-1 small">BEKLİYOR</span>`;

                const replyHtml = m.admin_reply ? `
                    <div class="mt-3 pt-3 border-top border-dark border-opacity-10">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <div class="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center" style="width:24px; height:24px; font-size:10px;">A</div>
                            <span class="fw-bold" style="font-size:0.85rem;">ALOTHING Destek Ekibi</span>
                            <span class="text-muted ms-auto" style="font-size:0.75rem;">${new Date(m.reply_date).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <p class="mb-0 text-dark" style="font-size:0.95rem; line-height:1.6;">${m.admin_reply}</p>
                    </div>
                ` : '';

                return `
                <div class="border p-4 mb-4 rounded-3 shadow-sm bg-white" style="transition:0.3s;">
                    <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                        <div class="text-muted" style="font-size: 0.8rem; letter-spacing:0.5px;">TALEP TARİHİ: <span class="fw-bold text-dark">${new Date(m.created_at).toLocaleDateString('tr-TR')}</span></div>
                        ${statusBadge}
                    </div>

                    <div class="mb-2">
                        <span class="fw-bold" style="font-size:0.85rem;">Siz:</span>
                        <p class="text-muted mt-1 mb-0" style="font-size: 0.95rem;">${m.message}</p>
                    </div>

                    ${replyHtml}
                </div>`;
            }).join('');
        });
}

// --- URL'DEN GELEN SEKMEYİ OTOMATİK AÇMA ---
document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');

    if (tab) {
        // Tab değerine göre section ID'lerini eşleştiriyoruz
        const sectionMap = {
            'profile': 'section-info',    // 'Kişisel Bilgiler'in ID'si
            'orders': 'section-orders',      // 'Siparişlerim'in ID'si
            'returns': 'section-returns'     // 'İadelerim'in ID'si
        };

        const targetSectionId = sectionMap[tab];

        if (targetSectionId) {
            // Küçük bir gecikme ile çalıştır ki sayfa tamamen yüklensin
            setTimeout(() => {
                // 1. Tüm section'ları gizle
                document.querySelectorAll('.account-section').forEach(s => s.style.display = 'none');

                // 2. İlgili section'ı göster
                const target = document.getElementById(targetSectionId);
                if(target) target.style.display = 'block';

                // 3. Menüdeki aktif sınıfını güncelle (Opsiyonel ama şık durur)
                document.querySelectorAll('.account-nav-link').forEach(link => {
                    link.classList.remove('active');
                    // Eğer link'in içinde section-profile gibi bir text varsa onu aktif et
                });
            }, 300);
        }
    }
});
