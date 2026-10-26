// Turnike: Sözcük Seferi - Kelime Havuzu ve Seviye Üretici
// Kök kelime daima teknik bir terimdir. Çark (wheel) harfleri SADECE kök kelimenin harflerinden oluşur.
// Alt kelimeler tamamen bu kök kelimenin harflerinden türetilebilen anlamlı kelimelerdir.

import { applyDDA } from './dda';

const PUZZLE_SETS_TR = [
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
  { root: "İSTASYON", subs: ["SON", "SOY", "YAN"] },
  { root: "TRAMVAY", subs: ["RAY", "AYAR", "TAY", "YAR"] },
  { root: "KÜPEŞTE", subs: ["KÜP", "PEŞ", "TEPE", "KEP"] },
  { root: "GÜZERGAH", subs: ["GÜR", "ZAR", "GAR", "HER"] },
  { root: "MAKİNİST", subs: ["KAS", "İSİM", "MİT", "SİM"] },
  { root: "OTOBÜS", subs: ["BOT", "SÜT", "ÜST", "TOS"] },
  { root: "TRAVERS", subs: ["SERT", "TERS", "VER", "SET"] },
  { root: "PANTOGRAF", subs: ["POT", "NOT", "GAR", "NAR"] },

  // SEVİYE 41-50: 5-6 KELİMELİ (Çok Karmaşık)
  { root: "MARMARAY", subs: ["RAY", "AYAR", "YAR", "MAR", "ARA"] },
  { root: "KONTROL", subs: ["KOT", "KOL", "ROL", "KOR", "NOT"] },
  { root: "METROBÜS", subs: ["METRO", "TERS", "SÜT", "BET", "ÜST"] },
  { root: "GÜVENLİK", subs: ["GÜVEN", "İLK", "NİL", "KİL", "LİG"] },
  { root: "YOLCULUK", subs: ["YOL", "KOL", "KUL", "ULU", "YOK"] },
  { root: "AKTARMA", subs: ["KART", "AYAR", "AKT", "TAR", "ARA"] },
  { root: "EMNİYET", subs: ["NET", "YEM", "YEN", "MEY", "İTİ"] },
  { root: "TERSANE", subs: ["TERS", "SER", "NET", "SET"] },
  { root: "RÜZGÂR", subs: ["GÜR", "ZAR", "RUZ", "GÂR"] },
  { root: "BİLETLİK", subs: ["BİLET", "İLK", "TEK", "BİT", "KEL"] }
,
  // YENİ EKLENEN İÇERİKLER
  { root: "KABİN", subs: ["KAN","BİN","BAK"] },
  { root: "HATTAT", subs: ["HAT","TAHT","TAT"] },
  { root: "GARAJ", subs: ["GAR","ARA","RAJ"] },
  { root: "KÖPRÜ", subs: ["KÖR","PÜR","ÖPÜK"] },
  { root: "MERKEZ", subs: ["KEM","KEZ","ERK"] },
  { root: "METRO", subs: ["ROM","MOR","TER"] },
  { root: "TÜNEL", subs: ["TEL","TÜL"] },
  { root: "AKBİL", subs: ["BAL","İLK","BAK"] },
  { root: "MİNİBÜS", subs: ["BİN","İSİM","SİN","MİNİ"] },
  { root: "OTOGAR", subs: ["GAR","ROT","ORG"] },
  { root: "TERMİNAL", subs: ["TER","MİL","NİL","ALEM","MİNE","İLAN"] },
  { root: "VİYADÜK", subs: ["VİDA","YAD","KÜV","DÜK"] },
  { root: "TAKSİ", subs: ["KAST","ASİ","AİT","TİK","KAS"] },
  { root: "İSTİKLAL", subs: ["İLK","ASİL","LAL","ALİ","KAST","İTİ","SİL","KAT"] },
  { root: "GALATA", subs: ["ATA","ALT","TAL","ALA"] },
  { root: "KIZKULESİ", subs: ["KIZ","KUL","SES","ZİL","SİL","KİL","İLK"] },
  { root: "BOĞAZİÇİ", subs: ["BOĞ","İÇİ","BAĞ","AĞA","BİZ"] },
  { root: "BEYOĞLU", subs: ["BEY","OĞUL","YOL","BOL"] },
  { root: "AYASOFYA", subs: ["SOY","FAY","AYI","YAS","SAF"] },
  { root: "KAPALIÇARŞI", subs: ["ÇARŞI","KAPI","AÇI","AŞI","ALI","AÇIK","ŞARK"] },
  { root: "HALİÇ", subs: ["HAL","ALİ","İLÇ","AHİ"] },
  { root: "PİERRELOTİ", subs: ["LİR","TİP","POT","PİL","ROT","TOR","İLİ"] },
  { root: "MÜZE", subs: ["ÜZÜM","MEZ","ÜZE"] },
  { root: "SARAY", subs: ["YAR","AYAR","SAY","YAS","ARA"] },
  { root: "ÇARŞI", subs: ["AÇI","AŞI","AÇIK","AŞÇI","ÇIĞ","ŞARK"] },
  { root: "KULE", subs: ["KUL","KEL","ULU"] }
];

