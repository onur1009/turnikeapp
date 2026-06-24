// Turnike: Sözcük Seferi - Kelime Havuzu ve Seviye Üretici
// Kök kelime daima teknik bir terimdir. Çark (wheel) harfleri SADECE kök kelimenin harflerinden oluşur.
// Alt kelimeler tamamen bu kök kelimenin harflerinden türetilebilen anlamlı kelimelerdir.

const PUZZLE_SETS = [
  // SEVİYE 1-10: SADECE TEK KELİME (Çark = Kök Kelime)
  { root: "RAY", subs: [] },
  { root: "HAT", subs: [] },
  { root: "YOL", subs: [] },
  { root: "TEL", subs: [] },
  { root: "BOJİ", subs: [] },
  { root: "TREN", subs: [] },
  { root: "DEPO", subs: [] },
  { root: "GİŞE", subs: [] },
  { root: "KART", subs: [] },
  { root: "FREN", subs: [] },
  
  // SEVİYE 11-20: 2 KELİMELİ (1 Kök + 1 Alt Kelime)
  { root: "PERON", subs: [] },
  { root: "VAGON", subs: ["OVA"] },
  { root: "DURAK", subs: ["KUR"] },
  { root: "BİLET", subs: ["TEL"] },
  { root: "VAPUR", subs: ["VAR"] },
  { root: "MAKAS", subs: ["KAS"] },
  { root: "MOTOR", subs: ["ROT"] },
  { root: "TRAFO", subs: ["FAR"] },
  { root: "SEFER", subs: ["SER"] },
  { root: "PANEL", subs: ["ALP"] },
  
  // SEVİYE 21-30: 3 KELİMELİ (1 Kök + 2 Alt Kelime)
  { root: "SİSTEM", subs: ["SES", "SİM"] },
  { root: "RULMAN", subs: ["NUR", "NAM"] },
  { root: "BALAST", subs: ["BAL", "AST"] },
  { root: "KONTAK", subs: ["KOT", "KAN"] },
  { root: "ULAŞIM", subs: ["AŞI", "ŞAL"] }, 
  { root: "SENSÖR", subs: ["SEN", "SES"] },
  { root: "İSKELE", subs: ["İLK", "KES"] },
  { root: "SİNYAL", subs: ["ASİL", "SAL"] },
  { root: "DİNGİL", subs: ["DİL", "DİN"] },
  { root: "BAKIM", subs: ["AKIM", "BAK"] },
  
  // SEVİYE 31-40: 4-5 KELİMELİ (Kesişen bulmacalar)
  { root: "TURNİKE", subs: ["TREN", "RENK", "TEK", "KENT"] },
  { root: "KATENER", subs: ["KART", "TANK", "KAN", "NET"] },
  { root: "İSTASYON", subs: ["SON", "SOY", "TAS", "YAN"] },
  { root: "TRAMVAY", subs: ["RAY", "AYAR", "TAY", "YAR"] },
  { root: "KÜPEŞTE", subs: ["KÜP", "PEŞ", "TEPE", "KEP"] },
  { root: "GÜZERGAH", subs: ["GÜR", "ZAR", "GAR", "HER"] },
  { root: "MAKİNİST", subs: ["KAS", "İSİM", "MİT", "SİM"] },
  { root: "OTOBÜS", subs: ["BOT", "SÜT", "ÜST", "TOS"] },
  { root: "TRAVERS", subs: ["SERT", "TERS", "VER", "SET"] },
  { root: "PANTOGRAF", subs: ["POT", "NOT", "GAR", "NAR"] }
];

export const VALID_WORDS = new Set([
  // Kökler
  "RAY", "HAT", "YOL", "TEL", "BOJİ", "TREN", "DEPO", "GİŞE", "KART", "FREN",
  "PERON", "VAGON", "DURAK", "BİLET", "VAPUR", "MAKAS", "MOTOR", "TRAFO", "SEFER", "PANEL",
  "SİSTEM", "RULMAN", "BALAST", "KONTAK", "ULAŞIM", "SENSÖR", "İSKELE", "SİNYAL", "DİNGİL", "BAKIM",
  "TURNİKE", "KATENER", "İSTASYON", "TRAMVAY", "KÜPEŞTE", "GÜZERGAH", "MAKİNİST", "OTOBÜS", "TRAVERS", "PANTOGRAF",
  // Alt Kelimeler (Sadece TDK Anlamlılar)
  "OVA", "KUR", "VAR", "KAS", "ROT", "FAR", "SER", "ALP", "SES", "SİM", "NUR", "NAM", "BAL", "AST", "KOT", "KAN",
  "ŞAL", "AŞI", "SEN", "İLK", "KES", "ASİL", "SAL", "DİL", "DİN", "AKIM", "BAK", "RENK", "TEK", "KENT",
  "TANK", "NET", "SON", "SOY", "TAS", "YAN", "AYAR", "TAY", "YAR", "KÜP", "PEŞ", "TEPE", "KEP",
  "GÜR", "ZAR", "GAR", "HER", "İSİM", "MİT", "BOT", "SÜT", "ÜST", "TOS", "SERT", "TERS", "VER", "SET",
  "POT", "NOT", "NAR"
]);

