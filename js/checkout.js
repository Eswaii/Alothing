// ==========================================
// TOAST BİLDİRİM SİSTEMİ (DİNAMİK ENTEGRASYON)
// ==========================================
function injectToastSystem() {
    if (document.getElementById('alothing-toast-style')) return;

    const style = document.createElement('style');
    style.id = 'alothing-toast-style';
    style.innerHTML = `
        #alothing-toast-container { position: fixed; top: 30px; left: 50%; transform: translateX(-50%); z-index: 999999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
        .alothing-toast { min-width: 320px; background-color: #000; color: #fff; padding: 16px 24px; border-radius: 4px; font-family: 'Inter', 'Poppins', sans-serif; font-size: 0.9rem; font-weight: 500; box-shadow: 0 15px 35px rgba(0,0,0,0.2); display: flex; align-items: center; opacity: 0; transform: translateY(-20px); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); letter-spacing: 0.5px; }
        .alothing-toast.show { opacity: 1; transform: translateY(0); }
        .alothing-toast.error { background-color: #dc2626; }
        .alothing-toast svg { margin-right: 12px; flex-shrink: 0; }
    `;
    document.head.appendChild(style);

    if (!document.getElementById('alothing-toast-container')) {
        const container = document.createElement('div');
        container.id = 'alothing-toast-container';
        document.body.appendChild(container);
    }
}

function showNotification(message, type = 'success') {
    injectToastSystem();
    const container = document.getElementById('alothing-toast-container');
    const toast = document.createElement('div');
    toast.className = `alothing-toast ${type === 'error' ? 'error' : ''}`;

    const icon = type === 'error'
        ? `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
        : `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}


// ==========================================
// KULLANICI GİRİŞ KONTROLÜ
// ==========================================
let userEmail = "";
const loggedInUser = JSON.parse(localStorage.getItem('user'));

if (loggedInUser && loggedInUser.email) {
    userEmail = loggedInUser.email;
} else if (localStorage.getItem('userEmail')) {
    userEmail = localStorage.getItem('userEmail');
}

// Eğer kullanıcı giriş yapmamışsa
if (!userEmail || userEmail === "") {
    document.body.style.opacity = "0.3";
    document.body.style.pointerEvents = "none"; // Ekranı dondur

    showNotification("Sipariş verebilmek için lütfen önce giriş yapın.", "error");

    setTimeout(() => {
        window.location.href = "index.html?openAuth=login"; // Ana sayfaya git ve paneli aç
    }, 2000);
}


// ==========================================
// DEĞİŞKENLER VE İŞLEMLER
// ==========================================
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
let addressesList = [];
let selectedDeliveryAddress = {};