const PUZZLE_SETS_EN = [
  // LEVEL 1-10: SINGLE WORD
  { root: "BUS", subs: [] },
  { root: "CAB", subs: [] },
  { root: "CAR", subs: [] },
  { root: "VAN", subs: [] },
  { root: "RAIL", subs: [] },
  { root: "TUBE", subs: [] },
  { root: "TAXI", subs: [] },
  { root: "TRAM", subs: [] },
  { root: "DOCK", subs: [] },
  { root: "GATE", subs: [] },

  // LEVEL 11-20: 2 WORDS
  { root: "TRAIN", subs: ["TIN"] },
  { root: "FERRY", subs: ["FRY"] },
  { root: "ROUTE", subs: ["TOE"] },
  { root: "TRACK", subs: ["ARC"] },
  { root: "BRAKE", subs: ["BAR"] },
  { root: "MOTOR", subs: ["ROT"] },
  { root: "DEPOT", subs: ["POD"] },
  { root: "LEVER", subs: ["EVE"] },
  { root: "CABIN", subs: ["BAN"] },
  { root: "WHEEL", subs: ["HEW"] },

  // LEVEL 21-30: 3 WORDS
  { root: "SIGNAL", subs: ["NAIL", "GAS"] },
  { root: "TUNNEL", subs: ["TUNE", "LET"] },
  { root: "BRIDGE", subs: ["RIG", "BID"] },
  { root: "ENGINE", subs: ["GIN", "INN"] },
  { root: "TICKET", subs: ["TIE", "KIT"] },
  { root: "HARBOR", subs: ["BAR", "ORB"] },
  { root: "PISTON", subs: ["PIN", "SON"] },
  { root: "SWITCH", subs: ["WIT", "HIS"] },
  { root: "BOILER", subs: ["OIL", "ORE"] },
  { root: "TENDER", subs: ["TEN", "DEN"] },

  // LEVEL 31-40: 4-5 WORDS
  { root: "STATION", subs: ["SAINT", "SON", "TAN", "SIT"] },
  { root: "TRANSIT", subs: ["RAIN", "SIT", "TAN", "ART"] },
  { root: "PLATFORM", subs: ["FLAT", "PORT", "LAP", "OAT"] },
  { root: "TERMINAL", subs: ["MILE", "RENT", "TIN", "AIM"] },
  { root: "OVERPASS", subs: ["OVER", "PASS", "SEA", "OAR"] },
  { root: "COMMUTER", subs: ["CORE", "MORE", "CUT", "MET"] },
  { root: "CARRIAGE", subs: ["RACE", "CAGE", "AGE", "AIR"] },
  { root: "ENGINEER", subs: ["GENE", "RING", "GIN", "IRE"] },
  { root: "CONDUCTOR", subs: ["CORD", "COURT", "NUT", "COD"] },
  { root: "CROSSROAD", subs: ["ROAD", "CROSS", "OAR", "ARC"] },

  // LEVEL 41-50: 5-6 WORDS
  { root: "UNDERGROUND", subs: ["UNDER", "ROUND", "DUG", "RUN", "GNU"] },
  { root: "LOCOMOTIVE", subs: ["MOTIVE", "COOL", "TIE", "LOT"] },
  { root: "SUSPENSION", subs: ["SPINE", "NOSE", "SUN", "PEN", "ION"] },
  { root: "ACCELERATE", subs: ["CLEAR", "RATE", "ALE", "ACE", "EAR"] },
  { root: "HORSEPOWER", subs: ["HORSE", "POWER", "ROPE", "HERO", "PORE"] },
  { root: "TURNTABLE", subs: ["TABLE", "TURN", "BELT", "NUT", "BUT"] },
  { root: "DEPARTURE", subs: ["DEPART", "TAPE", "PURE", "RAT", "RUE"] },
  { root: "TRANSPORT", subs: ["SPORT", "TRAP", "PORT", "RAT", "NOT"] },
  { root: "SUBMARINE", subs: ["MARINE", "BRAIN", "MINE", "BAN"] },
  { root: "CHECKPOINT", subs: ["CHECK", "POINT", "HINT", "PEN", "NET"] }
];

