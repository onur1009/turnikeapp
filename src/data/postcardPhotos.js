// Kartpostal fotoğrafları: Wikimedia Commons, açık lisanslı (CC0 / CC BY / CC BY-SA).
// Dosyalar public/postcards/<anahtar>.webp (640 px). CC BY ve CC BY-SA, fotoğrafçının adının ve
// lisansın gösterilmesini ister: kartpostalın büyük görünümünde yazar. Yeni fotoğrafta lisansı buraya ekle.
export const PHOTO_CREDITS = {
  ayasofya: { artist: "Arild Vågen", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Hagia_Sophia_Mars_2013.jpg" },
  sultanahmet: { artist: "Moonik", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Exterior_of_Sultan_Ahmed_I_Mosque_in_Istanbul,_Turkey_002.jpg" },
  kopru: { artist: "Moonik", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Bosphorus,_Fatih_Sultan_Mehmet_Bridge,_Turkey_001.jpg" },
  kizkulesi: { artist: "Matti Blume", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Maiden_tower,_Istanbul_(P1100207).jpg" },
  haydarpasa: { artist: "Matti Blume", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Haydarpasa_Terminal,_Istanbul_(P1100159).jpg" },
  sirkeci: { artist: "Diego Delso", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Estaci%C3%B3n_de_Sirkeci,_Estambul,_Turqu%C3%ADa,_2024-09-28,_DD_76-78_HDR.jpg" },
  havalimani: { artist: "Arne Müseler", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:%C4%B0stanbul_Havaliman%C4%B1_Airport_2019_16.jpg" },
  buyukada: { artist: "Anil Öztas", license: "CC BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Istanbul_(TR),_Ka%C5%9F%C4%B1k_Adas%C4%B1_--_2024_--_0528.jpg" },
  halic: { artist: "Arild Vågen", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Golden_Horn_Metro_Bridge_Mars_2013.jpg" },
  kadikoy: { artist: "Matti Blume", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Kadikoey,_Istanbul_(P1100156).jpg" },
  galata: { artist: "User:Ggia", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:20101106_Galata_Tower_Istanbul_Turkey_Panorama.jpg" },
  rumelihisari: { artist: "Hamdigumus", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Rumeli_Hisar%C4%B1_-_Ota%C4%9Ftepeden_G%C3%B6r%C3%BCn%C3%BC%C5%9F%C3%BC.jpg" },
  vapur: { artist: "Tarikkaanmuslu", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Sehir_Hatlari_ferry_Kadikoy_on_the_Bosphorus,_Istanbul_-_Tarik_Kaan_Muslu.jpg" },
  ortakoy: { artist: "Ank Kumar", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Ortak%C3%B6y_Mosque_or_B%C3%BCy%C3%BCk_Mecidiye_Camii_(Grand_Imperial_Mosque_of_Sultan_Abd%C3%BClmecid)_in_Be%C5%9Fikta%C5%9F,_Istanbul,_T%C3%BCrkiye_(Ank_Kumar,_Infosys_Limited)_05.jpg" },
  levent: { artist: "Derrick Brutel", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Levent_business_district_in_Istanbul.jpg" },
  camlica: { artist: "Antoloji", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:%C3%87aml%C4%B1ca_Kulesi.jpg" },
};

// Semt (scenes.js REGIONS) -> fotoğraflar; durağa göre sırayla seçilir ki aynı semtteki kartlar farklı olsun
export const REGION_PHOTOS = {
  historic: ['ayasofya', 'sultanahmet', 'sirkeci', 'galata'],
  beyoglu: ['galata', 'vapur', 'ortakoy'],
  bosphorus: ['kopru', 'rumelihisari', 'ortakoy', 'vapur'],
  marmaray: ['haydarpasa', 'sirkeci', 'kizkulesi', 'kopru'],
  anadolu: ['kizkulesi', 'kadikoy', 'camlica', 'haydarpasa'],
  business: ['levent', 'kopru', 'camlica'],
  airport: ['havalimani', 'levent'],
  islands: ['buyukada', 'vapur', 'kizkulesi'],
  goldenhorn: ['halic', 'galata', 'sultanahmet'],
  west: ['kopru', 'levent', 'ayasofya', 'halic'],
};

export const photoFor = (regionId, stationIndex = 0) => {
  const list = REGION_PHOTOS[regionId] || REGION_PHOTOS.historic;
  return list[Math.abs(stationIndex) % list.length];
};
