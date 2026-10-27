// Turnike: Sözcük Seferi - Kelime Havuzu ve Seviye Üretici
// Kök kelime daima teknik bir terimdir. Çark (wheel) harfleri SADECE kök kelimenin harflerinden oluşur.
// Alt kelimeler tamamen bu kök kelimenin harflerinden türetilebilen anlamlı kelimelerdir.

import { applyDDA } from './dda';
import { getStationForLevel, MODE_META } from './transitNetwork';
import {
  TRANSIT_MEANINGS_TR, TRANSIT_MEANINGS_EN, TRANSIT_PROVIDERS_TR, TRANSIT_PROVIDERS_EN,
  COMMON_WORDS_TR, COMMON_WORDS_EN
} from '../data/transitTerms';
import { EVERYDAY_ROOTS_TR, EXTRA_WORDS_TR } from '../data/turkishWords';

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
  "KARAKÖY": "Galata Köprüsü'nün Beyoğlu ucunda, vapur iskelesi ve tramvay durağı olan semt.",
  "EMİNÖNÜ": "Mısır Çarşısı'nın bulunduğu, vapur iskeleleri ve tramvay durağıyla tarihi yarımadanın kıyı merkezi.",
  "KADIKÖY": "Anadolu yakasının vapur, M4 metro ve otobüs merkezi.",
  "BEŞİKTAŞ": "Boğaz kıyısında vapur iskelesi ve büyük otobüs aktarma noktası olan ilçe.",
  "ÜSKÜDAR": "Marmaray ile M5 metronun buluştuğu, vapur iskelesi olan Anadolu yakası ilçesi.",
  "BOSTANCI": "Deniz otobüsü iskelesi ve Marmaray istasyonu olan Kadıköy semti.",
  "KARTAL": "M4 metro ve Marmaray hattının geçtiği Anadolu yakası ilçesi.",
  "PENDİK": "Marmaray, M4 metro ve yüksek hızlı trenin durduğu ilçe.",
  "TUZLA": "Tersaneleriyle bilinen, Marmaray hattı üzerindeki ilçe.",
  "GEBZE": "Marmaray hattının doğu ucu; Kocaeli'ye bağlı ilçe.",
  "TAKSİM": "M2 metro ile F1 füniküler hattının buluştuğu, İstiklal Caddesi'nin başındaki meydan.",
  "LEVENT": "M2 ile M6 metro hatlarının buluştuğu iş merkezi semti.",
  "ŞİŞLİ": "M2 metro hattı üzerindeki merkezi ilçe.",
  "MECİDİYEKÖY": "M2, M7 metro ve metrobüsün buluştuğu yoğun aktarma noktası.",
  "MASLAK": "Gökdelenleriyle bilinen, M2 metro hattına yakın iş merkezi.",
  "SARIYER": "Boğaz'ın Karadeniz'e açıldığı yerdeki, vapur iskelesi olan ilçe.",
  "BEYKOZ": "Boğaz'ın Anadolu yakasında, korularıyla bilinen ilçe.",
  "BEYOĞLU": "İstiklal Caddesi, Galata ve Taksim'i kapsayan ilçe.",
  "FATİH": "Tarihi yarımadayı kapsayan, T1 tramvay hattının geçtiği ilçe.",
  "ZEYTİNBURNU": "T1 tramvay, M1 metro ve metrobüsün buluştuğu aktarma merkezi.",
  "BAKIRKÖY": "Marmaray, M1 metro ve deniz otobüsü iskelesi olan sahil ilçesi.",
  "ŞİRİNEVLER": "Metrobüs ile M1 metronun buluştuğu Bahçelievler semti.",
  "YENİBOSNA": "Metrobüs ve M1 metro hattının geçtiği semt.",
  "SEFAKÖY": "Küçükçekmece'de metrobüs hattı üzerindeki semt.",
  "AVCILAR": "İstanbul Üniversitesi kampüsüyle bilinen, metrobüs hattı üzerindeki ilçe.",
  "BEYLİKDÜZÜ": "Metrobüs hattının batı ucundaki ilçe.",
  "ESENYURT": "Avrupa yakasının batısındaki kalabalık ilçe.",
  "BÜYÜKÇEKMECE": "Aynı adlı gölü ve tarihi köprüsüyle bilinen batı ilçesi.",
  "SİLİVRİ": "Marmara kıyısında, İstanbul'un en batıdaki ilçelerinden biri.",
  "ÇATALCA": "İstanbul'un batısındaki geniş, kırsal ilçe.",
  "LALELİ": "Otelleri ve tekstil dükkanlarıyla bilinen, T1 tramvay durağı olan semt.",
  "BEYAZIT": "İstanbul Üniversitesi ve Kapalıçarşı'ya yakın T1 tramvay durağı.",
  "SİRKECİ": "Tarihi garı ve Marmaray istasyonuyla bilinen semt; Orient Express'in son durağıydı.",
  "GÜLHANE": "Gülhane Parkı'nın girişindeki T1 tramvay durağı.",
  "SULTANAHMET": "Ayasofya ve Sultanahmet Camii'nin bulunduğu meydan ve T1 durağı.",
  "ÇEMBERLİTAŞ": "Adını Roma döneminden kalma sütundan alan T1 tramvay durağı.",
  "KABATAŞ": "T1 tramvayın son durağı; vapur iskelesi ve F1 füniküler buradan kalkar.",
  "FINDIKLI": "Kabataş ile Tophane arasındaki T1 tramvay durağı.",
  "TOPHANE": "Adını tarihi top dökümhanesinden alan, Karaköy ile Fındıklı arasındaki T1 durağı."
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
  "BROOKLYN": "A New York borough across the East River from Manhattan.",
  "MANHATTAN": "New York's central island borough, crossed by many subway lines.",
  "QUEENS": "New York's largest borough by area, home to two airports.",
  "BRONX": "New York's northernmost borough, home to Yankee Stadium.",
  "STATEN": "Staten Island, reached from Manhattan by the free Staten Island Ferry.",
  "HARLEM": "A neighbourhood in northern Manhattan.",
  "CHELSEA": "A neighbourhood found in both Manhattan and west London.",
  "SOHO": "A district name used in both London and New York.",
  "TRIBECA": "A Lower Manhattan neighbourhood; the name means Triangle Below Canal.",
  "GREENWICH": "Greenwich Village in Manhattan; also Greenwich in London.",
  "TIMES": "Times Square, a major Manhattan subway hub.",
  "SQUARE": "An open public place, like Times Square or Leicester Square.",
  "PENN": "Penn Station, New York's busiest railway station.",
  "GRAND": "Grand Central Terminal, the famous station in Manhattan.",
  "CENTRAL": "Grand Central in New York; also London's Central line.",
  "MADISON": "Madison Avenue and Madison Square in Manhattan.",
  "LEXINGTON": "Lexington Avenue, served by a busy Manhattan subway line.",
  "BROADWAY": "A long Manhattan avenue famous for its theatres.",
  "WALL": "Wall Street, New York's financial district.",
  "STREET": "A public road in a city.",
  "WATERLOO": "London's busiest railway station.",
  "VICTORIA": "A London railway station and Underground line.",
  "PADDINGTON": "A London station where the Heathrow Express departs.",
  "EUSTON": "A London railway station for trains to the north-west.",
  "KINGS": "King's Cross, a major London railway station.",
  "CROSS": "King's Cross or Charing Cross, both London stations.",
  "PANCRAS": "St Pancras, London's terminal for Eurostar trains.",
  "LIVERPOOL": "Liverpool Street, a busy London station.",
  "LONDON": "The UK capital, home to the world's oldest underground railway.",
  "BRIDGE": "A structure that carries a road or railway over water or a valley.",
  "BAKER": "Baker Street, one of the first London Underground stations.",
  "BOND": "Bond Street, a London shopping street and Tube station.",
  "OXFORD": "Oxford Circus, a busy London Tube interchange.",
  "PICCADILLY": "Piccadilly Circus and the Piccadilly line in London.",
  "CIRCUS": "A round junction of streets, like Oxford Circus or Piccadilly Circus.",
  "CHARING": "Charing Cross, a London station near Trafalgar Square.",
  "LEICESTER": "Leicester Square, a London Tube station in the theatre district.",
  "COVENT": "Covent Garden, a London market area and Tube station.",
  "GARDEN": "Covent Garden in London; also Madison Square Garden in New York.",
  "HOLBORN": "A central London Tube interchange."
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

