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
    'Halkalı', 'Mustafa Kemal', 'Küçükçekmece', 'Florya', 'Yeşilköy', 'Bakırköy', 
    'Zeytinburnu', 'Kazlıçeşme', 'Yenikapı', 'Sirkeci', 'Üsküdar', 'Ayrılık Çeşmesi', 
    'Söğütlüçeşme', 'Göztepe', 'Bostancı', 'Maltepe'
  ],
  'METROBUS': [
    'Beylikdüzü', 'Avcılar', 'Sefaköy', 'Yenibosna', 'Şirinevler', 'İncirli', 
    'Cevizlibağ', 'Topkapı', 'Edirnekapı', 'Halacıoğlu', 'Okmeydanı', 'Mecidiyeköy', 
    'Zincirlikuyu', '15 Temmuz Şehitler Köprüsü', 'Burhaniye', 'Söğütlüçeşme'
  ],
  'VAPUR': [
    'Eminönü', 'Karaköy', 'Beşiktaş', 'Ortaköy', 'Bebek', 'Emirgan', 
    'İstinye', 'Sarıyer', 'Kadıköy', 'Üsküdar', 'Kuzguncuk', 'Beylerbeyi', 
    'Çengelköy', 'Anadolu Hisarı', 'Kanlıca', 'Beykoz'
  ],
  'T1': [
    'Kabataş', 'Fındıklı', 'Tophane', 'Karaköy', 'Eminönü', 'Sirkeci', 
    'Gülhane', 'Sultanahmet', 'Çemberlitaş', 'Beyazıt', 'Laleli', 'Aksaray', 
    'Yusufpaşa', 'Haseki', 'Fındıkzade', 'Çapa'
  ]
};

// Tüm istasyonları tek bir düz listeye aç (10.000 seviyeyi desteklemek için)
const BASE_STATION_LIST = [];
LINES.forEach(line => {
  const names = STATION_NAMES[line.id];
  names.forEach((name, index) => {
    BASE_STATION_LIST.push({
      ...line,
      stationName: name,
      isTransfer: index === names.length - 1 // Son istasyon aktarma noktasıdır
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