// Kelimelerin anlamları — Metro İstanbul kurumsal arşivinden derlenen teknik tanımlar
export const WORD_MEANINGS = {
  // Sadece Saf Teknik Kelimelere Anlam Veriyoruz
  "BOJİ": "Tren ve metro vagonlarının tekerlek takımlarını barındıran, titreşimi emen alt şasi.",
  "TREN": "Raylar üzerinde hareket eden, lokomotif ve vagonlardan oluşan ulaşım aracı.",
  "DEPO": "Raylı sistem araçlarının bakım, onarım ve park edildiği kapalı tesis.",
  "GİŞE": "İstasyonlarda bilet satışı ve bilgilendirme hizmeti verilen pencere.",
  "KART": "İstanbulkart; temassız ödeme yapılan elektronik ulaşım kartı.",
  "FREN": "Araç hızını düşüren veya durduran mekanik/elektrik/pnömatik sistem.",
  "PERON": "Yolcuların trene binip indikleri, raylara paralel uzanan platform.",
  "VAGON": "Tren katarını oluşturan, yolcu veya yük taşıyan birimlerden her biri.",
  "DURAK": "Toplu taşıma araçlarının yolcu indirip bindirmek için durduğu belirlenmiş nokta.",
  "BİLET": "Toplu taşımada yolculuk hakkı veren basılı veya dijital geçiş belgesi.",
  "VAPUR": "İstanbul Boğazı ve Haliç hatlarında çalışan yolcu gemisi.",
  "MAKAS": "Trenin bir raydan diğerine geçmesini sağlayan hareketli ray donanımı.",
  "MOTOR": "Elektrik enerjisini mekanik harekete çeviren cer (çekiş) ünitesi.",
  "TRAFO": "Yüksek gerilimi istasyon ve araçların kullanabileceği seviyeye düşüren dönüştürücü.",
  "SEFER": "Bir aracın başlangıçtan bitiş noktasına kadar yaptığı tek yönlü çalışma.",
  "PANEL": "Kontrol merkezinde sistem durumunu gösteren ve kumanda eden gösterge tablosu.",
  "SİSTEM": "Birbiriyle uyumlu çalışan teknik bileşenlerin oluşturduğu bütün.",
  "RULMAN": "Mekanik parçaların sürtünmesini azaltarak dönmesini sağlayan bilyalı yatak.",
  "BALAST": "Rayların altına döşenen, titreşimi emen ve drenaj sağlayan kırık taş tabakası.",
  "KONTAK": "Elektrik devresinde akımın geçişini sağlayan ya da kesen temas noktası.",
  "ULAŞIM": "İnsanları ve yükleri bir noktadan diğerine taşıma hizmeti.",
  "SENSÖR": "Sıcaklık, basınç, hız gibi fiziksel büyüklükleri ölçen elektronik algılayıcı.",
  "İSKELE": "Gemi ve vapurların yanaştığı, yolcu indirip bindirdiği kıyı yapısı.",
  "SİNYAL": "Makiniste dur/yavaş/geç komutlarını ileten ışıklı veya mekanik gösterge.",
  "DİNGİL": "Bogi içinde tekerlekleri birbirine bağlayan ana çelik eksen.",
  "BAKIM": "Araç ve tesislerin güvenli çalışmasını sürdürmek için yapılan periyodik kontrol.",
  "TURNİKE": "İstasyon girişlerinde kart okutarak geçişi kontrol eden elektro-mekanik kapı.",
  "KATENER": "Elektrikli trenlere havadan enerji sağlayan yüksek gerilim kablo sistemi.",
  "İSTASYON": "Yolcuların raylı sisteme erişim sağladığı, peron ve konkorstan oluşan yapı.",
  "TRAMVAY": "Cadde üzerinde raylarda hareket eden hafif raylı taşıma aracı.",
  "KÜPEŞTE": "Vapur ve gemilerde güverte kenarındaki güvenlik korkuluğu.",
  "GÜZERGAH": "Bir toplu taşıma hattının izlediği sabit rota.",
  "MAKİNİST": "Metro veya tren aracını süren, sinyallere göre seferi yöneten personel.",
  "OTOBÜS": "Karayolunda yolcu taşıyan, İETT filosundaki büyük toplu taşıma aracı.",
  "TRAVERS": "Rayların üzerine oturduğu ve yükü balasta dağıtan beton/ahşap destek.",
  "PANTOGRAF": "Trenin tavanında bulunan, kataner telinden elektriği araca ileten mekanizma."
};

