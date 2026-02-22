// --- GLOBAL DEĞİŞKENLER ---
   let currentAddresses = [];

   // --- SAYFA YÜKLENİNCE ---
   document.addEventListener("DOMContentLoaded", function() {
       checkUserAuth();
       loadProfileData();
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

       if(sectionId === 'section-address') loadAddresses();
   }

   function openSubSection(id) {
       document.querySelectorAll('.account-section').forEach(el => el.style.display = 'none');
       document.getElementById(id).style.display = 'block';
   }


   // ==========================================
   // 1. KİŞİSEL BİLGİLER (PROFİL) YÖNETİMİ
   // ==========================================
   // --- PROFİL GÜNCELLEME (DEBUG VERSİYONU) ---
   // --- KAYDET (GÜNCELLENMİŞ) ---
    function saveProfile(e) {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        const newName = document.getElementById('pName').value;
                const newSurname = document.getElementById('pSurname').value;
                const fullName = newName + " " + newSurname;
        // Cinsiyet
        let gender = "";
        if(document.getElementById('genderF')?.checked) gender = "Kadin";
        else if(document.getElementById('genderM')?.checked) gender = "Erkek";


        const data = {
            email: user.email,
            name: document.getElementById('pName').value,
            surname: document.getElementById('pSurname').value,
            phone: document.getElementById('pPhone').value,
            tc_no: document.getElementById('pTc')?.value,

            // Adres Detayları
            address: document.getElementById('pAddress')?.value,
            apartment: document.getElementById('pApartment')?.value,
            zip_code: document.getElementById('pZip')?.value,
            city: document.getElementById('pCity')?.value,
            district: document.getElementById('pDistrict')?.value,

            gender: gender
        };

        fetch('update_profile.php', {
            method: 'POST',
            body: JSON.stringify(data)
        }).then(r => r.json()).then(res => {
            if(res.success) showToast("Bilgileriniz güncellendi");
            // !!! İSMİ GÜNCELLEME KODU (BURASI ÖNEMLİ) !!!

                // 1. localStorage'ı güncelle
                user.name = fullName;
                localStorage.setItem('user', JSON.stringify(user));

                // 2. Ekrandaki ismi güncelle
                const nameText = document.getElementById('userNameText');
                if(nameText) nameText.innerText = fullName;
            else alert("Hata: " + res.message);
        });
    }


   // ==========================================
   // 2. ADRES YÖNETİMİ (LİSTELE, EKLE, SİL)
   // ==========================================

   // Listele
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
                       <div class="border p-4 mb-3 rounded-1 d-flex justify-content-between align-items-center bg-white" style="border-color: #e0e0e0 !important;">
                           <div>
                               <h6 class="fw-bold mb-2 text-dark" style="font-size: 0.95rem;">${addr.address_line}, ${addr.district}</h6>
                               <p class="text-muted mb-1 small">${addr.zip_code} ${addr.city} / Turkey</p>
                               <p class="text-muted mb-0 small">${addr.name} ${addr.surname} +90 ${addr.phone}</p>
                           </div>
                           <button onclick="editAddress(${addr.id})" class="btn btn-outline-dark rounded-pill px-4 py-2 fw-bold" style="font-size: 0.8rem; border-width: 1px;">Düzenle</button>
                       </div>`;
                   });
               } else {
                   if(emptyState) emptyState.style.display = 'block';
                   if(addLink) addLink.style.display = 'none';
               }
           });
   }

   // Düzenle Formunu Aç
   function editAddress(id) {
       const addr = currentAddresses.find(a => a.id == id);
       if(addr) {
           document.getElementById('addrName').value = addr.name;
           document.getElementById('addrSurname').value = addr.surname;
           document.getElementById('addrPhone').value = addr.phone;
           document.getElementById('addrLine').value = addr.address_line;
           document.getElementById('addrApt').value = addr.apartment;
           document.getElementById('addrZip').value = addr.zip_code;
           document.getElementById('addrCity').value = addr.city;
           document.getElementById('addrDistrict').value = addr.district;

           document.getElementById('editAddressId').value = addr.id;
           document.getElementById('addrFormTitle').innerText = "Adresi düzenle";
           document.getElementById('btnSaveAddress').innerText = "KAYDET";
           document.getElementById('btnDeleteAddress').style.display = 'block';

           document.getElementById('address-list-view').style.display = 'none';
           document.getElementById('address-form-view').style.display = 'block';
       }
   }

   // Yeni Ekleme Formunu Aç
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

   // Kaydet / Güncelle
   function saveAddress(e) {
       e.preventDefault();
       const user = JSON.parse(localStorage.getItem('user'));
       const editId = document.getElementById('editAddressId').value;

       const data = {
           email: user.email,
           id: editId,
           name: document.getElementById('addrName').value,
           surname: document.getElementById('addrSurname').value,
           phone: document.getElementById('addrPhone').value,
           address: document.getElementById('addrLine').value,
           apartment: document.getElementById('addrApt').value,
           zip: document.getElementById('addrZip').value,
           city: document.getElementById('addrCity').value,
           district: document.getElementById('addrDistrict').value
       };

       const apiUrl = editId ? 'update_address.php' : 'add_address.php';

       fetch(apiUrl, { method: 'POST', body: JSON.stringify(data) })
           .then(r => r.json()).then(res => {
               if(res.success) {
                   hideAddressForm();
                   loadAddresses();
                   showToast(editId ? "Adres güncellendi" : "Adres eklendi");
               } else { alert(res.message); }
           });
   }

   // Sil
   function deleteAddress() {
       const id = document.getElementById('editAddressId').value;
       if(confirm("Silmek istediğinize emin misiniz?")) {
           fetch('delete_address.php', { method: 'POST', body: JSON.stringify({ id: id }) })
               .then(r => r.json()).then(res => {
                   if(res.success) {
                       hideAddressForm();
                       loadAddresses();
                       showToast("Adres silindi");
                   }
               });
       }
   }


   // --- HESAP AYARLARI (MAİL/ŞİFRE/SİL) ---

   function handleChangeEmail(e) {
       e.preventDefault();
       const user = JSON.parse(localStorage.getItem('user'));
       const password = document.getElementById('ce-password').value;
       const newEmail = document.getElementById('ce-new-email').value;
       const confirmEmail = document.getElementById('ce-confirm-email').value;

       if(newEmail !== confirmEmail) return alert("E-postalar eşleşmiyor!");

       fetch('change_email.php', { method: 'POST', body: JSON.stringify({ currentEmail: user.email, password, newEmail }) })
           .then(r => r.json()).then(res => {
               if(res.success) { alert("E-posta değiştirildi! Tekrar giriş yapın."); logout(); }
               else { alert(res.message); }
           });
   }

   function handleChangePassword(e) {
       e.preventDefault();
       const user = JSON.parse(localStorage.getItem('user'));
       const currentPassword = document.getElementById('cp-current').value;
       const newPassword = document.getElementById('cp-new').value;
       const confirmPassword = document.getElementById('cp-confirm').value;

       if(newPassword !== confirmPassword) return alert("Parolalar eşleşmiyor!");

       fetch('change_password.php', { method: 'POST', body: JSON.stringify({ email: user.email, currentPassword, newPassword }) })
           .then(r => r.json()).then(res => {
               if(res.success) { alert("Parola değiştirildi!"); openSection('section-info', null); }
               else { alert(res.message); }
           });
   }

   function deleteAccount() {
       if(confirm("Hesabınızı silmek istediğinize emin misiniz?")) {
           const user = JSON.parse(localStorage.getItem('user'));
           fetch('delete_account.php', { method: 'POST', body: JSON.stringify({ email: user.email }) })
               .then(r => r.json()).then(res => {
                   if(res.success) { alert("Hesap silindi."); logout(); }
               });
       }
   }

   // --- YARDIMCILAR ---
   function showToast(msg) {
       const toast = document.getElementById('toast-message');
       if(toast) {
           toast.querySelector('span').innerText = msg;
           toast.classList.add('show');
           setTimeout(() => toast.classList.remove('show'), 3000);
       } else { alert(msg); }
   }

   function logout() {
       localStorage.removeItem('user');
       window.location.href = "index.html";
   }
   // --- PROFİL BİLGİLERİNİ ÇEK VE DOLDUR ---
   // --- VERİYİ ÇEK VE DOLDUR ---
      function loadProfileData() {
          const user = JSON.parse(localStorage.getItem('user'));
          if(!user) return;

          fetch(`get_profile.php?email=${user.email}`)
              .then(res => res.json())
              .then(res => {
                  if(res.success && res.data) {
                      const d = res.data;

                      // Temel Bilgiler
                      setValue('pName', d.name);
                      setValue('pSurname', d.surname);
                      setValue('pPhone', d.phone);
                      setValue('pTc', d.tc_no);

                      // Adres Detayları
                      setValue('pAddress', d.address);
                      setValue('pApartment', d.apartment); // HTML'de id="pApartment" olmalı
                      setValue('pZip', d.zip_code);        // HTML'de id="pZip" olmalı
                      setValue('pCity', d.city);
                      setValue('pDistrict', d.district);


                      // Cinsiyet
                      if (d.gender === "Kadin") document.getElementById('genderF').checked = true;
                      if (d.gender === "Erkek") document.getElementById('genderM').checked = true;


                  }
              });
      }

      // Yardımcı: Değer atama (Null kontrolü ile)
      function setValue(id, val) {
          const el = document.getElementById(id);
          if(el) el.value = val || "";
      }