// Sözlük genişletmesi (src/data/transitTerms.js). Mevcut anlam ve işletmeciler önceliklidir.
// Yanlış yazılmış (İ yerine I) eski kayıtlar çıkarılır; doğru yazımları COMMON_WORDS_TR'de.
const MISSPELLED_TR = ["KEDI", "VADI", "YEDI", "LIMAN", "NADIR", "NEHIR", "RITIM", "TATIL", "TRAFIK",
  "TERAZI", "KENTLI", "MARKIZ", "ZENCIR", "ÇELIK", "VALI", "MEYVA"];
MISSPELLED_TR.forEach(w => VALID_WORDS_TR.delete(w));
const mergeTerms = (validWords, meanings, providers, newMeanings, newProviders, commonWords) => {
  [...Object.keys(newMeanings), ...commonWords].forEach(w => validWords.add(w));
  Object.entries(newMeanings).forEach(([w, m]) => { if (!meanings[w]) meanings[w] = m; });
  Object.entries(newProviders).forEach(([w, p]) => { if (!providers[w]) providers[w] = p; });
};
mergeTerms(VALID_WORDS_TR, WORD_MEANINGS_TR, PROVIDER_MAP_TR, TRANSIT_MEANINGS_TR, TRANSIT_PROVIDERS_TR, COMMON_WORDS_TR);
mergeTerms(VALID_WORDS_EN, WORD_MEANINGS_EN, PROVIDER_MAP_EN, TRANSIT_MEANINGS_EN, TRANSIT_PROVIDERS_EN, COMMON_WORDS_EN);
// Gündelik kökler (sağlayıcı "Genel"): hattın ulaşım terimleri tükenince tekrarı azaltır
mergeTerms(VALID_WORDS_TR, WORD_MEANINGS_TR, PROVIDER_MAP_TR,
  Object.fromEntries(EVERYDAY_ROOTS_TR), Object.fromEntries(EVERYDAY_ROOTS_TR.map(([w]) => [w, 'Genel'])), EXTRA_WORDS_TR);

