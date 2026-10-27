// İstanbul raylı sistem, metrobüs ve vapur hatları (oyundaki yolculuk sırasıyla).
// İlk 5 hat oyunun ilk sürümündeki sırayı korur: seviye -> durak eşlemesi değişmesin diye
// yeni hatlar yalnızca SONA eklenir. İstasyon listeleri 2025 itibarıyla derlendi; emin
// olunamayan uzatmalar (ör. M5 Samandıra sonrası, M11 Halkalı kolu) bilerek eklenmedi.
//
// mode: metro | marmaray | metrobus | ferry | tram | funicular | cablecar
// code: rozet üzerinde yazan kısa kod

export const LINE_DEFS = [
  // --- İlk sürümün hatları (sıra değişmez) ---
  { id: 'M2', code: 'M2', name: 'M2 Yenikapı – Hacıosman', mode: 'metro', color: '#16a34a' },
  { id: 'MARMARAY', code: 'MR', name: 'Marmaray Halkalı – Gebze', mode: 'marmaray', color: '#64748b' },
  { id: 'METROBUS', code: '34', name: 'Metrobüs Söğütlüçeşme – Beylikdüzü', mode: 'metrobus', color: '#eab308' },
  { id: 'VAPUR', code: 'BV', name: 'Şehir Hatları – Boğaz', mode: 'ferry', color: '#2563eb' },
  { id: 'T1', code: 'T1', name: 'T1 Kabataş – Bağcılar', mode: 'tram', color: '#1d4ed8' },

  // --- Eklenen hatlar ---
  { id: 'M1A', code: 'M1A', name: 'M1A Yenikapı – Atatürk Havalimanı', mode: 'metro', color: '#dc2626' },
  { id: 'M1B', code: 'M1B', name: 'M1B Yenikapı – Kirazlı', mode: 'metro', color: '#ef4444' },
  { id: 'M3', code: 'M3', name: 'M3 Bakırköy İDO – Kayaşehir Merkez', mode: 'metro', color: '#0ea5e9' },
  { id: 'M4', code: 'M4', name: 'M4 Kadıköy – Sabiha Gökçen Havalimanı', mode: 'metro', color: '#db2777' },
  { id: 'M5', code: 'M5', name: 'M5 Üsküdar – Samandıra Merkez', mode: 'metro', color: '#7e22ce' },
  { id: 'M6', code: 'M6', name: 'M6 Levent – Boğaziçi Üniversitesi/Hisarüstü', mode: 'metro', color: '#a16207' },
  { id: 'M7', code: 'M7', name: 'M7 Yıldız – Mahmutbey', mode: 'metro', color: '#f472b6' },
  { id: 'M8', code: 'M8', name: 'M8 Bostancı – Parseller', mode: 'metro', color: '#2563eb' },
  { id: 'M9', code: 'M9', name: 'M9 Ataköy – Olimpiyat', mode: 'metro', color: '#ca8a04' },
  { id: 'M11', code: 'M11', name: 'M11 Gayrettepe – İstanbul Havalimanı', mode: 'metro', color: '#6b7280' },
  { id: 'T4', code: 'T4', name: 'T4 Topkapı – Mescid-i Selam', mode: 'tram', color: '#ea580c' },
  { id: 'T5', code: 'T5', name: 'T5 Eminönü – Alibeyköy Cep Otogarı', mode: 'tram', color: '#9333ea' },
  { id: 'F1', code: 'F1', name: 'F1 Taksim – Kabataş Füniküleri', mode: 'funicular', color: '#15803d' },
  { id: 'F2', code: 'F2', name: 'F2 Karaköy – Beyoğlu (Tünel)', mode: 'funicular', color: '#4d7c0f' },
  { id: 'TF1', code: 'TF1', name: 'TF1 Maçka – Taşkışla Teleferiği', mode: 'cablecar', color: '#0d9488' },
  { id: 'TF2', code: 'TF2', name: 'TF2 Eyüpsultan – Piyer Loti Teleferiği', mode: 'cablecar', color: '#0f766e' },
  { id: 'ADALAR', code: 'AV', name: 'Şehir Hatları – Adalar', mode: 'ferry', color: '#0284c7' },
  { id: 'HALIC', code: 'HV', name: 'Şehir Hatları – Haliç', mode: 'ferry', color: '#0369a1' },
];

