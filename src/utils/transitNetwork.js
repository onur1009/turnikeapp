export const LEVELS_PER_STATION = 5; // Her durakta 5 bölüm oynanır

export const LINES = [
  { id: 'M2', name: 'M2 Hacıosman - Yenikapı', color: '#22c55e', icon: 'train' },       // Yeşil
  { id: 'MARMARAY', name: 'Marmaray', color: '#64748b', icon: 'directions_train' },   // Gri
  { id: 'METROBUS', name: 'Metrobüs', color: '#eab308', icon: 'directions_bus' },     // Sarı
  { id: 'VAPUR', name: 'Şehir Hatları', color: '#3b82f6', icon: 'directions_boat' },  // Mavi
  { id: 'T1', name: 'T1 Kabataş - Bağcılar', color: '#1d4ed8', icon: 'tram' }         // Koyu Mavi
];

export const STATION_NAMES = {
  'M2': [
    'Hacıosman', 'Darüşşafaka', 'Atatürk Oto Sanayi', 'İTÜ Ayazağa', 'Sanayi Mahallesi', 
    '4. Levent', 'Levent', 'Gayrettepe', 'Mecidiyeköy', 'Şişli', 'Osmanbey', 
    'Taksim', 'Şişhane', 'Haliç', 'Vezneciler', 'Yenikapı'
  ],
  'MARMARAY': [
    'Gebze', 'Darıca', 'Osmangazi', 'Fatih', 'Çayırova', 'Tuzla', 'İçmeler', 'Aydıntepe', 
    'Güzelyalı', 'Tersane', 'Kaynarca', 'Pendik', 'Yunus', 'Kartal', 'Başak', 'Atalar', 
    'Cevizli', 'Maltepe', 'Süreyya Plajı', 'İdealtepe', 'Küçükyalı', 'Bostancı', 'Suadiye', 
    'Erenköy', 'Göztepe', 'Feneryolu', 'Söğütlüçeşme', 'Ayrılık Çeşmesi', 'Üsküdar', 
    'Sirkeci', 'Yenikapı', 'Kazlıçeşme', 'Zeytinburnu', 'Yenimahalle', 'Bakırköy', 'Ataköy', 
    'Yeşilyurt', 'Yeşilköy', 'Florya Akvaryum', 'Florya', 'Küçükçekmece', 'Mustafa Kemal', 'Halkalı'
  ],
  'METROBUS': [
    'Söğütlüçeşme', 'Fikirtepe', 'Uzunçayır', 'Acıbadem', 'Altunizade', 'Burhaniye', 
    '15 Temmuz Şehitler Köprüsü', 'Zincirlikuyu', 'Mecidiyeköy', 'Çağlayan', 'Okmeydanı Hastane', 
    'Darülaceze-Perpa', 'Okmeydanı', 'Halıcıoğlu', 'Ayvansaray-Eyüpsultan', 'Edirnekapı', 
    'Bayrampaşa-Maltepe', 'Topkapı', 'Cevizlibağ', 'Merter', 'Zeytinburnu', 'İncirli', 
    'Bahçelievler', 'Şirinevler', 'Yenibosna', 'Sefaköy', 'Beşyol', 'Florya', 'Cennet Mahallesi', 
    'Küçükçekmece', 'İBB Sosyal Tesisler', 'Şükrübey', 'Avcılar', 'Cihangir', 'Mustafa Kemal Paşa', 
    'Saadetdere Mahallesi', 'Haramidere Sanayi', 'Haramidere', 'Güzelyurt', 'Beylikdüzü', 
    'Beylikdüzü Belediye', 'Cumhuriyet Mahallesi', 'Beylikdüzü Sondurak'
  ],
  'VAPUR': [
    'Eminönü', 'Karaköy', 'Beşiktaş', 'Ortaköy', 'Bebek', 'Emirgan', 
    'İstinye', 'Sarıyer', 'Kadıköy', 'Üsküdar', 'Kuzguncuk', 'Beylerbeyi', 
    'Çengelköy', 'Anadolu Hisarı', 'Kanlıca', 'Beykoz'
  ],
  'T1': [
    'Kabataş', 'Fındıklı', 'Tophane', 'Karaköy', 'Eminönü', 'Sirkeci', 'Gülhane', 
    'Sultanahmet', 'Çemberlitaş', 'Beyazıt', 'Laleli', 'Aksaray', 'Yusufpaşa', 
    'Haseki', 'Fındıkzade', 'Çapa', 'Pazartekke', 'Topkapı', 'Cevizlibağ', 
    'Atatürk Öğrenci Yurdu', 'Merkez Efendi', 'Akşemsettin', 'Mithatpaşa', 
    'Seyitnizam', 'Akıncılar', 'Güngören', 'Merter Tekstil Merkezi', 'Mehmet Akif', 
    'Zeytinburnu', 'Bağcılar'
  ]
};