// Izgarada sorulmayan nadir kelimeler: sözlükte geçerli kalır (oyuncu bulursa kasaya girer)
// ama bulmacanın zorunlu kelimesi olarak oyuncuyu şaşırtır (1. seviyede "AKT" gibi).
const RARE_WORDS_TR = new Set([
  "AKT", "AST", "FER", "SER", "ELİ", "MEY", "NAM", "KEM", "KÜR", "MİT", "NİL", "BET", "KAMA", "SAKA",
  "VALI", "İTİ", "YAL", "TAL", "DOR", "MAR", "TOS", "ALP", "LAL", "TOR", "ROT", "KAY", "RAJ", "ERK",
  "AHİ", "İLÇ", "GÂR", "RUZ", "KÜV", "DÜK", "ÖPÜK", "MEZ", "ORG", "ÜZE", "TAY", "AKSU",
  "MİR", "SOMA", "HOP", "DEL"
]);
const RARE_WORDS_EN = new Set(["HEW", "IRE", "RUE", "ION", "RIG", "ORB", "COD", "TOR"]);

// Kök havuzu: yalnızca anlamı yazılmış ulaşım/İstanbul terimleri ("Terim" ipucu her kökte çalışsın)
// ve en az bir yaygın alt kelime üretebilenler.
const buildTechPool = (meanings, validWords, rareWords, providerMap, defaultProvider) =>
  Object.keys(meanings)
    .filter(root => validWords.has(root) && root.length >= 4)
    // Ulaşım terimi için 1 alt kelime yeter; gündelik ("Genel") köklerden en az 4 isteriz ki ızgara dolsun
    .filter(root => [...validWords].filter(w => w !== root && w.length >= 3 && w.length < root.length && !rareWords.has(w) && canFormNormalizedWord(w, root)).length >= (providerMap[root] === 'Genel' ? 4 : 1))
    .map(root => ({ root, provider: providerMap[root] || defaultProvider, category: "Genel" }));