export const VALID_WORDS_TR = new Set([
  // ===== METRO & ULAŞIM TERİMLERİ (Kökler) =====
  "RAY", "HAT", "YOL", "TEL", "BOJİ", "TREN", "DEPO", "GİŞE", "KART", "FREN",
  "PERON", "VAGON", "DURAK", "BİLET", "VAPUR", "MAKAS", "MOTOR", "TRAFO", "SEFER", "PANEL",
  "SİSTEM", "RULMAN", "BALAST", "KONTAK", "ULAŞIM", "SENSÖR", "İSKELE", "SİNYAL", "DİNGİL", "BAKIM",
  "TURNİKE", "KATENER", "İSTASYON", "TRAMVAY", "KÜPEŞTE", "GÜZERGAH", "MAKİNİST", "OTOBÜS", "TRAVERS", "PANTOGRAF",
  "MARMARAY", "LOKOMOTİF", "METROBÜS", "FÜNİKÜLER", "DEMİRYOLU", "AKTARMA", "TELEFERİK", "TERSANE", "RÜZGÂR", "KOMPARTİMAN",
  // Ek metro terimleri
  "KABLON", "MAKARA", "KALDIRAÇ", "PISTON", "KONTROL", "KAPTAN", "SÜRÜCÜ", "MAKİNE", "TÜNEL", "VİYADÜK",

  // ===== ORTAK TÜRKÇE ALT KELİMELER (3 harf) =====
  "AL", "AR", "AT", "AZ", "BAL", "BAŞ", "BEL", "BOY", "BUZ", "DAL", "DAR", "DEL",
  "DİL", "DİŞ", "DİZ", "DİN", "EL", "EM", "ER", "ET", "EV", "GAZ", "GEL",
  "GÖL", "GÖZ", "GÜL", "GÜN", "GÜÇ", "HAK", "HAL", "HAM", "HAN", "HAS", "HOP", "HUY",
  "İŞ", "KAL", "KAN", "KAP", "KAŞ", "KAY", "KAZ", "KEL", "KEM", "KES", "KIL", "KIR", "KIŞ",
  "KOL", "KOR", "KOT", "KOY", "KUL", "KUR", "KUŞ", "LAL", "MAL", "MAR", "MAT", "MOR",
  "NAR", "NUR", "NAM", "NET", "NİL", "NOT", "OT", "OVA", "POT", "ROL", "ROT", "RUH",
  "SAÇ", "SAL", "SAR", "SAT", "SAY", "SEL", "SEN", "SER", "SET", "SES", "SİL", "SİM",
  "SOL", "SON", "SOY", "SÖK", "SÖZ", "SUÇ", "SUR", "SÜT", "ŞAH", "ŞAL", "ŞAN",
  "TAK", "TAL", "TAN", "TAR", "TAŞ", "TAY", "TEK", "TER", "TOK", "TON", "TOP", "TOR", "TOZ",
  "TÜL", "UÇ", "ÜST", "VAR", "VER", "YAK", "YAL", "YAN", "YAP", "YAR", "YAŞ",
  "YAT", "YAY", "YEL", "YEM", "YEN", "YER", "YOK", "ZAR", "ZİL",
  // Var olan alt kelimeler
  "ALP", "AST", "AŞI", "AKIM", "ASİL", "AKT", "ARA", "BAK", "BET", "BOT", "FAR", "FER",
  "FİL", "FÜL", "GAR", "GÂR", "GÜR", "HER", "İLK", "İTİ", "İSİM", "KEP", "KÜP", "KÜR",
  "KİL", "KİM", "LİG", "MEY", "MİR", "MİT", "MOL", "PEŞ", "RUZ", "TAS", "TOS", "TERS",
  "SERT", "TANK", "TEPE", "GÜVEN", "RENK", "KENT", "ULU", "BİT", "DOR", "ELİ",
  "AYAR", "AKIM", "BAK", "BİLET", "METRO", "DEMİR",

  // ===== 4 HARFLİ TÜRKÇE SÖZCÜKLER =====
  "ALAN", "ALIM", "ALTI", "ARPA", "ASIL", "ATIK", "AYAK", "AYNA",
  "BALE", "BANT", "BERK", "BOYA", "ÇARK", "ÇATI",
  "FARE", "FARK", "GECE", "GEMİ", "GEZİ",
  "KABA", "KAFA", "KALE", "KAMA", "KAMP", "KAPI", "KARA", "KAYA", "KEDI",
  "KOCA", "KOKU", "KOLA", "KRAL", "LAPA", "LEKE", "LİRA", "LOTO",
  "MANA", "MAVİ", "MAYA", "MEZE", "MODA", "NANE", "NOTA",
  "OCAK", "OĞUL", "OKUL", "OLGU", "ONUR", "ORAL", "ORDU", "ORTA", "OVAL", "OYUN",
  "ÖDEV", "ÖFKE", "ÖLÇÜ", "ÖNCE", "ÖRTÜ", "ÖZEL",
  "PANO", "PARA", "PARK", "PAŞA", "PERİ", "POLO", "PURO",
  "ROTA", "RÜYA", "SAKA", "SALA", "SANA", "SARI", "SARP",
  "SOBA", "SOMA", "SOPA", "SORU",
  "TANE", "TANI", "TARA", "TAVA", "TAZE", "TIRE", "TOKA", "TUNA", "TURA",
  "VADI", "VALI", "VANA",
  "YAKA", "YAMA", "YARA", "YASA", "YAYA", "YEDI", "YELE", "YURT", "ZEKA", "ZEVK",
  "İNEK", "DUYU", "KRAL", "KÖŞK", "ZIRH",

  // ===== 5 HARFLİ TÜRKÇE SÖZCÜKLER (İyi Kök Adayları) =====
  "BAHAR", "BALIK", "BANKA", "ÇELIK", "DALGA", "DENİZ", "ERDEM",
  "FENER", "HASAT", "HAYAT", "HIZLI",
  "KANAT", "KAPAK", "KARIN", "KARMA", "KAYAK", "KAŞIK", "KEMAN", "KEMER", "KENAR",
  "KÖPEK", "KONAK", "KUŞAK", "KURAL", "KUMUL",
  "LIMAN", "MANAV", "MEYVA", "NADIR", "NEHIR",
  "OKUMA", "ORMAN", "ÖNDER", "PAMUK",
  "PAKET", "PALTO", "PLAKA", "RADAR", "REKOR", "RITIM",
  "SANAT", "SALON", "SATIR", "ŞARKI", "ŞEKER", "ŞEHİR",
  "TARIM", "TARLA", "TATIL", "TAVAN", "TEKNE",
  "TÜFEK", "TÜREV", "UMMAN", "UYGAR",
  "VATAN", "YAKIN", "YARIN", "YASAK", "YAŞAM", "YAZAR", "YOLCU", "YUMAK",
  "ZAFER", "ZAMAN",

  // ===== 6 HARFLİ TÜRKÇE SÖZCÜKLER =====
  "KAVŞAK", "KAMYON", "KAPALI", "KARTAL", "SULTAN", "KAVRAM", "KUMSAL",
  "KAFKAS", "KÖRFEZ", "KENTLI", "MARKIZ", "MANTAR", "MARKET", "MESLEK",
  "MEYDAN", "PATRON", "REHBER", "SANDIK", "ŞELALE", "TEMBEL", "TERAZI",
  "TEZGAH", "TRAFIK", "TOMRUK", "UÇURUM", "ULUSAL", "YALNIZ", "YAPRAK",
  "YOĞURT", "YÜKSEK", "ZANAAT", "ZINDAN", "ZENCIR",

  // ===== İSTANBUL DURAK VE SEMTLER =====
  "KARAKÖY", "EMİNÖNÜ", "KADIKÖY", "BEŞİKTAŞ", "ÜSKÜDAR", "BOSTANCI", "KARTAL", "PENDİK",
  "TUZLA", "GEBZE", "TAKSİM", "LEVENT", "ŞİŞLİ", "MECİDİYEKÖY", "MASLAK", "SARIYER",
  "BEYKOZ", "BEYOĞLU", "FATİH", "ZEYTİNBURNU", "BAKIRKÖY", "ŞİRİNEVLER", "YENİBOSNA",
  "SEFAKÖY", "AVCILAR", "BEYLİKDÜZÜ", "ESENYURT", "BÜYÜKÇEKMECE", "SİLİVRİ", "ÇATALCA",
  "AKSU", "LALELİ", "BEYAZIT", "SİRKECİ", "GÜLHANE", "SULTANAHMET", "ÇEMBERLİTAŞ",
  "KABATAŞ", "FINDIKLI", "TOPHANE"
]);

export const VALID_WORDS_EN = new Set([
  "BUS", "CAB", "CAR", "VAN", "RAIL", "TUBE", "TAXI", "TRAM", "DOCK", "GATE",
  "TRAIN", "FERRY", "ROUTE", "TRACK", "BRAKE", "MOTOR", "DEPOT", "LEVER", "CABIN", "WHEEL",
  "SIGNAL", "TUNNEL", "BRIDGE", "ENGINE", "TICKET", "HARBOR", "PISTON", "SWITCH", "BOILER", "TENDER",
  "STATION", "TRANSIT", "PLATFORM", "TERMINAL", "OVERPASS", "COMMUTER", "CARRIAGE", "ENGINEER", "CONDUCTOR", "CROSSROAD",
  "UNDERGROUND", "LOCOMOTIVE", "SUSPENSION", "ACCELERATE", "HORSEPOWER", "TURNTABLE", "DEPARTURE", "TRANSPORT", "SUBMARINE", "CHECKPOINT",
  // Sub-words
  "TIN", "FRY", "TOE", "ARC", "BAR", "ROT", "POD", "EVE", "BAN", "HEW",
  "NAIL", "GAS", "TUNE", "LET", "RIG", "BID", "GIN", "INN", "TIE", "KIT",
  "ORB", "PIN", "SON", "WIT", "HIS", "OIL", "ORE", "TEN", "DEN",
  "SAINT", "TAN", "SIT", "RAIN", "ART", "FLAT", "PORT", "LAP", "OAT",
  "MILE", "RENT", "AIM", "OVER", "PASS", "SEA", "OAR", "CORE", "MORE", "CUT", "MET",
  "RACE", "CAGE", "AGE", "AIR", "GENE", "RING", "IRE", "CORD", "COURT", "NUT", "COD",
  "ROAD", "CROSS", "UNDER", "ROUND", "DUG", "RUN", "GNU", "MOTIVE", "COOL", "LOT",
  "SPINE", "NOSE", "SUN", "PEN", "ION", "CLEAR", "RATE", "ALE", "ACE", "EAR",
  "HORSE", "POWER", "ROPE", "HERO", "PORE", "TABLE", "TURN", "BELT", "BUT",
  "DEPART", "TAPE", "PURE", "RAT", "RUE", "SPORT", "TRAP", "NOT",
  "MARINE", "BRAIN", "MINE", "RIM", "CHECK", "POINT", "HINT", "NET",
  "BROOKLYN", "MANHATTAN", "QUEENS", "BRONX", "STATEN", "HARLEM", "CHELSEA", "SOHO", "TRIBECA", "GREENWICH", "TIMES", "SQUARE", "PENN", "GRAND", "CENTRAL", "MADISON", "LEXINGTON", "BROADWAY", "WALL", "STREET", "WATERLOO", "VICTORIA", "PADDINGTON", "EUSTON", "KINGS", "CROSS", "PANCRAS", "LIVERPOOL", "LONDON", "BRIDGE", "BAKER", "BOND", "OXFORD", "PICCADILLY", "CIRCUS", "CHARING", "LEICESTER", "COVENT", "GARDEN", "HOLBORN"
]);