const cityDistricts = {
    "Adana": ["Aladağ", "Ceyhan", "Çukurova", "Feke", "İmamoğlu", "Karaisalı", "Karataş", "Kozan", "Pozantı", "Saimbeyli", "Sarıçam", "Seyhan", "Tufanbeyli", "Yumurtalık", "Yüreğir"],
    "Adıyaman": ["Besni", "Çelikhan", "Gerger", "Gölbaşı", "Kahta", "Merkez", "Samsat", "Sincik", "Tut"],
    "Afyonkarahisar": ["Başmakçı", "Bayat", "Bolvadin", "Çay", "Çobanlar", "Dazkırı", "Dinar", "Emirdağ", "Evciler", "Hocalar", "İhsaniye", "İscehisar", "Kızılören", "Merkez", "Sandıklı", "Sinanpaşa", "Sultandağı", "Şuhut"],
    "Ağrı": ["Diyadin", "Doğubayazıt", "Eleşkirt", "Hamur", "Merkez", "Patnos", "Taşlıçay", "Tutak"],
    "Aksaray": ["Ağaçören", "Eskil", "Gülağaç", "Güzelyurt", "Merkez", "Ortaköy", "Sarıyahşi", "Sultanhanı"],
    "Amasya": ["Göynücek", "Gümüşhacıköy", "Hamamözü", "Merkez", "Merzifon", "Suluova", "Taşova"],
    "Ankara": ["Akyurt", "Altındağ", "Ayaş", "Bala", "Beypazarı", "Çamlıdere", "Çankaya", "Çubuk", "Elmadağ", "Etimesgut", "Evren", "Gölbaşı", "Güdül", "Haymana", "Kahramankazan", "Kalecik", "Keçiören", "Kızılcahamam", "Mamak", "Nallıhan", "Polatlı", "Pursaklar", "Sincan", "Şereflikoçhisar", "Yenimahalle"],
    "Antalya": ["Akseki", "Aksu", "Alanya", "Demre", "Döşemealtı", "Elmalı", "Finike", "Gazipaşa", "Gündoğmuş", "İbradı", "Kaş", "Kemer", "Kepez", "Konyaaltı", "Korkuteli", "Kumluca", "Manavgat", "Muratpaşa", "Serik"],
    "Ardahan": ["Çıldır", "Damal", "Göle", "Hanak", "Merkez", "Posof"],
    "Artvin": ["Ardanuç", "Arhavi", "Borçka", "Hopa", "Kemalpaşa", "Merkez", "Murgul", "Şavşat", "Yusufeli"],
    "Aydın": ["Bozdoğan", "Buharkent", "Çine", "Didim", "Efeler", "Germencik", "İncirliova", "Karacasu", "Karpuzlu", "Koçarlı", "Köşk", "Kuşadası", "Kuyucak", "Nazilli", "Söke", "Sultanhisar", "Yenipazar"],
    "Balıkesir": ["Altıeylül", "Ayvalık", "Balya", "Bandırma", "Bigadiç", "Burhaniye", "Dursunbey", "Edremit", "Erdek", "Gömeç", "Gönen", "Havran", "İvrindi", "Karesi", "Kepsut", "Manyas", "Marmara", "Savaştepe", "Sındırgı", "Susurluk"],
    "Bartın": ["Amasra", "Kurucaşile", "Merkez", "Ulus"],
    "Batman": ["Beşiri", "Gercüş", "Hasankeyf", "Kozluk", "Merkez", "Sason"],
    "Bayburt": ["Aydıntepe", "Demirözü", "Merkez"],
    "Bilecik": ["Bozüyük", "Gölpazarı", "İnhisar", "Merkez", "Osmaneli", "Pazaryeri", "Söğüt", "Yenipazar"],
    "Bingöl": ["Adaklı", "Genç", "Karlıova", "Kiğı", "Merkez", "Solhan", "Yayladere", "Yedisu"],
    "Bitlis": ["Adilcevaz", "Ahlat", "Güroymak", "Hizan", "Merkez", "Mutki", "Tatvan"],
    "Bolu": ["Dörtdivan", "Gerede", "Göynük", "Kıbrıscık", "Mengen", "Merkez", "Mudurnu", "Seben", "Yeniçağa"],
    "Burdur": ["Ağlasun", "Altınyayla", "Bucak", "Çavdır", "Çeltikçi", "Gölhisar", "Karamanlı", "Kemer", "Merkez", "Tefenni", "Yeşilova"],
    "Bursa": ["Büyükorhan", "Gemlik", "Gürsu", "Harmancık", "İnegöl", "İznik", "Karacabey", "Keles", "Kestel", "Mudanya", "Mustafakemalpaşa", "Nilüfer", "Orhaneli", "Orhangazi", "Osmangazi", "Yenişehir", "Yıldırım"],
    "Çanakkale": ["Ayvacık", "Bayramiç", "Biga", "Bozcaada", "Çan", "Eceabat", "Ezine", "Gelibolu", "Gökçeada", "Lapseki", "Merkez", "Yenice"],
    "Çankırı": ["Atkaracalar", "Bayramören", "Çerkeş", "Eldivan", "Ilgaz", "Kızılırmak", "Korgun", "Kurşunlu", "Merkez", "Orta", "Şabanözü", "Yapraklı"],
    "Çorum": ["Alaca", "Bayat", "Boğazkale", "Dodurga", "İskilip", "Kargı", "Laçin", "Mecitözü", "Merkez", "Oğuzlar", "Ortaköy", "Osmancık", "Sungurlu", "Uğurludağ"],
    "Denizli": ["Acıpayam", "Babadağ", "Baklan", "Bekilli", "Beyağaç", "Bozkurt", "Buldan", "Çal", "Çameli", "Çardak", "Çivril", "Güney", "Honaz", "Kale", "Merkezefendi", "Pamukkale", "Sarayköy", "Serinhisar", "Tavas"],
    "Diyarbakır": ["Bağlar", "Bismil", "Çermik", "Çınar", "Çüngüş", "Dicle", "Eğil", "Ergani", "Hani", "Hazro", "Kayapınar", "Kocaköy", "Kulp", "Lice", "Silvan", "Sur", "Yenişehir"],
    "Düzce": ["Akçakoca", "Cumayeri", "Çilimli", "Gölyaka", "Gümüşova", "Kaynaşlı", "Merkez", "Yığılca"],
    "Edirne": ["Enez", "Havsa", "İpsala", "Keşan", "Lalapaşa", "Meriç", "Merkez", "Süloğlu", "Uzunköprü"],
    "Elazığ": ["Ağın", "Alacakaya", "Arıcak", "Baskil", "Karakoçan", "Keban", "Kovancılar", "Maden", "Merkez", "Palu", "Sivrice"],
    "Erzincan": ["Çayırlı", "İliç", "Kemah", "Kemaliye", "Merkez", "Otlukbeli", "Refahiye", "Tercan", "Üzümlü"],
    "Erzurum": ["Aşkale", "Aziziye", "Çat", "Hınıs", "Horasan", "İspir", "Karaçoban", "Karayazı", "Köprüköy", "Narman", "Oltu", "Olur", "Palandöken", "Pasinler", "Pazaryolu", "Şenkaya", "Tekman", "Tortum", "Uzundere", "Yakutiye"],
    "Eskişehir": ["Alpu", "Beylikova", "Çifteler", "Günyüzü", "Han", "İnönü", "Mahmudiye", "Mihalgazi", "Mihalıççık", "Odunpazarı", "Sarıcakaya", "Seyitgazi", "Sivrihisar", "Tepebaşı"],
    "Gaziantep": ["Araban", "İslahiye", "Karkamış", "Nizip", "Nurdağı", "Oğuzeli", "Şahinbey", "Şehitkamil", "Yavuzeli"],
    "Giresun": ["Alucra", "Bulancak", "Çamoluk", "Çanakçı", "Dereli", "Doğankent", "Espiye", "Eynesil", "Görele", "Güce", "Keşap", "Merkez", "Piraziz", "Şebinkarahisar", "Tirebolu", "Yağlıdere"],
    "Gümüşhane": ["Kelkit", "Köse", "Kürtün", "Merkez", "Şiran", "Torul"],
    "Hakkari": ["Çukurca", "Derecik", "Merkez", "Şemdinli", "Yüksekova"],
    "Hatay": ["Altınözü", "Antakya", "Arsuz", "Belen", "Defne", "Dörtyol", "Erzin", "Hassa", "İskenderun", "Kırıkhan", "Kumlu", "Payas", "Reyhanlı", "Samandağ", "Yayladağı"],
    "Iğdır": ["Aralık", "Karakoyunlu", "Merkez", "Tuzluca"],
    "Isparta": ["Aksu", "Atabey", "Eğirdir", "Gelendost", "Gönen", "Keçiborlu", "Merkez", "Senirkent", "Sütçüler", "Şarkikaraağaç", "Uluborlu", "Yalvaç", "Yenişarbademli"],
    "İstanbul": ["Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü", "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt", "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane", "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer", "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli", "Tuzla", "Ümraniye", "Üsküdar", "Zeytinburnu"],
    "İzmir": ["Aliağa", "Balçova", "Bayındır", "Bayraklı", "Bergama", "Beydağ", "Bornova", "Buca", "Çeşme", "Çiğli", "Dikili", "Foça", "Gaziemir", "Güzelbahçe", "Karabağlar", "Karaburun", "Karşıyaka", "Kemalpaşa", "Kınık", "Kiraz", "Konak", "Menderes", "Menemen", "Narlıdere", "Ödemiş", "Seferihisar", "Selçuk", "Tire", "Torbalı", "Urla"],
    "Kahramanmaraş": ["Afşin", "Andırın", "Çağlayancerit", "Dulkadiroğlu", "Ekinözü", "Elbistan", "Göksun", "Nurhak", "Onikişubat", "Pazarcık", "Türkoğlu"],
    "Karabük": ["Eflani", "Eskipazar", "Merkez", "Ovacık", "Safranbolu", "Yenice"],
    "Karaman": ["Ayrancı", "Başyayla", "Ermenek", "Kazımkarabekir", "Merkez", "Sarıveliler"],
    "Kars": ["Akyaka", "Arpaçay", "Digor", "Kağızman", "Merkez", "Sarıkamış", "Selim", "Susuz"],
    "Kastamonu": ["Abana", "Ağlı", "Araç", "Azdavay", "Bozkurt", "Cide", "Çatalzeytin", "Daday", "Devrekani", "Doğanyurt", "Hanönü", "İhsangazi", "İnebolu", "Küre", "Merkez", "Pınarbaşı", "Seydiler", "Şenpazar", "Taşköprü", "Tosya"],
    "Kayseri": ["Akkışla", "Bünyan", "Develi", "Felahiye", "Hacılar", "İncesu", "Kocasinan", "Melikgazi", "Özvatan", "Pınarbaşı", "Sarıoğlan", "Sarız", "Talas", "Tomarza", "Yahyalı", "Yeşilhisar"],
    "Kırıkkale": ["Bahşılı", "Balışeyh", "Çelebi", "Delice", "Karakeçili", "Keskin", "Merkez", "Sulakyurt", "Yahşihan"],
    "Kırklareli": ["Babaeski", "Demirköy", "Kofçaz", "Lüleburgaz", "Merkez", "Pehlivanköy", "Pınarhisar", "Vize"],
    "Kırşehir": ["Akçakent", "Akpınar", "Boztepe", "Çiçekdağı", "Kaman", "Merkez", "Mucur"],
    "Kilis": ["Elbeyli", "Merkez", "Musabeyli", "Polateli"],
    "Kocaeli": ["Başiskele", "Çayırova", "Darıca", "Derince", "Dilovası", "Gebze", "Gölcük", "İzmit", "Kandıra", "Karamürsel", "Kartepe", "Körfez"],
    "Konya": ["Ahırlı", "Akören", "Akşehir", "Altınekin", "Beyşehir", "Bozkır", "Cihanbeyli", "Çeltik", "Çumra", "Derbent", "Derebucak", "Doğanhisar", "Emirgazi", "Ereğli", "Güneysınır", "Hadim", "Halkapınar", "Hüyük", "Ilgın", "Kadınhanı", "Karapınar", "Karatay", "Kulu", "Meram", "Sarayönü", "Selçuklu", "Seydişehir", "Taşkent", "Tuzlukçu", "Yalıhüyük", "Yunak"],
    "Kütahya": ["Altıntaş", "Aslanapa", "Çavdarhisar", "Domaniç", "Dumlupınar", "Emet", "Gediz", "Hisarcık", "Merkez", "Pazarlar", "Şaphane", "Simav", "Tavşanlı"],
    "Malatya": ["Akçadağ", "Arapgir", "Arguvan", "Battalgazi", "Darende", "Doğanşehir", "Doğanyol", "Hekimhan", "Kale", "Kuluncak", "Pütürge", "Yazıhan", "Yeşilyurt"],
    "Manisa": ["Ahmetli", "Akhisar", "Alaşehir", "Demirci", "Gölmarmara", "Gördes", "Kırkağaç", "Köprübaşı", "Kula", "Salihli", "Sarıgöl", "Saruhanlı", "Selendi", "Soma", "Şehzadeler", "Turgutlu", "Yunusemre"],
    "Mardin": ["Artuklu", "Dargeçit", "Derik", "Kızıltepe", "Mazıdağı", "Midyat", "Nusaybin", "Ömerli", "Savur", "Yeşilli"],
    "Mersin": ["Akdeniz", "Anamur", "Aydıncık", "Bozyazı", "Çamlıyayla", "Erdemli", "Gülnar", "Mezitli", "Mut", "Silifke", "Tarsus", "Toroslar", "Yenişehir"],
    "Muğla": ["Bodrum", "Dalaman", "Datça", "Fethiye", "Kavaklıdere", "Köyceğiz", "Marmaris", "Menteşe", "Milas", "Ortaca", "Seydikemer", "Ula", "Yatağan"],
    "Muş": ["Bulanık", "Hasköy", "Korkut", "Malazgirt", "Merkez", "Varto"],
    "Nevşehir": ["Acıgöl", "Avanos", "Derinkuyu", "Gülşehir", "Hacıbektaş", "Kozaklı", "Merkez", "Ürgüp"],
    "Niğde": ["Altunhisar", "Bor", "Çamardı", "Çiftlik", "Merkez", "Ulukışla"],
    "Ordu": ["Akkuş", "Altınordu", "Aybastı", "Çamaş", "Çatalpınar", "Çaybaşı", "Fatsa", "Gölköy", "Gülyalı", "Gürgentepe", "İkizce", "Kabadüz", "Kabataş", "Korgan", "Kumru", "Mesudiye", "Perşembe", "Ulubey", "Ünye"],
    "Osmaniye": ["Bahçe", "Düziçi", "Hasanbeyli", "Kadirli", "Merkez", "Sumbas", "Toprakkale"],
    "Rize": ["Ardeşen", "Çamlıhemşin", "Çayeli", "Derepazarı", "Fındıklı", "Güneysu", "Hemşin", "İkizdere", "İyidere", "Kalkandere", "Merkez", "Pazar"],
    "Sakarya": ["Adapazarı", "Akyazı", "Arifiye", "Erenler", "Ferizli", "Geyve", "Hendek", "Karapürçek", "Karasu", "Kaynarca", "Kocaali", "Pamukova", "Sapanca", "Serdivan", "Taraklı"],
    "Samsun": ["19 Mayıs", "Alaçam", "Asarcık", "Atakum", "Ayvacık", "Bafra", "Canik", "Çarşamba", "Havza", "İlkadım", "Kavak", "Ladik", "Salıpazarı", "Tekkeköy", "Terme", "Vezirköprü", "Yakakent"],
    "Siirt": ["Baykan", "Eruh", "Kurtalan", "Merkez", "Pervari", "Şirvan", "Tillo"],
    "Sinop": ["Ayancık", "Boyabat", "Dikmen", "Durağan", "Erfelek", "Gerze", "Merkez", "Saraydüzü", "Türkeli"],
    "Sivas": ["Akıncılar", "Altınyayla", "Divriği", "Doğanşar", "Gemerek", "Gölova", "Gürün", "Hafik", "İmranlı", "Kangal", "Koyulhisar", "Merkez", "Suşehri", "Şarkışla", "Ulaş", "Yıldızeli", "Zara"],
    "Şanlıurfa": ["Akçakale", "Birecik", "Bozova", "Ceylanpınar", "Eyyübiye", "Halfeti", "Haliliye", "Harran", "Hilvan", "Karaköprü", "Siverek", "Suruç", "Viranşehir"],
    "Şırnak": ["Beytüşşebap", "Cizre", "Güçlükonak", "İdil", "Merkez", "Silopi", "Uludere"],
    "Tekirdağ": ["Çerkezköy", "Çorlu", "Ergene", "Hayrabolu", "Kapaklı", "Malkara", "Marmaraereğlisi", "Muratlı", "Saray", "Süleymanpaşa", "Şarköy"],
    "Tokat": ["Almus", "Artova", "Başçiftlik", "Erbaa", "Merkez", "Niksar", "Pazar", "Reşadiye", "Sulusaray", "Turhal", "Yeşilyurt", "Zile"],
    "Trabzon": ["Akçaabat", "Araklı", "Arsin", "Beşikdüzü", "Çarşıbaşı", "Çaykara", "Dernekpazarı", "Düzköy", "Hayrat", "Köprübaşı", "Maçka", "Of", "Ortahisar", "Sürmene", "Şalpazarı", "Tonya", "Vakfıkebir", "Yomra"],
    "Tunceli": ["Çemişgezek", "Hozat", "Mazgirt", "Merkez", "Nazımiye", "Ovacık", "Pertek", "Pülümür"],
    "Uşak": ["Banaz", "Eşme", "Karahallı", "Merkez", "Sivaslı", "Ulubey"],
    "Van": ["Bahçesaray", "Başkale", "Çaldıran", "Çatak", "Edremit", "Erciş", "Gevaş", "Gürpınar", "İpekyolu", "Muradiye", "Özalp", "Saray", "Tuşba"],
    "Yalova": ["Altınova", "Armutlu", "Çınarcık", "Çiftlikköy", "Merkez", "Termal"],
    "Yozgat": ["Akdağmadeni", "Aydıncık", "Boğazlıyan", "Çandır", "Çayıralan", "Çekerek", "Kadışehri", "Merkez", "Saraykent", "Sarıkaya", "Sorgun", "Şefaatli", "Yenifakılı", "Yerköy"],
    "Zonguldak": ["Alaplı", "Çaycuma", "Devrek", "Ereğli", "Gökçebey", "Kilimli", "Kozlu", "Merkez"]
};