export const EXTRA_STATION_NAMES = {
  M1A: [
    'Yenikapı', 'Aksaray', 'Emniyet-Fatih', 'Topkapı-Ulubatlı', 'Bayrampaşa-Maltepe', 'Sağmalcılar',
    'Kocatepe', 'Otogar', 'Terazidere', 'Davutpaşa-YTÜ', 'Merter', 'Zeytinburnu', 'Bakırköy-İncirli',
    'Bahçelievler', 'Ataköy-Şirinevler', 'Yenibosna', 'DTM-İstanbul Fuar Merkezi', 'Atatürk Havalimanı'
  ],
  M1B: [
    'Yenikapı', 'Aksaray', 'Emniyet-Fatih', 'Topkapı-Ulubatlı', 'Bayrampaşa-Maltepe', 'Sağmalcılar',
    'Kocatepe', 'Otogar', 'Esenler', 'Menderes', 'Üçyüzlü', 'Bağcılar Meydan', 'Kirazlı'
  ],
  M3: [
    'Bakırköy İDO', 'Özgürlük Meydanı', 'İncirli', 'Haznedar', 'İlkyuva', 'Molla Gürani', 'Kirazlı',
    'Yenimahalle', 'Mahmutbey', 'İSTOÇ', 'İkitelli Sanayi', 'Turgut Özal', 'Siteler', 'Başak Konutları',
    'Onurkent', 'Şehir Hastanesi', 'Toplu Konutlar', 'Kayaşehir Merkez'
  ],
  M4: [
    'Kadıköy', 'Ayrılık Çeşmesi', 'Acıbadem', 'Ünalan', 'Göztepe', 'Yenisahra', 'Kozyatağı', 'Bostancı',
    'Küçükyalı', 'Maltepe', 'Huzurevi', 'Gülsuyu', 'Esenkent', 'Hastane-Adliye', 'Soğanlık', 'Kartal',
    'Yakacık-Adliye', 'Pendik', 'Tavşantepe', 'Fevzi Çakmak-Hastane', 'Yayalar-Şeyhli', 'Kurtköy',
    'Sabiha Gökçen Havalimanı'
  ],
  M5: [
    'Üsküdar', 'Fıstıkağacı', 'Bağlarbaşı', 'Altunizade', 'Kısıklı', 'Bulgurlu', 'Ümraniye', 'Çarşı',
    'Yamanevler', 'Çakmak', 'Ihlamurkuyu', 'Altınşehir', 'İmam Hatip Lisesi', 'Dudullu', 'Necip Fazıl',
    'Çekmeköy', 'Meclis', 'Sarıgazi', 'Sancaktepe', 'Samandıra Merkez'
  ],
  M6: ['Levent', 'Nispetiye', 'Etiler', 'Boğaziçi Üniversitesi/Hisarüstü'],
  M7: [
    'Yıldız', 'Fulya', 'Mecidiyeköy', 'Çağlayan', 'Kağıthane', 'Nurtepe', 'Alibeyköy', 'Çırçır',
    'Veysel Karani-Akşemsettin', 'Yeşilpınar', 'Kazım Karabekir', 'Yenimahalle', 'Karadeniz Mahallesi',
    'Tekstilkent-Giyimkent', 'Oruç Reis', 'Göztepe Mahallesi', 'Mahmutbey'
  ],
  M8: [
    'Bostancı', 'Emin Ali Paşa', 'Ayşekadın', 'Kozyatağı', 'Küçükbakkalköy', 'İçerenköy', 'Kayışdağı',
    'Mevlana', 'İMES', 'Modoko-Keyap', 'Dudullu', 'Huzur', 'Parseller'
  ],
  M9: [
    'Ataköy', 'Yenibosna', 'Çobançeşme', '29 Ekim Cumhuriyet', 'Doğu Sanayi', 'Mimar Sinan', '15 Temmuz',
    'Halkalı Caddesi', 'Atatürk Mahallesi', 'Bahariye', 'MASKO', 'İkitelli Sanayi', 'Ziya Gökalp Mahallesi',
    'Olimpiyat'
  ],
  M11: ['Gayrettepe', 'Kağıthane', 'Hasdal', 'Kemerburgaz', 'Göktürk', 'İhsaniye', 'İstanbul Havalimanı'],
  T4: [
    'Topkapı', 'Fetihkapı', 'Vatan', 'Edirnekapı', 'Şehitlik', 'Demirkapı', 'Topçular', 'Rami',
    'Uluyol Bereç', 'Sağmalcılar', 'Bosna Çukurçeşme', 'Ali Fuat Başgil', 'Taşköprü', 'Karadeniz',
    'Kiptaş-Venezia', 'Cumhuriyet Mahallesi', '50. Yıl-Baştabya', 'Hacı Şükrü', 'Yenimahalle',
    'Sultançiftliği', 'Cebeci', 'Mescid-i Selam'
  ],
  T5: [
    'Eminönü', 'Küçükpazar', 'Cibali', 'Fener', 'Balat', 'Ayvansaray', 'Feshane', 'Eyüpsultan Teleferik',
    'Eyüpsultan Devlet Hastanesi', 'Silahtarağa Mahallesi', 'Üniversite', 'Alibeyköy Merkez',
    'Alibeyköy Metro', 'Alibeyköy Cep Otogarı'
  ],
  F1: ['Taksim', 'Kabataş'],
  F2: ['Karaköy', 'Beyoğlu'],
  TF1: ['Maçka', 'Taşkışla'],
  TF2: ['Eyüpsultan', 'Piyer Loti'],
  ADALAR: ['Kabataş', 'Kadıköy', 'Kınalıada', 'Burgazada', 'Heybeliada', 'Büyükada'],
  HALIC: ['Üsküdar', 'Karaköy', 'Kasımpaşa', 'Fener', 'Balat', 'Hasköy', 'Ayvansaray', 'Sütlüce', 'Eyüpsultan'],
};