// Kelime anlamları — TR
export const WORD_MEANINGS_TR = {
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
  "PANTOGRAF": "Trenin tavanında bulunan, katener telinden elektriği araca ileten mekanizma.",
  "MARMARAY": "İstanbul Boğazı'nın altından geçen, Anadolu ile Avrupa'yı bağlayan raylı sistem.",
  "LOKOMOTİF": "Tren katarını çeken, enerji kaynağı taşıyan ana çekici araç.",
  "METROBÜS": "Özel şeritlerde çalışan, yüksek kapasiteli hızlı otobüs sistemi.",
  "DEMİRYOLU": "Çelik raylar üzerinde trenlerin hareket ettiği ulaşım altyapısı.",
  "AKTARMA": "Bir ulaşım aracından diğerine ek ücret ödemeden geçiş yapma hakkı.",
  "TERSANE": "Gemilerin yapıldığı, onarıldığı ve bakımının yapıldığı kıyı tesisi.",
  "KOMPARTİMAN": "Tren vagonlarının bölümlere ayrılmış kapalı yolcu kabinlerinden her biri.",
  "KARAKÖY": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "EMİNÖNÜ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "KADIKÖY": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "BEŞİKTAŞ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "ÜSKÜDAR": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "BOSTANCI": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "KARTAL": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "PENDİK": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "TUZLA": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "GEBZE": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "TAKSİM": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "LEVENT": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "ŞİŞLİ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "MECİDİYEKÖY": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "MASLAK": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "SARIYER": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "BEYKOZ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "BEYOĞLU": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "FATİH": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "ZEYTİNBURNU": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "BAKIRKÖY": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "ŞİRİNEVLER": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "YENİBOSNA": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "SEFAKÖY": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "AVCILAR": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "BEYLİKDÜZÜ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "ESENYURT": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "BÜYÜKÇEKMECE": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "SİLİVRİ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "ÇATALCA": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "AKSU": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "LALELİ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "BEYAZIT": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "SİRKECİ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "GÜLHANE": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "SULTANAHMET": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "ÇEMBERLİTAŞ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "KABATAŞ": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "FINDIKLI": "İstanbul ulaşım ağında önemli bir durak/bölge.",
  "TOPHANE": "İstanbul ulaşım ağında önemli bir durak/bölge."
,
  // YENİ EKLENEN ANLAMLAR
  "KABİN": "Sürücü veya yolcuların bulunduğu kapalı küçük oda.",
  "HATTAT": "Geleneksel hat sanatıyla uğraşan ve yazıları güzelleştiren usta.",
  "GARAJ": "Otobüs, tren veya diğer ulaşım araçlarının park ettiği kapalı alan.",
  "KÖPRÜ": "Akarsu, vadi veya yolların üzerinden geçişi sağlayan yapı.",
  "MERKEZ": "Ulaşım hatlarının birleştiği, şehrin en işlek ana noktası.",
  "METRO": "Şehir içinde yeraltından giden hızlı toplu taşıma sistemi.",
  "TÜNEL": "Dağ, tepe veya yeraltından açılan ulaşım geçidi.",
  "AKBİL": "İstanbul'da bir zamanlar ulaşım için kullanılan elektronik bilet (Akıllı Bilet).",
  "MİNİBÜS": "Kısa mesafeli şehir içi hatlarda çalışan küçük otobüs.",
  "OTOGAR": "Şehirlerarası otobüslerin yolcu indirip bindirdiği kalkış noktası.",
  "TERMİNAL": "Bir ulaşım hattının son bulduğu veya başladığı ana tesis.",
  "VİYADÜK": "Vadi veya çukur yerleri aşmak için ayaklar üzerine kurulan yüksek köprü.",
  "TAKSİ": "Ücret karşılığında yolcu taşıyan ticari otomobil.",
  "İSTİKLAL": "Beyoğlu'nun dünyaca ünlü, tarihi tramvayın çalıştığı caddesi.",
  "GALATA": "Karaköy'ün üstünde yer alan ve meşhur kulesiyle bilinen tarihi semt.",
  "KIZKULESİ": "Üsküdar açıklarında, Boğaz'ın ortasında yer alan tarihi kule.",
  "BOĞAZİÇİ": "İstanbul'un Asya ve Avrupa yakalarını ayıran doğal suyolu.",
  "AYASOFYA": "Dünya mimarlık tarihinin en önemli yapılarından biri olan tarihi mabet.",
  "KAPALIÇARŞI": "Dünyanın en büyük ve en eski kapalı çarşılarından biri.",
  "HALİÇ": "İstanbul Boğazı'nın Marmara Denizi ile birleştiği yerdeki doğal liman.",
  "PİERRELOTİ": "Eyüpsultan'da Haliç manzarasına hakim, teleferikle çıkılan tarihi tepe.",
  "MÜZE": "Sanat ve bilim eserlerinin, tarihi kalıntıların sergilendiği yer.",
  "SARAY": "Hükümdarların veya devlet başkanlarının oturduğu büyük yapı.",
  "ÇARŞI": "Dükkanların bulunduğu, alışveriş yapılan yer.",
  "KULE": "Çoğunlukla kare veya silindir biçimindeki yüksek yapı."
};