export const canFormWord = (word, availableLetters) => {
  let chars = availableLetters.split('');
  for (let i = 0; i < word.length; i++) {
    let index = chars.indexOf(word[i]);
    if (index === -1) return false;
    chars.splice(index, 1);
  }
  return true;
};

// Seviye Üreticisi
export const generateLevel = (levelIndex) => {
  // Sonsuz Döngü İçin Seviye İndeksini Setlere Uyarlama
  const puzzleIndex = levelIndex % PUZZLE_SETS.length;
  const puzzle = PUZZLE_SETS[puzzleIndex];

  const rootWord = puzzle.root;
  // Sadece ilgili bölümdeki alt kelimeler
  const subWords = [...puzzle.subs]; 

  const allWords = [rootWord, ...subWords];

  // Grid üzerine yerleştirme
  const selectedWords = [];
  const gridLetters = new Map();

  const placeWord = (word, startX, startY, isHoriz) => {
    selectedWords.push({ word, startX, startY, isHorizontal: isHoriz });
    for (let i = 0; i < word.length; i++) {
      gridLetters.set(`${startX + (isHoriz ? i : 0)},${startY + (isHoriz ? 0 : i)}`, word[i]);
    }
  };

  const canPlaceWord = (word, startX, startY, isHoriz) => {
    let beforeX = startX - (isHoriz ? 1 : 0);
    let beforeY = startY - (isHoriz ? 0 : 1);
    if (gridLetters.has(`${beforeX},${beforeY}`)) return false;

    let afterX = startX + (isHoriz ? word.length : 0);
    let afterY = startY + (isHoriz ? 0 : word.length);
    if (gridLetters.has(`${afterX},${afterY}`)) return false;

    let hasIntersection = false;
    for (let j = 0; j < word.length; j++) {
      let cx = startX + (isHoriz ? j : 0);
      let cy = startY + (isHoriz ? 0 : j);

      if (gridLetters.has(`${cx},${cy}`)) {
        if (gridLetters.get(`${cx},${cy}`) !== word[j]) return false;
        hasIntersection = true;
      } else {
        let side1X = cx + (isHoriz ? 0 : 1);
        let side1Y = cy + (isHoriz ? 1 : 0);
        let side2X = cx - (isHoriz ? 0 : 1);
        let side2Y = cy - (isHoriz ? 1 : 0);
        if (gridLetters.has(`${side1X},${side1Y}`)) return false;
        if (gridLetters.has(`${side2X},${side2Y}`)) return false;
      }
    }
    return selectedWords.length === 0 || hasIntersection;
  };

  // Kök kelimeyi yatay olarak merkeze yerleştir
  placeWord(rootWord, 0, 0, true);

  // Alt kelimeleri kesişimle yerleştir
  const remaining = subWords.sort((a, b) => b.length - a.length);

  for (let word of remaining) {
    let placed = false;
    for (let target of [...selectedWords]) {
      if (placed) break;
      for (let i = 0; i < word.length; i++) {
        if (placed) break;
        let char = word[i];
        let targetIdx = target.word.indexOf(char);

        while (targetIdx !== -1) {
          let isHoriz = !target.isHorizontal;
          let startX = target.startX + (target.isHorizontal ? targetIdx : 0) - (isHoriz ? i : 0);
          let startY = target.startY + (target.isHorizontal ? 0 : targetIdx) - (isHoriz ? 0 : i);

          if (canPlaceWord(word, startX, startY, isHoriz)) {
            placeWord(word, startX, startY, isHoriz);
            placed = true;
            break;
          }
          targetIdx = target.word.indexOf(char, targetIdx + 1);
        }
      }
    }
  }

  // Çark harflerini SADECE kök kelimenin harflerinden oluştur! 
  // (Kullanıcının bahsettiği hata tam olarak buydu, fazla harf çıkıyordu)
  const wheelLetters = rootWord.split('').sort(() => Math.random() - 0.5);

  return {
    levelName: `Seviye ${levelIndex + 1}`,
    words: selectedWords,
    wheelLetters: wheelLetters,
    allValidWords: allWords
  };
};