// Mod bilgisi: Türkçe ad, harita grubu, ikon ve bu hatta öncelikli bulmaca terimleri
// (gameLogic PROVIDER_MAP değerleriyle eşleşir).
export const MODE_META = {
  metro: { label: 'Metro', icon: 'subway', termProvider: 'Metro Istanbul', termProviderEn: 'Metro' },
  marmaray: { label: 'Marmaray', icon: 'directions_railway', termProvider: 'Metro Istanbul', termProviderEn: 'Metro' },
  tram: { label: 'Tramvay', icon: 'tram', termProvider: 'Metro Istanbul', termProviderEn: 'Metro' },
  funicular: { label: 'Füniküler', icon: 'funicular', termProvider: 'Metro Istanbul', termProviderEn: 'Metro' },
  cablecar: { label: 'Teleferik', icon: 'gondola_lift', termProvider: 'Metro Istanbul', termProviderEn: 'Metro' },
  metrobus: { label: 'Metrobüs', icon: 'directions_bus', termProvider: 'IETT', termProviderEn: 'IETT' },
  ferry: { label: 'Vapur', icon: 'directions_boat', termProvider: 'Sehir Hatlari', termProviderEn: 'City Lines' },
};

// Harita grupları (sıralı)
export const MODE_GROUPS = ['metro', 'marmaray', 'tram', 'funicular', 'cablecar', 'metrobus', 'ferry'];