const TECH_TR = buildTechPool(WORD_MEANINGS_TR, VALID_WORDS_TR, RARE_WORDS_TR, PROVIDER_MAP_TR, "Metro Istanbul");
const TECH_EN = buildTechPool(WORD_MEANINGS_EN, VALID_WORDS_EN, RARE_WORDS_EN, PROVIDER_MAP_EN, "Metro");

const FORMABLE_TR = new Map();
const FORMABLE_EN = new Map();

const getDifficulty = (levelIndex) => {
  if (levelIndex < 10) return { targetWords: 2, minRoot: 3, maxRoot: 5, label: "baslangic" };
  if (levelIndex < 50) return { targetWords: 3, minRoot: 4, maxRoot: 7, label: "kolay" };
  if (levelIndex < 150) return { targetWords: 4, minRoot: 5, maxRoot: 8, label: "orta" };
  if (levelIndex < 400) return { targetWords: 5, minRoot: 6, maxRoot: 8, label: "orta-plus" };
  if (levelIndex < 1000) return { targetWords: 6, minRoot: 6, maxRoot: 8, label: "zor" }; // Max 8 harf (UI taşmasını önlemek için)
  if (levelIndex < 2500) return { targetWords: 6, minRoot: 7, maxRoot: 8, label: "uzman" };
  if (levelIndex < 5000) return { targetWords: 7, minRoot: 7, maxRoot: 8, label: "usta" };
  return { targetWords: 7, minRoot: 7, maxRoot: 8, label: "efsane" };
};

const getCandidateWords = (root, validWords, levelIndex, rand, formableCache, rareWords = new Set()) => {
  const rootLen = root.length;
  const minLen = levelIndex < 150 ? 3 : 4;
  const baseCandidates = formableCache.get(root) || [...validWords].filter((word) => word !== root && word.length < rootLen && canFormNormalizedWord(word, root));
  const candidates = baseCandidates.filter((word) => word.length >= minLen && !rareWords.has(word));

  // Soft sort using sigmoid
  const pLongFirst = 1 / (1 + Math.exp(-(levelIndex - 400) / 100));
  
  return shuffleWith(candidates, rand).sort((a, b) => {
    const longFirst = rand() < pLongFirst;
    const lengthBias = longFirst ? b.length - a.length : a.length - b.length;
    return lengthBias || a.localeCompare(b);
  });
};

// Bulmaca ızgarası (Words of Wonders mantığı): tek açgözlü yerleşim yerine aynı seed ile
// birçok aday yerleşim denenir ve en "dolu ama derli toplu" olanı seçilir. Her kelime için
// tüm geçerli konumlar toplanır; en çok kesişen ve kutuyu en az büyüten konum alınır.
// Telefon dikey ekranına sığsın diye ızgara MAX_COLS x MAX_ROWS ile sınırlıdır.
const MAX_COLS = 8;
const MAX_ROWS = 8;
const LAYOUT_ATTEMPTS = 36;