// Kelime anlamları — EN
export const WORD_MEANINGS_EN = {
  "RAIL": "A steel bar forming part of the track on which trains run.",
  "TUBE": "An underground railway system, especially the one in London.",
  "TRAM": "A light rail vehicle that runs on tracks along public streets.",
  "TRAIN": "A series of connected railroad cars pulled by a locomotive.",
  "FERRY": "A boat or ship for conveying passengers and goods across water.",
  "ROUTE": "A way or course taken in getting from a starting point to a destination.",
  "TRACK": "A pair of parallel rails providing a runway for trains.",
  "BRAKE": "A device for slowing or stopping a moving vehicle.",
  "MOTOR": "A machine that converts electrical energy into mechanical motion.",
  "DEPOT": "A place for the storage of large quantities of equipment or vehicles.",
  "CABIN": "A compartment or room in a train for passengers or crew.",
  "WHEEL": "A circular component that rotates on an axle to enable movement.",
  "SIGNAL": "An apparatus used to convey information about track conditions to train operators.",
  "TUNNEL": "An underground passage built for a railway to pass through.",
  "BRIDGE": "A structure carrying a road or railway across a river or other obstacle.",
  "ENGINE": "A machine with moving parts that converts power into motion.",
  "TICKET": "A piece of paper or card giving the holder a right to travel.",
  "HARBOR": "A sheltered port where ships may anchor safely.",
  "PISTON": "A cylindrical component that moves up and down within an engine cylinder.",
  "SWITCH": "A device for making and breaking connections in railway tracks.",
  "STATION": "A place where trains stop for passengers to board and exit.",
  "TRANSIT": "The carrying of people or goods from one place to another.",
  "PLATFORM": "A raised level surface alongside a railway track where passengers wait.",
  "TERMINAL": "A station at the end of a transportation line.",
  "COMMUTER": "A person who travels regularly between home and work by train or bus.",
  "CARRIAGE": "A separate section of a train for carrying passengers.",
  "ENGINEER": "A person who drives a locomotive or manages an engine.",
  "CONDUCTOR": "A person who collects fares on a bus, train, or other public transport.",
  "UNDERGROUND": "A railway system running through tunnels beneath a city.",
  "LOCOMOTIVE": "A powered railway vehicle used for pulling trains.",
  "TRANSPORT": "The system or means of conveying people or goods from place to place.",
  "DEPARTURE": "The act of leaving a place, especially the start of a journey.",
  "CHECKPOINT": "A barrier or manned entrance where travelers are inspected.",
  "SUBMARINE": "A watercraft capable of operating underwater.",
  "BROOKLYN": "A well-known transit location or area.",
  "MANHATTAN": "A well-known transit location or area.",
  "QUEENS": "A well-known transit location or area.",
  "BRONX": "A well-known transit location or area.",
  "STATEN": "A well-known transit location or area.",
  "HARLEM": "A well-known transit location or area.",
  "CHELSEA": "A well-known transit location or area.",
  "SOHO": "A well-known transit location or area.",
  "TRIBECA": "A well-known transit location or area.",
  "GREENWICH": "A well-known transit location or area.",
  "TIMES": "A well-known transit location or area.",
  "SQUARE": "A well-known transit location or area.",
  "PENN": "A well-known transit location or area.",
  "GRAND": "A well-known transit location or area.",
  "CENTRAL": "A well-known transit location or area.",
  "MADISON": "A well-known transit location or area.",
  "LEXINGTON": "A well-known transit location or area.",
  "BROADWAY": "A well-known transit location or area.",
  "WALL": "A well-known transit location or area.",
  "STREET": "A well-known transit location or area.",
  "WATERLOO": "A well-known transit location or area.",
  "VICTORIA": "A well-known transit location or area.",
  "PADDINGTON": "A well-known transit location or area.",
  "EUSTON": "A well-known transit location or area.",
  "KINGS": "A well-known transit location or area.",
  "CROSS": "A well-known transit location or area.",
  "PANCRAS": "A well-known transit location or area.",
  "LIVERPOOL": "A well-known transit location or area.",
  "LONDON": "A well-known transit location or area.",
  "BRIDGE": "A well-known transit location or area.",
  "BAKER": "A well-known transit location or area.",
  "BOND": "A well-known transit location or area.",
  "OXFORD": "A well-known transit location or area.",
  "PICCADILLY": "A well-known transit location or area.",
  "CIRCUS": "A well-known transit location or area.",
  "CHARING": "A well-known transit location or area.",
  "LEICESTER": "A well-known transit location or area.",
  "COVENT": "A well-known transit location or area.",
  "GARDEN": "A well-known transit location or area.",
  "HOLBORN": "A well-known transit location or area."
};

const normalizeTerm = (term) => term.toLocaleUpperCase('tr-TR');

const canFormNormalizedWord = (word, availableLetters) => {
  let chars = availableLetters.split('');
  for (let i = 0; i < word.length; i++) {
    let index = chars.indexOf(word[i]);
    if (index === -1) return false;
    chars.splice(index, 1);
  }
  return true;
};

const seededRandom = (seed) => {
  return () => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
};

const shuffleWith = (array, rand) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const canFormWord = (word, availableLetters) => {
  return canFormNormalizedWord(normalizeTerm(word), normalizeTerm(availableLetters));
};

const LEVEL_CAP = 10000;

export const PROVIDER_MAP_TR = {
  // Metro Istanbul
  "RAY": "Metro Istanbul", "HAT": "Metro Istanbul", "BOJİ": "Metro Istanbul", "TREN": "Metro Istanbul",
  "DEPO": "Metro Istanbul", "GİŞE": "Metro Istanbul", "KART": "Metro Istanbul", "FREN": "Metro Istanbul",
  "PERON": "Metro Istanbul", "VAGON": "Metro Istanbul", "MAKAS": "Metro Istanbul", "MOTOR": "Metro Istanbul",
  "TRAFO": "Metro Istanbul", "SİSTEM": "Metro Istanbul", "BALAST": "Metro Istanbul", "SİNYAL": "Metro Istanbul",
  "DİNGİL": "Metro Istanbul", "TURNİKE": "Metro Istanbul", "KATENER": "Metro Istanbul", "İSTASYON": "Metro Istanbul",
  "TRAMVAY": "Metro Istanbul", "MAKİNİST": "Metro Istanbul", "TRAVERS": "Metro Istanbul", "PANTOGRAF": "Metro Istanbul",
  "MARMARAY": "Metro Istanbul", "LOKOMOTİF": "Metro Istanbul", "YOL": "Metro Istanbul",
  // IETT
  "DURAK": "IETT", "BİLET": "IETT", "SEFER": "IETT", "ULAŞIM": "IETT", "OTOBÜS": "IETT", "GÜZERGAH": "IETT",
  "METROBÜS": "IETT", "AKTARMA": "IETT", "GARAJ": "IETT", "YOLCULUK": "IETT",
  // Sehir Hatlari
  "VAPUR": "Sehir Hatlari", "İSKELE": "Sehir Hatlari", "RIHTIM": "Sehir Hatlari", "HALAT": "Sehir Hatlari",
  "PERVANE": "Sehir Hatlari", "KÜPEŞTE": "Sehir Hatlari", "TERSANE": "Sehir Hatlari",
  // Busforus
  "BUSFORUS": "Busforus", "REHBER": "Busforus", "PANORAMİK": "Busforus", "BİLETLEME": "Busforus", "TURROTASI": "Busforus"
};