export const STATION_INFO = {
  'Yenikapı': 'Marmaray, M1 ve M2 hatlarının kesiştiği devasa bir transfer merkezidir.',
  'Sirkeci': 'Tarihi Orient Express\'in son durağı olan efsanevi tren garıdır.',
  'Üsküdar': 'Mihrimah Sultan Camii ve Kız Kulesi\'ne ev sahipliği yapan tarihi semt.',
  'Mecidiyeköy': 'İstanbul\'un iş merkezlerinden biri ve en yoğun aktarma noktalarından.',
  'Söğütlüçeşme': 'Kadıköy\'ün ana aktarma merkezi, Metrobüs ve Marmaray\'ın buluşma noktası.',
  'Kabataş': 'Vapur, tramvay ve fünikülerin kesiştiği boğaz kıyısındaki tarihi iskele.',
  'Sultanahmet': 'Ayasofya ve Sultanahmet Camii ile İstanbul\'un kalbinin attığı yer.',
  'Karaköy': 'Tarihi yarımadaya komşu, Galata Kulesi\'ne çıkan yokuşun başladığı nokta.',
  'Eminönü': 'Mısır Çarşısı ve balık ekmek kokularıyla meşhur tarihi iskele meydanı.',
  'Zincirlikuyu': 'Metrobüs ağının en büyük düğüm noktalarından biri.',
  'Hacıosman': 'Belgrad Ormanı\'na açılan, M2 hattının kuzey uç noktası.',
  'Zeytinburnu': 'Birçok farklı raylı sistemin birbirine bağlandığı önemli bir batı aktarma merkezi.',
  'Kadıköy': 'Anadolu yakasının kültür, sanat ve ulaşım merkezi.',
  'Avcılar': 'İstanbul Üniversitesi kampüsüne ev sahipliği yapan hareketli bir ilçe.',
  'Beylikdüzü': 'İstanbul\'un batısındaki modern yerleşimlerin merkezi.',
  'Halkalı': 'Avrupa yönüne giden uluslararası trenlerin de kalktığı ana istasyon.',
  'Gebze': 'Kocaeli sınırlarında yer alan Marmaray\'ın en doğu ucu.'
};

const stationFreq = {};
LINES.forEach(line => {
  STATION_NAMES[line.id].forEach(name => {
    stationFreq[name] = (stationFreq[name] || 0) + 1;
  });
});

// Tüm istasyonları tek bir düz listeye aç (10.000 seviyeyi desteklemek için)
const BASE_STATION_LIST = [];
LINES.forEach(line => {
  const names = STATION_NAMES[line.id];
  names.forEach((name, index) => {
    BASE_STATION_LIST.push({
      ...line,
      stationName: name,
      stationInfo: STATION_INFO[name] || 'İstanbul ulaşım ağında önemli bir durak/bölge.',
      isTransfer: stationFreq[name] > 1
    });
  });
});

const TOTAL_BASE_STATIONS = BASE_STATION_LIST.length;

// Verilen istasyon index'ine göre istasyon verisini döndürür
export const getStationData = (globalStationIndex) => {
  const loopCount = Math.floor(globalStationIndex / TOTAL_BASE_STATIONS);
  const baseIndex = globalStationIndex % TOTAL_BASE_STATIONS;
  const baseStation = BASE_STATION_LIST[baseIndex];

  return {
    ...baseStation,
    globalIndex: globalStationIndex,
    displayName: loopCount > 0 ? `${baseStation.stationName} (Tur ${loopCount + 1})` : baseStation.stationName,
    loopCount
  };
};

// Layout hesaplaması için (X koordinatı zigzag yapar)
export const getStationXPosition = (globalStationIndex) => {
  const cycle = globalStationIndex % 20; // 20 istasyonda bir tam zikzak yapar
  if (cycle < 6) return 30; // Sol düz (6 istasyon)
  if (cycle === 6) return 40; // Geçiş 1
  if (cycle === 7) return 50; // Geçiş 2
  if (cycle === 8) return 60; // Geçiş 3
  if (cycle >= 9 && cycle < 15) return 70; // Sağ düz (6 istasyon)
  if (cycle === 15) return 60; // Geçiş 1
  if (cycle === 16) return 50; // Geçiş 2
  if (cycle === 17) return 40; // Geçiş 3
  if (cycle >= 18) return 30; // Sol düze dönüş
  return 50;
};