const buildLayout = (root, order, targetWords) => {
  const selectedWords = [];
  const gridLetters = new Map();
  let minX = 0, maxX = root.length - 1, minY = 0, maxY = 0, crossings = 0;

  const placeWord = (word, startX, startY, isHorizontal) => {
    selectedWords.push({ word, startX, startY, isHorizontal });
    for (let i = 0; i < word.length; i++) {
      const x = startX + (isHorizontal ? i : 0);
      const y = startY + (isHorizontal ? 0 : i);
      gridLetters.set(`${x},${y}`, word[i]);
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  };

  // Geçerliyse kesişim sayısını, değilse -1 döner
  const crossCount = (word, startX, startY, isHorizontal) => {
    const beforeKey = isHorizontal ? `${startX - 1},${startY}` : `${startX},${startY - 1}`;
    const afterKey = isHorizontal ? `${startX + word.length},${startY}` : `${startX},${startY + word.length}`;
    if (gridLetters.has(beforeKey) || gridLetters.has(afterKey)) return -1;
    let hits = 0;
    for (let i = 0; i < word.length; i++) {
      const x = startX + (isHorizontal ? i : 0);
      const y = startY + (isHorizontal ? 0 : i);
      const key = `${x},${y}`;
      if (gridLetters.has(key)) {
        if (gridLetters.get(key) !== word[i]) return -1;
        hits++;
        continue;
      }
      const sideA = isHorizontal ? `${x},${y - 1}` : `${x - 1},${y}`;
      const sideB = isHorizontal ? `${x},${y + 1}` : `${x + 1},${y}`;
      if (gridLetters.has(sideA) || gridLetters.has(sideB)) return -1;
    }
    // Kelimenin tamamı zaten ızgarada olamaz (başka kelimenin içinde gizli kalır)
    return hits === word.length ? -1 : hits;
  };

  placeWord(root, 0, 0, true);

  for (const word of order) {
    if (selectedWords.length >= targetWords) break;
    let best = null;
    for (const target of selectedWords) {
      const isHorizontal = !target.isHorizontal;
      for (let i = 0; i < word.length; i++) {
        let t = target.word.indexOf(word[i]);
        while (t !== -1) {
          const startX = target.startX + (target.isHorizontal ? t : 0) - (isHorizontal ? i : 0);
          const startY = target.startY + (target.isHorizontal ? 0 : t) - (isHorizontal ? 0 : i);
          const hits = crossCount(word, startX, startY, isHorizontal);
          if (hits > 0) {
            const endX = startX + (isHorizontal ? word.length - 1 : 0);
            const endY = startY + (isHorizontal ? 0 : word.length - 1);
            const cols = Math.max(maxX, endX) - Math.min(minX, startX) + 1;
            const rows = Math.max(maxY, endY) - Math.min(minY, startY) + 1;
            if (cols <= MAX_COLS && rows <= MAX_ROWS) {
              const score = hits * 10 - cols * rows * 0.4 - Math.abs(cols - rows) * 0.6;
              if (!best || score > best.score) best = { startX, startY, isHorizontal, hits, score };
            }
          }
          t = target.word.indexOf(word[i], t + 1);
        }
      }
    }
    if (best) {
      placeWord(word, best.startX, best.startY, best.isHorizontal);
      crossings += best.hits;
    }
  }

  const cols = maxX - minX + 1, rows = maxY - minY + 1;
  const score = selectedWords.length * 100 + crossings * 8 - cols * rows * 0.5 - Math.abs(cols - rows) * 2;
  return { words: selectedWords, score };
};

const placePuzzleWords = (root, candidates, targetWords, rand = Math.random) => {
  let best = buildLayout(root, candidates, targetWords);
  for (let attempt = 1; attempt < LAYOUT_ATTEMPTS; attempt++) {
    // Uzunluk tercihini koruyarak sırayı karıştır: aday listesinin başı her denemede biraz değişir
    const order = candidates
      .map((word, idx) => ({ word, key: idx + rand() * candidates.length * 0.6 }))
      .sort((p, q) => p.key - q.key)
      .map(p => p.word);
    const layout = buildLayout(root, order, targetWords);
    if (layout.score > best.score) best = layout;
  }
  return best.words;
};

const getPools = (language) => {
  if (language === "en") {
    return { techTerms: TECH_EN, validWords: VALID_WORDS_EN, formableCache: FORMABLE_EN, rareWords: RARE_WORDS_EN };
  }
  return { techTerms: TECH_TR, validWords: VALID_WORDS_TR, formableCache: FORMABLE_TR, rareWords: RARE_WORDS_TR };
};

// Her kökün WORD_MEANINGS'te anlamı olmalı ve RARE_WORDS dışında en az bir alt kelime üretebilmeli;
// aksi halde generateLevel TRAMVAY fallback'ine düşer (eski RAY/HAT/YOL 1. seviyeyi 7 harfli yapıyordu).
// Değiştirirken: seviye doğrulama scriptiyle her kökün kelime sayısını kontrol et.
const ONBOARDING_TR = [
  "KART", "TREN", "VAPUR", "VAGON", "DURAK", // 1-5: 4-5 harf, 1 alt kelime
  "MOTOR", "METRO", "BİLET", "TÜNEL", "TRAFO", // 6-10
  "SİSTEM", "RULMAN", "BALAST", "KONTAK", "ULAŞIM", // 11-15: 6 harf, 2 alt kelime
  "SENSÖR", "İSKELE", "SİNYAL", "DİNGİL", "OTOBÜS", // 16-20
  "TURNİKE", "KATENER", "TRAMVAY", "KÜPEŞTE", "TRAVERS", // 21-25: 7 harf
  "AKTARMA", "TERSANE", "KARAKÖY", "TOPHANE", "İSTASYON" // 26-30
];

const ONBOARDING_EN = [
  "TRAM", "RAIL", "TUBE", "TRAIN", "TRACK", // 1-5
  "BRAKE", "CABIN", "BAKER", "TIMES", "FERRY", // 6-10
  "SIGNAL", "TUNNEL", "PISTON", "HARBOR", "SWITCH", // 11-15
  "ENGINE", "TICKET", "EUSTON", "GARDEN", "STATEN", // 16-20
  "STATION", "TRANSIT", "CENTRAL", "CHARING", "PLATFORM", // 21-25
  "TERMINAL", "COMMUTER", "CARRIAGE", "WATERLOO", "VICTORIA" // 26-30
];

// Son 100 seviyede kullanılan kökleri takip eder (tekrarı önler)
// Sıralı kök geçmişi (en yeni sonda); en fazla 100 kayıt
const usedRootsHistory = [];

const chooseTechnicalRoot = (levelIndex, language) => {
  // 1-30 Seviyeleri için özel onboarding akışı
  if (levelIndex < 30) {
    const rootName = language === "en" ? ONBOARDING_EN[levelIndex] : ONBOARDING_TR[levelIndex];
    const provider = language === "en" ? (PROVIDER_MAP_EN[rootName] || "Metro") : (PROVIDER_MAP_TR[rootName] || "Metro Istanbul");
    return { root: rootName, provider, category: "Genel" };
  }

  const { techTerms, validWords, formableCache, rareWords } = getPools(language);
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
  // Hatta göre içerik: vapur hattında denizcilik, metrobüste karayolu, raylılarda raylı sistem terimleri
  const modeMeta = MODE_META[getStationForLevel(levelIndex).mode];
  const desiredProvider = language === "en" ? modeMeta.termProviderEn : modeMeta.termProvider;

  const minLen = levelIndex < 150 ? 3 : 4;

  // Önce bu hattın terimleri denenir; taze terimi kalmadıysa diğer terimlere geçilir
  const orderedPool = [
    ...shuffledPool.filter(t => t.provider === desiredProvider),
    ...shuffledPool.filter(t => t.provider !== desiredProvider),
  ];

  // Hattın kendi terimleri önce denenir. Tekrar yasağı havuz büyüklüğüne göre: terimi az olan
  // hatlarda (vapur, metrobüs) aynı kök birkaç seviye sonra dönebilir ama art arda gelmez; o hatta
  // taze terim kalmazsa diğer terimlere geçilir. Diğer terimler son 250 kök boyunca tekrar etmez.
  const onThemeCount = orderedPool.filter(t => t.provider === desiredProvider).length;
  const onThemeWindow = Math.max(3, Math.floor(onThemeCount * 0.85));
  const pickFresh = (onThemeBlock, otherBlock) => {
    const recentOnTheme = new Set(usedRootsHistory.slice(-onThemeBlock));
    const recentOther = new Set(usedRootsHistory.slice(-otherBlock));
    let pick = null;
    let bestScore = -1;
    for (const term of orderedPool) {
      const blocked = term.provider === desiredProvider ? recentOnTheme.has(term.root) : recentOther.has(term.root);
      if (blocked) continue;
      const count = (formableCache.get(term.root) || [...validWords].filter(w => canFormNormalizedWord(w, term.root)))
        .filter(w => w.length >= minLen && w !== term.root && !rareWords.has(w)).length;
      if (count < 1) continue;
      const providerBonus = term.provider === desiredProvider ? 3 : 0;
      const score = Math.min(count, difficulty.targetWords + 2) * 10 + term.root.length + providerBonus;
      if (score > bestScore) { pick = term; bestScore = score; }
      if (count >= difficulty.targetWords) break;
    }
    return pick;
  };

  // Bu banttaki kökler tükendiyse yasak pencereleri daraltılır (eskiden 2. geçiş hep aynı kökü seçiyordu)
  let best = pickFresh(onThemeWindow, 250) || pickFresh(3, 15) || pickFresh(1, 1);

  // Güvenlik amaçlı fallback
  if (!best) {
    best = { root: language === "en" ? "TRAIN" : "TRAMVAY", provider: language === "en" ? "Metro" : "Metro Istanbul", category: "Genel" };
  }

  usedRootsHistory.push(best.root);
  if (usedRootsHistory.length > 300) usedRootsHistory.shift();

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
  
  const { validWords, formableCache, rareWords } = getPools(language);
  const baseDifficulty = getDifficulty(safeLevel);
  const difficulty = applyDDA(baseDifficulty, performanceScore, volatility);
  
  let term = chooseTechnicalRoot(safeLevel, language);
  // Pass DDA adjusted minRoot/maxRoot if necessary, but chooseTechnicalRoot is static right now.
  let candidates = getCandidateWords(term.root, validWords, safeLevel, rand, formableCache, rareWords);
  
  // Eğer hiç candidate yoksa (örn: "YOL" gibi çok kısa bir kelime geldiyse),
  // sonsuz döngüden kaçınmak veya bulmacanın boş kalmasını engellemek için
  // yeni bir kelime seç.
  if (candidates.length === 0) {
    term = { root: language === 'en' ? 'TRAIN' : 'TRAMVAY', provider: language === 'en' ? 'Metro' : 'Metro Istanbul', category: 'General' };
    candidates = getCandidateWords(term.root, validWords, safeLevel, rand, formableCache, rareWords);
  }

  const words = placePuzzleWords(term.root, candidates, difficulty.targetWords, rand);
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

// Düello bulmacası: yalnızca seed'e bağlı (oyuncunun geçmişine değil), böylece bağlantıyı açan
// arkadaş birebir aynı ızgarayı ve çarkı görür. 6-7 harfli kökler, en fazla 6 kelime.
export const generateDuelLevel = (seed, language = "tr") => {
  const { techTerms, validWords, formableCache, rareWords } = getPools(language);
  const rand = seededRandom((Math.abs(seed | 0) % 2147483646) + 1);
  const pool = techTerms.filter(t => t.root.length >= 6 && t.root.length <= 7);
  const usable = pool.length ? pool : techTerms;
  // Seed sırasıyla kökleri dene; en az 5 alt kelime çıkaran ilk kök seçilir (dolu bir ızgara için)
  const start = Math.floor(rand() * usable.length);
  let term = usable[start];
  let candidates = [];
  for (let k = 0; k < usable.length; k++) {
    const t = usable[(start + k * 7) % usable.length];
    const c = getCandidateWords(t.root, validWords, 100, rand, formableCache, rareWords);
    if (c.length >= 5) { term = t; candidates = c; break; }
  }
  if (candidates.length === 0) {
    term = { root: language === 'en' ? 'TRAIN' : 'TRAMVAY', provider: 'Metro', category: 'General' };
    candidates = getCandidateWords(term.root, validWords, 100, rand, formableCache, rareWords);
  }
  const words = placePuzzleWords(term.root, candidates, 6, rand);
  return {
    words,
    wheelLetters: shuffleWith(term.root.split(""), rand),
    technicalTerm: term.root,
    validWordsSet: validWords,
  };
};