export const PROVIDER_MAP_EN = {
  // Metro
  "RAIL": "Metro", "TUBE": "Metro", "TRAM": "Metro", "TRAIN": "Metro", "TRACK": "Metro", "LEVER": "Metro",
  "CABIN": "Metro", "WHEEL": "Metro", "SIGNAL": "Metro", "TUNNEL": "Metro", "STATION": "Metro", "PLATFORM": "Metro",
  "TERMINAL": "Metro", "OVERPASS": "Metro", "COMMUTER": "Metro", "CARRIAGE": "Metro", "ENGINEER": "Metro",
  "UNDERGROUND": "Metro", "LOCOMOTIVE": "Metro", "TURNTABLE": "Metro",
  // IETT
  "BUS": "IETT", "CAB": "IETT", "CAR": "IETT", "VAN": "IETT", "TAXI": "IETT", "GATE": "IETT", "ROUTE": "IETT",
  "BRAKE": "IETT", "MOTOR": "IETT", "DEPOT": "IETT", "TICKET": "IETT", "SWITCH": "IETT", "TRANSIT": "IETT",
  "CONDUCTOR": "IETT", "CROSSROAD": "IETT", "ACCELERATE": "IETT", "HORSEPOWER": "IETT", "DEPARTURE": "IETT",
  "TRANSPORT": "IETT", "CHECKPOINT": "IETT",
  // City Lines
  "DOCK": "City Lines", "FERRY": "City Lines", "BRIDGE": "City Lines", "HARBOR": "City Lines", "BOILER": "City Lines",
  "TENDER": "City Lines", "SUSPENSION": "City Lines", "SUBMARINE": "City Lines",
  // Busforus
  "PISTON": "Busforus", "ENGINE": "Busforus"
};

// Yalnızca geçerli kök kelimeleri barındıran havuz
const TECH_TR = Array.from(VALID_WORDS_TR).filter(w => w.length >= 3).map(root => ({
  root,
  provider: PROVIDER_MAP_TR[root] || "Metro Istanbul",
  category: "Genel"
}));

const TECH_EN = Array.from(VALID_WORDS_EN).filter(w => w.length >= 3).map(root => ({
  root,
  provider: PROVIDER_MAP_EN[root] || "Metro",
  category: "General"
}));

const FORMABLE_TR = new Map();
const FORMABLE_EN = new Map();

const getDifficulty = (levelIndex) => {
  if (levelIndex < 10) return { targetWords: 2, minRoot: 3, maxRoot: 5, label: "baslangic" };
  if (levelIndex < 50) return { targetWords: 3, minRoot: 4, maxRoot: 7, label: "kolay" };
  if (levelIndex < 150) return { targetWords: 4, minRoot: 5, maxRoot: 8, label: "orta" };
  if (levelIndex < 400) return { targetWords: 4, minRoot: 6, maxRoot: 8, label: "orta-plus" };
  if (levelIndex < 1000) return { targetWords: 5, minRoot: 6, maxRoot: 8, label: "zor" }; // Max 8 harf (UI taşmasını önlemek için)
  if (levelIndex < 2500) return { targetWords: 5, minRoot: 7, maxRoot: 8, label: "uzman" };
  if (levelIndex < 5000) return { targetWords: 6, minRoot: 7, maxRoot: 8, label: "usta" };
  return { targetWords: 6, minRoot: 7, maxRoot: 8, label: "efsane" };
};

const getCandidateWords = (root, validWords, levelIndex, rand, formableCache) => {
  const rootLen = root.length;
  const minLen = levelIndex < 50 ? 3 : 4;
  const baseCandidates = formableCache.get(root) || [...validWords].filter((word) => word !== root && word.length < rootLen && canFormNormalizedWord(word, root));
  const candidates = baseCandidates.filter((word) => word.length >= minLen);

  // Soft sort using sigmoid
  const pLongFirst = 1 / (1 + Math.exp(-(levelIndex - 400) / 100));
  
  return shuffleWith(candidates, rand).sort((a, b) => {
    const longFirst = rand() < pLongFirst;
    const lengthBias = longFirst ? b.length - a.length : a.length - b.length;
    return lengthBias || a.localeCompare(b);
  });
};

const placePuzzleWords = (root, candidates, targetWords) => {
  const selectedWords = [];
  const gridLetters = new Map();

  const placeWord = (word, startX, startY, isHorizontal) => {
    selectedWords.push({ word, startX, startY, isHorizontal });
    for (let i = 0; i < word.length; i++) {
      const x = startX + (isHorizontal ? i : 0);
      const y = startY + (isHorizontal ? 0 : i);
      gridLetters.set(`${x},${y}`, word[i]);
    }
  };

  const canPlaceWord = (word, startX, startY, isHorizontal) => {
    const beforeX = startX - (isHorizontal ? 1 : 0);
    const beforeY = startY - (isHorizontal ? 0 : 1);
    const afterX = startX + (isHorizontal ? word.length : 0);
    const afterY = startY + (isHorizontal ? 0 : word.length);
    if (gridLetters.has(`${beforeX},${beforeY}`)) return false;
    if (gridLetters.has(`${afterX},${afterY}`)) return false;

    let hasIntersection = false;
    for (let i = 0; i < word.length; i++) {
      const x = startX + (isHorizontal ? i : 0);
      const y = startY + (isHorizontal ? 0 : i);
      const key = `${x},${y}`;

      if (gridLetters.has(key)) {
        if (gridLetters.get(key) !== word[i]) return false;
        hasIntersection = true;
        continue;
      }

      const sideA = isHorizontal ? `${x},${y - 1}` : `${x - 1},${y}`;
      const sideB = isHorizontal ? `${x},${y + 1}` : `${x + 1},${y}`;
      if (gridLetters.has(sideA) || gridLetters.has(sideB)) return false;
    }

    return selectedWords.length === 0 || hasIntersection;
  };

  placeWord(root, 0, 0, true);

  for (const word of candidates) {
    if (selectedWords.length >= targetWords) break;
    let placed = false;

    for (const target of [...selectedWords]) {
      if (placed) break;
      for (let i = 0; i < word.length; i++) {
        if (placed) break;
        const char = word[i];
        let targetIndex = target.word.indexOf(char);

        while (targetIndex !== -1) {
          const isHorizontal = !target.isHorizontal;
          const startX = target.startX + (target.isHorizontal ? targetIndex : 0) - (isHorizontal ? i : 0);
          const startY = target.startY + (target.isHorizontal ? 0 : targetIndex) - (isHorizontal ? 0 : i);

          if (canPlaceWord(word, startX, startY, isHorizontal)) {
            placeWord(word, startX, startY, isHorizontal);
            placed = true;
            break;
          }
          targetIndex = target.word.indexOf(char, targetIndex + 1);
        }
      }
    }
  }

  return selectedWords;
};