function populateCities() {
    const citySelect = document.getElementById("addrCity");
    if (!citySelect) return;
    citySelect.innerHTML = '<option value="" disabled selected>Şehir Seçin</option>';
    for (const city in cityDistricts) {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    }
}

function updateDistricts(preSelectedDistrict = "") {
    const citySelect = document.getElementById("addrCity");
    const districtSelect = document.getElementById("addrDistrict");
    const selectedCity = citySelect.value;
    if (!districtSelect) return;

    districtSelect.innerHTML = '<option value="" disabled selected>İlçe Seçin</option>';

    if (selectedCity && cityDistricts[selectedCity]) {
        cityDistricts[selectedCity].forEach(district => {
            const option = document.createElement("option");
            option.value = district;
            option.textContent = district;
            if (district === preSelectedDistrict) option.selected = true;
            districtSelect.appendChild(option);
        });
    }
}

function toggleAddressTitle() {
    const checkbox = document.getElementById('saveAddressCheckbox');
    const titleField = document.getElementById('titleField');
    const titleInput = document.getElementById('addrTitle');

    if (checkbox.checked) {
        titleField.style.display = 'block';
        titleInput.setAttribute('required', 'required');
    } else {
        titleField.style.display = 'none';
        titleInput.removeAttribute('required');
        titleInput.value = '';
    }
}