const getPools = (language) => {
  if (language === "en") {
    return { techTerms: TECH_EN, validWords: VALID_WORDS_EN, formableCache: FORMABLE_EN };
  }
  return { techTerms: TECH_TR, validWords: VALID_WORDS_TR, formableCache: FORMABLE_TR };
};

// Her kök VALID_WORDS içinden en az bir alt kelime üretebilmeli; aksi halde generateLevel
// TRAMVAY fallback'ine düşer (eski listedeki RAY/HAT/YOL 1. seviyeyi 7 harfli yapıyordu).
// Değiştirirken: her kök için alt kelime sayısını kontrol et.
const ONBOARDING_TR = [
  "KART", "TREN", "ROTA", "FREN", "YOLCU", // 1-5: 4-5 harf, 1 alt kelime
  "DURAK", "VAPUR", "METRO", "TÜNEL", "BİLET", // 6-10
  "MOTOR", "SEFER", "TRAFO", "MAKAS", "TEKNE", // 11-15: 2 alt kelime
  "LEVENT", "KAPTAN", "KAMYON", "İSKELE", "SİNYAL", // 16-20
  "BALAST", "KONTAK", "OTOBÜS", "DİNGİL", "ULAŞIM", // 21-25
  "SİSTEM", "TRAVERS", "TERSANE", "TURNİKE", "TRAMVAY" // 26-30: 7 harf
];

const ONBOARDING_EN = [
  "RAIL", "TRAM", "TUBE", "DOCK", "GATE", // 1-5
  "TRAIN", "TRACK", "ROUTE", "BRAKE", "CABIN", // 6-10
  "DEPOT", "MOTOR", "LEVER", "FERRY", "WHEEL", // 11-15
  "TICKET", "TUNNEL", "SIGNAL", "SWITCH", "ENGINE", // 16-20
  "BRIDGE", "HARBOR", "TENDER", "PISTON", "BOILER", // 21-25
  "STATION", "TRANSIT", "PLATFORM", "TERMINAL", "COMMUTER" // 26-30
];

// Son 100 seviyede kullanılan kökleri takip eder (tekrarı önler)
const usedRootsHistory = new Set();

const chooseTechnicalRoot = (levelIndex, language) => {
  // 1-30 Seviyeleri için özel onboarding akışı
  if (levelIndex < 30) {
    const rootName = language === "en" ? ONBOARDING_EN[levelIndex] : ONBOARDING_TR[levelIndex];
    const provider = language === "en" ? (PROVIDER_MAP_EN[rootName] || "Metro") : (PROVIDER_MAP_TR[rootName] || "Metro Istanbul");
    return { root: rootName, provider, category: "Genel" };
  }

  const { techTerms, validWords, formableCache } = getPools(language);
  const difficulty = getDifficulty(levelIndex);

  // Murmur-style daha iyi seed (her seviye tamamen farklı bir kombinasyon verir)
  let seed = (levelIndex + 1) * (language === "en" ? 1879 : 1297);
  seed ^= seed >>> 16;
  seed = Math.imul(seed | 0, 0x45d9f3b | 0);
  seed ^= seed >>> 16;
  const rand = seededRandom(Math.abs(seed));
  
  // Uzunluk kriteri ile filtrele — provider kısıtlaması KALDIRILDI (temanın görsel rozete dönmesi)
  const eligible = techTerms.filter((term) => {
    const len = term.root.length;
    return len >= difficulty.minRoot && len <= difficulty.maxRoot;
  });
  const pool = eligible.length > 5 ? eligible : techTerms;
  const shuffledPool = shuffleWith(pool, rand);

  // Tema tercihi (provider) artık "bonus puan" olarak, hard-filter değil
  const providerCycle = language === "en"
    ? ["Metro", "IETT", "City Lines", "Busforus"]
    : ["Metro Istanbul", "IETT", "Sehir Hatlari", "Busforus"];
  const desiredProvider = providerCycle[levelIndex % providerCycle.length];

  let best = null;
  let bestScore = -1;
  const minLen = levelIndex < 50 ? 3 : 4;

  // 1. Geçiş: Tarihe geçmeyen (taze) köklerden en iyi skoru bul
  for (const term of shuffledPool) {
    if (usedRootsHistory.has(term.root)) continue;
    const count = (formableCache.get(term.root) || [...validWords].filter(w => canFormNormalizedWord(w, term.root)))
      .filter(w => w.length >= minLen && w !== term.root).length;
    if (count < 1) continue;
    const providerBonus = term.provider === desiredProvider ? 3 : 0;
    const score = Math.min(count, difficulty.targetWords + 2) * 10 + term.root.length + providerBonus;
    if (score > bestScore) { best = term; bestScore = score; }
    if (count >= difficulty.targetWords) break;
  }

  // 2. Geçiş: Tüm geçmiş tüketilmişse (nadiren olur) tarihi yoksay
  if (!best) {
    bestScore = -1;
    for (const term of shuffledPool) {
      const count = (formableCache.get(term.root) || [...validWords].filter(w => canFormNormalizedWord(w, term.root)))
        .filter(w => w.length >= minLen && w !== term.root).length;
      const score = Math.min(count, difficulty.targetWords + 2) * 10 + term.root.length;
      if (score > bestScore) { best = term; bestScore = score; }
    }
  }

  // Güvenlik amaçlı fallback
  if (!best) {
    best = { root: language === "en" ? "TRAIN" : "TRAMVAY", provider: language === "en" ? "Metro" : "Metro Istanbul", category: "Genel" };
  }

  // Kullanılan kökü geçmişe ekle (max 100 kayıt tut)
  usedRootsHistory.add(best.root);
  if (usedRootsHistory.size > 100) {
    const [oldest] = usedRootsHistory;
    usedRootsHistory.delete(oldest);
  }

  return best;
};

export const getTimeForLevel = (levelIndex, wordCount, attempts = 1, ddaTimeAdjust = 0) => {
  const difficulty = getDifficulty(levelIndex);
  const base = wordCount <= 1 ? 45 : 42;
  const levelPressure = Math.floor(levelIndex / 250) * 2;
  const wordPressure = Math.max(0, wordCount - 3) * 2;
  const tierPressure = {
    baslangic: 0,
    kolay: 2,
    orta: 4,
    "orta-plus": 6,
    zor: 8,
    uzman: 10,
    usta: 12,
    efsane: 14
  }[difficulty.label] || 4;

  let time = Math.max(18, base - levelPressure - wordPressure - tierPressure);
  
  // Pity system instead of punishment
  if (attempts === 3) time += 5;
  if (attempts >= 4) time += 10;
  
  // DDA adjustment
  time += ddaTimeAdjust;

  return Math.max(18, time);
};

const getMissionInfo = (provider, levelIndex, language) => {
  const isTr = language !== "en";
  
  // Özel Seviye Tipleri
  const isSpecialIntervention = (levelIndex + 1) % 5 === 0 && (levelIndex + 1) % 10 !== 0; // 5, 15, 25...
  const isTransferMission = (levelIndex + 1) % 10 === 0; // 10, 20, 30... (Kayıp eşyadan hemen önce/sonra)

  if (isSpecialIntervention) {
    return {
      type: isTr ? "Teknik Müdahale" : "Technical Intervention",
      task: isTr ? "Enerji hatları ve makas kontrolü yapılıyor." : "Checking power lines and rail switch systems."
    };
  }
  
  if (isTransferMission) {
    return {
      type: isTr ? "Aktarma Görevi" : "Transfer Mission",
      task: isTr ? "Hatlar arası yolcu akışı düzenleniyor." : "Regulating passenger transfer flow between lines."
    };
  }

  const missions = {
    "Metro Istanbul": [
      "Peron yoğunluğu azaltılıyor...",
      "Sinyalizasyon kontrolleri yapılıyor...",
      "Katener hattı gerilimi ölçülüyor...",
      "İstasyon havalandırma testi yapılıyor...",
      "Yürüyen merdiven bakımı yapılıyor..."
    ],
    "Metro": [
      "Reducing platform congestion...",
      "Performing signaling checks...",
      "Measuring catenary line voltage...",
      "Testing station ventilation...",
      "Maintaining escalators..."
    ],
    "IETT": [
      "Sefer planlaması güncelleniyor...",
      "Metrobüs şerit kontrolü yapılıyor...",
      "Validatör yazılım güncellemesi...",
      "Durak aydınlatmaları kontrol ediliyor...",
      "Filo takip sistemi kalibrasyonu..."
    ],
    "Sehir Hatlari": [
      "Vapur yanaşma hazırlığı yapılıyor...",
      "İskele halat ve babaları kontrol ediliyor...",
      "Rıhtım güvenlik taraması yapılıyor...",
      "Pervane şaftı yağlama kontrolü...",
      "Makine dairesi sıcaklık ölçümü..."
    ],
    "City Lines": [
      "Preparing vessel docking...",
      "Checking pier ropes and bollards...",
      "Performing dock security sweep...",
      "Inspecting propeller shaft lubrication...",
      "Measuring engine room temperature..."
    ],
    "Busforus": [
      "Tur rotası güncelleniyor...",
      "Rehber ses sistemi test ediliyor...",
      "Panoramik cam tavan temizliği...",
      "Biletleme otomasyonu kontrol ediliyor...",
      "Çift katlı otobüs fren testi..."
    ]
  };

  const pool = missions[provider] || (isTr ? ["Hat kontrolü yapılıyor..."] : ["Checking transit line..."]);
  const task = pool[levelIndex % pool.length];
  
  return {
    type: isTr ? "Normal Sefer" : "Regular Transit",
    task
  };
};

export const generateLevel = (levelIndex, language = "tr", attempts = 1, performanceScore = 0.55, volatility = "stable") => {
  const safeLevel = ((levelIndex % LEVEL_CAP) + LEVEL_CAP) % LEVEL_CAP;
  
  // Murmur-style RNG seed — her seviye + deneme kombinasyonu tamamen farklı
  let baseSeed = (safeLevel + 1) * (language === "en" ? 1879 : 1297);
  baseSeed ^= baseSeed >>> 16;
  baseSeed = Math.imul(baseSeed | 0, 0x45d9f3b | 0);
  baseSeed ^= baseSeed >>> 16;
  const seedHash = Math.abs((baseSeed ^ Math.imul(attempts | 0, 0x9e3779b9 | 0)));
  const rand = seededRandom(seedHash);
  
  const { validWords, formableCache } = getPools(language);
  const baseDifficulty = getDifficulty(safeLevel);
  const difficulty = applyDDA(baseDifficulty, performanceScore, volatility);
  
  let term = chooseTechnicalRoot(safeLevel, language);
  // Pass DDA adjusted minRoot/maxRoot if necessary, but chooseTechnicalRoot is static right now.
  let candidates = getCandidateWords(term.root, validWords, safeLevel, rand, formableCache);
  
  // Eğer hiç candidate yoksa (örn: "YOL" gibi çok kısa bir kelime geldiyse),
  // sonsuz döngüden kaçınmak veya bulmacanın boş kalmasını engellemek için
  // yeni bir kelime seç.
  if (candidates.length === 0) {
    term = { root: language === 'en' ? 'TRAIN' : 'TRAMVAY', provider: language === 'en' ? 'Metro' : 'Metro Istanbul', category: 'General' };
    candidates = getCandidateWords(term.root, validWords, safeLevel, rand, formableCache);
  }

  const words = placePuzzleWords(term.root, candidates, difficulty.targetWords);
  const wheelLetters = shuffleWith(term.root.split(""), rand);
  const missionInfo = getMissionInfo(term.provider, safeLevel, language);

  return {
    levelName: language === "en" ? `Level ${levelIndex + 1}` : `Seviye ${levelIndex + 1}`,
    stationName: term.root,
    words,
    wheelLetters,
    allValidWords: words.map((item) => item.word),
    validWordsSet: validWords,
    technicalTerm: term.root,
    provider: term.provider,
    category: term.category,
    difficulty: difficulty.label,
    maxSupportedLevel: LEVEL_CAP,
    missionType: missionInfo.type,
    missionTask: missionInfo.task,
    ddaTimeAdjust: difficulty.timeAdjustSeconds || 0,
    extraHintAvailable: difficulty.extraHintAvailable || false
  };
};

export const VALID_WORDS = VALID_WORDS_TR;
export const WORD_MEANINGS = WORD_MEANINGS_TR;