function parseCartPrice(priceStr) {
    if(!priceStr) return 0;
    if(typeof priceStr === 'number') return priceStr;
    let cleanPrice = priceStr.replace('TL', '').replace(/\./g, '').replace(',', '.').trim();
    return parseFloat(cleanPrice);
}

function formatCartPrice(priceNum) {
    return priceNum.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL';
}

function renderSlider() {
    const slider = document.getElementById('slider');
    slider.innerHTML = '';
    let total = 0;

    if (cartItems.length === 0) {
        slider.innerHTML = '<p style="text-align:center; padding-top:60px; color:#999;">Sepetiniz boş.</p>';
        return;
    }

    cartItems.forEach((item, index) => {
        const itemPrice = parseCartPrice(item.price);
        total += (itemPrice * item.quantity);

        let dbProduct = checkoutProductsCache.find(p => p.id == item.id);
        let priceHtml = `<p style="color:#000; font-weight:600; margin-top:10px; font-size:1.1rem;">${formatCartPrice(itemPrice * item.quantity)}</p>`;

        if (dbProduct) {
            const oldP = dbProduct.old_price || dbProduct.oldPrice;
            if (oldP && oldP !== "0.00 TL" && parseFloat(oldP) > 0) {
                let oldLineTotal = parseCartPrice(oldP) * item.quantity;
                priceHtml = `
                <p style="margin-top:10px; font-size:1.1rem; display:flex; justify-content:center; align-items:center; gap:8px;">
                    <span style="text-decoration: line-through; color: #999; font-size:0.9rem; font-weight: 500;">${formatCartPrice(oldLineTotal)}</span>
                    <span style="color:#dc2626; font-weight:700;">${formatCartPrice(itemPrice * item.quantity)}</span>
                </p>`;
            }
        }

        const slide = document.createElement('div');
        slide.className = `slide ${index === 0 ? 'active' : ''}`;
        slide.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="product-info">
                <h3>${item.name}</h3>
                <p>Beden: ${item.size} | Adet: ${item.quantity}</p>
                ${priceHtml}
            </div>
        `;
        slider.appendChild(slide);
    });

    let shippingCost = 0;
    if (total > 2599) {
        shippingCost = 0;
    } else if (total > 0) {
        shippingCost = 99;
    }

    let grandTotal = total + shippingCost;

    const subTotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const grandTotalEl = document.getElementById('grandtotal');

    if (subTotalEl) subTotalEl.innerText = formatCartPrice(total);

    if (shippingEl) {
        if (total === 0) {
            shippingEl.innerText = "0,00 TL";
            shippingEl.style.color = "#000";
        } else if (shippingCost === 0) {
            shippingEl.innerText = "Ücretsiz";
            shippingEl.style.color = "green";
        } else {
            shippingEl.innerText = formatCartPrice(shippingCost);
            shippingEl.style.color = "#000";
        }
    }

    if (grandTotalEl) grandTotalEl.innerText = formatCartPrice(grandTotal);

    startSlider();
}

function startSlider() {
    if(cartItems.length <= 1) return;
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    setInterval(() => {
        if(slides[currentSlide]) slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        if(slides[currentSlide]) slides[currentSlide].classList.add('active');
    }, 3500);
}

async function loadAddresses() {
    try {
        const response = await fetch(`get_addresses.php?email=${userEmail}`);
        addressesList = await response.json();
        if (addressesList.length > 0) {
            renderAddressList();
        } else {
            showAddressForm();
        }
    } catch (error) {
        console.error("Adres hatası:", error);
        showAddressForm();
    }
}

function renderAddressList() {
    document.getElementById('address-form-view').style.display = 'none';
    document.getElementById('address-list-view').style.display = 'block';
    const container = document.getElementById('addresses-container');
    container.innerHTML = '';

    addressesList.forEach((addr, index) => {
        const isChecked = index === 0 ? 'checked' : '';
        const card = document.createElement('label');
        card.className = 'address-card';
        card.innerHTML = `
            <input type="radio" name="selectedAddress" value="${addr.id}" ${isChecked}>
            <div class="address-card-details">
                <span class="address-card-title">${addr.address_title}</span>
                <span class="address-card-desc">${addr.name} ${addr.surname} - ${addr.phone}<br>${addr.address_line}, ${addr.district || ''} / ${addr.city}</span>
            </div>
            <button type="button" class="back-btn" style="margin:0; padding:10px; text-decoration:none;" onclick="event.preventDefault(); showAddressForm(${addr.id})">
                <i class="fas fa-edit"></i>
            </button>
        `;
        container.appendChild(card);
    });
}

function showAddressForm(addrId = null) {
    document.getElementById('address-list-view').style.display = 'none';
    document.getElementById('address-form-view').style.display = 'block';
    document.getElementById('addressForm').reset();
    document.getElementById('editAddressId').value = '';

    document.getElementById('titleField').style.display = 'none';
    const backBtn = document.getElementById('backToAddressesBtn');
    backBtn.style.display = addressesList.length > 0 ? 'block' : 'none';

    const districtSelect = document.getElementById("addrDistrict");
    if(districtSelect) districtSelect.innerHTML = '<option value="" disabled selected>Önce Şehir Seçin</option>';

    if (addrId) {
        document.getElementById('addrFormTitle').innerText = 'Adresi Düzenle';
        const addr = addressesList.find(a => a.id == addrId);
        if (addr) {
            document.getElementById('saveAddressCheckbox').checked = true;
            toggleAddressTitle();
            document.getElementById('editAddressId').value = addr.id;
            document.getElementById('addrTitle').value = addr.address_title;
            document.getElementById('addrName').value = addr.name;
            document.getElementById('addrSurname').value = addr.surname;
            document.getElementById('addrPhone').value = addr.phone;
            document.getElementById('addrLine').value = addr.address_line;
            document.getElementById('addrZip').value = addr.zip_code;

            document.getElementById('addrCity').value = addr.city;
            updateDistricts(addr.district);
        }
    } else {
        document.getElementById('addrFormTitle').innerText = 'Adres Bilgileri';
    }
}

function hideAddressForm() {
    if (addressesList.length > 0) {
        document.getElementById('address-form-view').style.display = 'none';
        document.getElementById('address-list-view').style.display = 'block';
    }
}

async function saveAddress(e) {
    e.preventDefault();
    const isSaving = document.getElementById('saveAddressCheckbox').checked;

    selectedDeliveryAddress = {
        name: document.getElementById('addrName').value,
        surname: document.getElementById('addrSurname').value,
        phone: document.getElementById('addrPhone').value,
        address_line: document.getElementById('addrLine').value,
        city: document.getElementById('addrCity').value,
        district: document.getElementById('addrDistrict').value
    };

    if (!isSaving) {
        document.getElementById('address-step').classList.add('move-up');
        document.getElementById('payment-step').classList.add('come-from-bottom');
        return;
    }

    const addressData = {
        id: document.getElementById('editAddressId').value,
        email: userEmail,
        title: document.getElementById('addrTitle').value,
        name: selectedDeliveryAddress.name,
        surname: selectedDeliveryAddress.surname,
        phone: selectedDeliveryAddress.phone,
        address: selectedDeliveryAddress.address_line,
        zip: document.getElementById('addrZip').value,
        city: selectedDeliveryAddress.city,
        district: selectedDeliveryAddress.district
    };

    const endpoint = addressData.id ? 'update_address.php' : 'add_address.php';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(addressData),
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        if (result.success) {
            await loadAddresses();
        } else {
            showNotification("Adres kaydedilirken bir hata oluştu.", "error");
        }
    } catch (error) {
        document.getElementById('address-step').classList.add('move-up');
        document.getElementById('payment-step').classList.add('come-from-bottom');
    }
}

function validateAndGoToPayment() {
    const selected = document.querySelector('input[name="selectedAddress"]:checked');
    if (!selected) {
        showNotification("Lütfen bir teslimat adresi seçin.", "error");
        return;
    }

    const addr = addressesList.find(a => a.id == selected.value);
    if(addr) {
        selectedDeliveryAddress = {
            name: addr.name,
            surname: addr.surname,
            phone: addr.phone,
            address_line: addr.address_line,
            city: addr.city,
            district: addr.district
        };
    }

    document.getElementById('address-step').classList.add('move-up');
    document.getElementById('payment-step').classList.add('come-from-bottom');
}

function goBackToAddress() {
    document.getElementById('address-step').classList.remove('move-up');
    document.getElementById('payment-step').classList.remove('come-from-bottom');
}

const addrPhoneEl = document.getElementById('addrPhone');
if(addrPhoneEl) {
    addrPhoneEl.addEventListener('input', function (e) {
        let val = this.value.replace(/\D/g, '');
        if (val.startsWith('905')) val = val.substring(2);
        else if (val.startsWith('05')) val = val.substring(1);
        if (val.length > 0 && val[0] !== '5') val = '';
        this.value = val.substring(0, 10);
    });
}

document.getElementById('cc-number').addEventListener('input', function (e) {
    let val = this.value.replace(/\D/g, '');
    val = val.substring(0, 16);
    let formatted = val.match(/.{1,4}/g);
    this.value = formatted ? formatted.join(' ') : '';
});

document.getElementById('cc-cvc').addEventListener('input', function (e) {
    this.value = this.value.replace(/\D/g, '').substring(0, 3);
});

document.getElementById('cc-expiry').addEventListener('input', function (e) {
    let val = this.value.replace(/\D/g, '');
    if (val.length >= 2) {
        let month = parseInt(val.substring(0, 2));
        if (month > 12) val = '12' + val.substring(2);
        else if (month === 0 && val.length >= 2) val = '01' + val.substring(2);

        if (val.length > 2) {
            val = val.substring(0, 2) + '/' + val.substring(2, 4);
        }
    }
    this.value = val;
});

async function finalizeOrder() {
    if (cartItems.length === 0) {
        showNotification("Sepetiniz boş!", "error");
        return;
    }

    document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
    document.querySelectorAll('#payment-step input').forEach(el => el.style.borderColor = '#e0e0e0');

    let isValid = true;
    let firstInvalidElement = null;

    const showError = (id, msg) => {
        const errEl = document.getElementById(`err-${id}`);
        const inputEl = document.getElementById(id);
        if(errEl) { errEl.innerText = msg; errEl.style.display = 'block'; }
        if(inputEl) {
            inputEl.style.borderColor = 'red';
            if (!firstInvalidElement) firstInvalidElement = inputEl;
        }
        isValid = false;
    };

    const ccName = document.getElementById('cc-name').value.trim();
    const ccNumber = document.getElementById('cc-number').value.replace(/\s/g, '');
    const ccExpiry = document.getElementById('cc-expiry').value.trim();
    const ccCvc = document.getElementById('cc-cvc').value.trim();

    if (!ccName) showError('cc-name', 'Lütfen kart üzerindeki ismi giriniz.');
    if (ccNumber.length !== 16) showError('cc-number', 'Kart numarası eksik veya hatalı.');

    if (ccExpiry.length !== 5) {
        showError('cc-expiry', 'Geçerli bir tarih girin.');
    } else {
        const [month, year] = ccExpiry.split('/');
        if (parseInt(year) < 26) showError('cc-expiry', 'Kartın süresi dolmuş!');
    }

    if (ccCvc.length !== 3) showError('cc-cvc', 'CVC 3 haneli olmalıdır.');

    if (!isValid) {
        if (firstInvalidElement) firstInvalidElement.focus();
        return;
    }

    const submitBtn = document.querySelector('button[onclick="finalizeOrder()"]');
    let originalBtnText = "Siparişi Tamamla";

    if (submitBtn) {
        originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'İşleniyor, lütfen bekleyin...';
        submitBtn.style.opacity = "0.7";
        submitBtn.style.cursor = "not-allowed";
    }

    let subTotal = 0;
    cartItems.forEach(item => {
        subTotal += (parseCartPrice(item.price) * item.quantity);
    });

    let shippingCost = (subTotal > 2599) ? 0 : 99;
    let grandTotal = subTotal + shippingCost;

    const orderData = {
        email: userEmail,
        items: JSON.stringify(cartItems),
        total_price: formatCartPrice(grandTotal),
        order_name: selectedDeliveryAddress.name || '',
        order_surname: selectedDeliveryAddress.surname || '',
        order_phone: selectedDeliveryAddress.phone || '',
        order_address_line: selectedDeliveryAddress.address_line || '',
        order_city: selectedDeliveryAddress.city || '',
        order_district: selectedDeliveryAddress.district || ''
    };

    try {
        const response = await fetch('create_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (result.success) {
            const popup = document.getElementById('successPopup');
            const messageEl = document.getElementById('popupMessage');

            messageEl.innerHTML = `Siparişiniz başarıyla alındı.<br><br><b>Sipariş Kodu:</b> ${result.order_code}<br><br>Fatura ve takip bilgileriniz <b>${result.email}</b> adresine ve <b>${result.phone}</b> numarasına gönderilecektir.`;

            popup.style.display = 'flex';
            localStorage.removeItem('cart');
        } else {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                submitBtn.style.opacity = "1";
                submitBtn.style.cursor = "pointer";
            }
            showNotification("Hata: " + result.message, "error");
        }
    } catch (error) {
        console.error("Hata:", error);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            submitBtn.style.opacity = "1";
            submitBtn.style.cursor = "pointer";
        }
        showNotification("Sipariş işlenirken bir sorun oluştu.", "error");
    }
}

let checkoutProductsCache = [];

window.onload = async () => {
    populateCities();
    try {
        let res = await fetch('api.php');
        checkoutProductsCache = await res.json();
    } catch(e) {}

    renderSlider();
    loadAddresses();
};

let appliedCoupon = null;
const FREE_SHIPPING_THRESHOLD = 2599.00;
const STANDARD_SHIPPING_COST = 99.99;

function getCartSubtotal() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let subtotal = 0;

    cart.forEach(item => {
        let cleanPrice = item.price.toString().replace('TL', '').replace(/\./g, '').replace(',', '.').trim();
        subtotal += parseFloat(cleanPrice) * parseInt(item.quantity);
    });

    return subtotal;
}

function calculateFinalTotal() {
    let subtotal = getCartSubtotal();
    let discountAmount = 0;

    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discountAmount = subtotal * (appliedCoupon.value / 100);
        } else if (appliedCoupon.type === 'fixed') {
            discountAmount = appliedCoupon.value;
        }
        if (discountAmount > subtotal) discountAmount = subtotal;
    }

    let totalAfterDiscount = subtotal - discountAmount;
    let shippingCost = totalAfterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
    if (subtotal === 0) shippingCost = 0;

    let finalTotal = totalAfterDiscount + shippingCost;

    if(document.getElementById('subtotal')) {
        document.getElementById('subtotal').innerText = subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' TL';
    }

    const discountRow = document.getElementById('discountRow');
    if(discountAmount > 0 && discountRow) {
        discountRow.style.display = 'flex';
        document.getElementById('appliedCouponCode').innerText = appliedCoupon.code;
        document.getElementById('cartDiscount').innerText = "-" + discountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' TL';
    } else if (discountRow) {
        discountRow.style.display = 'none';
    }

    if(document.getElementById('shipping')) {
        if(shippingCost === 0 && subtotal > 0) {
            document.getElementById('shipping').innerHTML = '<span class="text-success" style="font-weight:bold;">ÜCRETSİZ</span>';
        } else {
            document.getElementById('shipping').innerText = shippingCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' TL';
        }
    }

    if(document.getElementById('grandtotal')) {
        document.getElementById('grandtotal').innerText = finalTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' TL';
    }

    updateShippingProgress(totalAfterDiscount);
}

function updateShippingProgress(total) {
    const progressBar = document.getElementById('shippingProgressBar');
    const progressText = document.getElementById('shippingProgressText');

    if(!progressBar || !progressText) return;

    if(total >= FREE_SHIPPING_THRESHOLD) {
        progressBar.style.width = '100%';
        progressBar.classList.add('success');
        progressText.innerHTML = '<span class="text-success" style="font-weight:600;">Tebrikler! Kargonuz BEDAVA.</span>';
    } else {
        let remaining = FREE_SHIPPING_THRESHOLD - total;
        let percent = (total / FREE_SHIPPING_THRESHOLD) * 100;

        progressBar.style.width = percent + '%';
        progressBar.classList.remove('success');
        progressText.innerHTML = `Kargo bedava için <strong>${remaining.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</strong> değerinde daha ürün ekleyin.`;
    }
}

async function applyCoupon() {
    const codeInput = document.getElementById('couponInput');
    const msgDiv = document.getElementById('couponMessage');
    const btn = document.getElementById('applyCouponBtn');
    const code = codeInput.value.trim().toUpperCase();

    if(code === "") {
        msgDiv.innerHTML = "<span class='text-danger'>Lütfen bir kod girin.</span>";
        return;
    }

    btn.disabled = true;
    btn.innerText = "BEKLEYİN...";

    try {
        const res = await fetch('check_coupon.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code })
        });
        const result = await res.json();

        if(result.success) {
            const coupon = result.coupon;
            let cartTotalAmount = getCartSubtotal();

            if(coupon.min_amount > 0 && cartTotalAmount < coupon.min_amount) {
                msgDiv.innerHTML = `<span class='text-danger'>Bu kuponu kullanmak için sepetiniz en az ${coupon.min_amount} TL olmalıdır.</span>`;
                btn.disabled = false;
                btn.innerText = "UYGULA";
                return;
            }

            appliedCoupon = coupon;
            msgDiv.innerHTML = "<span class='text-success'>Kupon başarıyla uygulandı!</span>";

            codeInput.disabled = true;
            btn.innerText = "İPTAL ET";
            btn.style.backgroundColor = "#b91c1c";
            btn.style.borderColor = "#b91c1c";
            btn.disabled = false;
            btn.onclick = removeCoupon;

            calculateFinalTotal();
        } else {
            msgDiv.innerHTML = `<span class='text-danger'>${result.message}</span>`;
            appliedCoupon = null;
            btn.disabled = false;
            btn.innerText = "UYGULA";
            calculateFinalTotal();
        }
    } catch (err) {
        msgDiv.innerHTML = "<span class='text-danger'>Bağlantı hatası.</span>";
        btn.disabled = false;
        btn.innerText = "UYGULA";
    }
}

function removeCoupon() {
    appliedCoupon = null;

    const codeInput = document.getElementById('couponInput');
    const msgDiv = document.getElementById('couponMessage');
    const btn = document.getElementById('applyCouponBtn');

    codeInput.value = "";
    codeInput.disabled = false;
    msgDiv.innerHTML = "";

    btn.innerText = "UYGULA";
    btn.style.backgroundColor = "#000";
    btn.style.borderColor = "#000";
    btn.onclick = applyCoupon;

    calculateFinalTotal();
}

function toggleCoupon() {
    const content = document.getElementById('couponCollapse');
    const icon = document.getElementById('couponIcon');
    if (content.classList.contains('open')) {
        content.classList.remove('open');
        icon.style.transform = "rotate(0deg)";
    } else {
        content.classList.add('open');
        icon.style.transform = "rotate(180deg)";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    calculateFinalTotal();
});
