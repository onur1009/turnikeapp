// Gündelik Türkçe sözlük genişletmesi.
// EVERYDAY_ROOTS_TR: bulmaca kökü olabilecek yaygın kelimeler ve kısa anlamları ("Terim" ipucu
// ve bilgi kartı bunları gösterir). Ulaşım terimleri her zaman önce gelir; bu kökler hattın
// terim havuzu tükendiğinde tekrarı azaltmak için kullanılır (sağlayıcı: "Genel").
// EXTRA_WORDS_TR: yalnızca geçerlilik için (alt kelimeler ve ekstra kelime kavanozu).
// Kurallar: büyük harf, Türkçe İ/I ayrımı doğru; özel isim, argo ve kaba kelime yok.
// Değiştirince: kök kalite scripti her kökün en az 4 yaygın alt kelime ürettiğini kontrol eder.

export const EVERYDAY_ROOTS_TR = [
  ['KARTAL', 'Gücü ve keskin gözüyle bilinen büyük yırtıcı kuş.'],
  ['KALEM', 'Yazı yazmaya ya da çizmeye yarayan araç.'],
  ['ARSLAN', 'Kedigillerden, yelesiyle tanınan büyük yırtıcı hayvan.'],
  ['MASALCI', 'Masal anlatan kimse.'],
  ['TARLA', 'Ekin ekilen, sürülen toprak parçası.'],
  ['SANDAL', 'Kürekle yürütülen küçük kayık.'],
  ['KAPTAN', 'Gemiyi yöneten kişi.'],
  ['LİMONATA', 'Limon suyu, su ve şekerle yapılan içecek.'],
  ['PORTAKAL', 'Turuncu renkli, sulu bir narenciye meyvesi.'],
  ['KARPUZ', 'Yazın yenen, içi kırmızı, iri ve sulu meyve.'],
  ['ELMAS', 'Çok sert ve parlak değerli taş.'],
  ['MERDİVEN', 'Basamaklarla aşağı yukarı inip çıkmaya yarayan yapı.'],
  ['PENCERE', 'Duvarda ışık ve hava almak için açılan çerçeveli boşluk.'],
  ['DOLAP', 'Eşya konan kapaklı mobilya.'],
  ['YASTIK', 'Yatarken başın altına konan yumuşak eşya.'],
  ['YORGAN', 'Yatarken üstü örtmeye yarayan kalın örtü.'],
  ['TABAK', 'Yemek konan yayvan kap.'],
  ['KAŞIK', 'Sıvı ya da yumuşak yiyecekleri ağza götürmeye yarayan araç.'],
  ['ÇATAL', 'Yemeği batırarak almaya yarayan dişli araç.'],
  ['TENCERE', 'Yemek pişirilen derin kap.'],
  ['SARIMSAK', 'Keskin kokulu, dişli bir sebze.'],
  ['MAYDANOZ', 'Yemeklere tat veren yeşil yapraklı bitki.'],
  ['DOMATES', 'Kırmızı, sulu bir sebze.'],
  ['PATATES', 'Toprak altında yetişen yumrulu sebze.'],
  ['ISPANAK', 'Yaprakları yemek yapılan yeşil sebze.'],
  ['KAVUN', 'Yazın yenen, sarı içli, kokulu meyve.'],
  ['MANDALİNA', 'Kolay soyulan küçük turuncu meyve.'],
  ['SİMİT', 'Susamlı, halka biçiminde pişmiş hamur.'],
  ['POĞAÇA', 'Yumuşak, yuvarlak, içi peynirli olabilen hamur işi.'],
  ['BAKLAVA', 'İnce yufka, fıstık ve şerbetle yapılan tatlı.'],
  ['LOKUMCU', 'Lokum yapan ya da satan kimse.'],
  ['KAHVALTI', 'Sabahın ilk öğünü.'],
  ['SALATA', 'Çiğ sebzelerle yapılan soğuk yemek.'],
  ['MAKARNA', 'Hamurdan yapılan, haşlanarak yenen yemek.'],
  ['PEYNİR', 'Sütün mayalanmasıyla yapılan yiyecek.'],
  ['ZEYTİN', 'Kahvaltıda yenen, yağı çıkarılan küçük meyve.'],
  ['ÇAYDANLIK', 'Çay demlemeye yarayan kap.'],
  ['FINCAN', 'Kahve ya da çay içilen kulplu küçük kap.'],
  ['SOKAK', 'Evlerin arasında uzanan yol.'],
  ['MAHALLE', 'Bir kentin bölündüğü küçük yerleşim birimi.'],
  ['KOMŞU', 'Yakın oturan kimse.'],
  ['ÇARŞI', 'Dükkanların bulunduğu alışveriş yeri.'],
  ['PAZAR', 'Belli günlerde kurulan açık alışveriş yeri; haftanın son günü.'],
  ['BAKKAL', 'Gündelik ihtiyaçların satıldığı küçük dükkan.'],
  ['MANAV', 'Meyve ve sebze satan kimse ya da dükkan.'],
  ['KASAP', 'Et satan kimse.'],
  ['FIRINCI', 'Ekmek pişirip satan kimse.'],
  ['TERZİ', 'Elbise diken ya da onaran kimse.'],
  ['BERBER', 'Saç ve sakal tıraşı yapan kimse.'],
  ['DOKTOR', 'Hastaları muayene edip tedavi eden hekim.'],
  ['HEMŞİRE', 'Hastaların bakımını yapan sağlık çalışanı.'],
  ['ÖĞRETMEN', 'Öğrenciye bilgi öğreten kimse.'],
  ['ÖĞRENCİ', 'Okulda okuyan kimse.'],
  ['OKUL', 'Eğitim verilen kurum.'],
  ['DEFTER', 'Yazı yazmak için bir araya getirilmiş kağıtlar.'],
  ['KİTAPLIK', 'Kitap konan raf ya da dolap.'],
  ['SİLGİ', 'Kurşun kalem izini silmeye yarayan araç.'],
  ['CETVEL', 'Düz çizgi çizmeye ve ölçmeye yarayan araç.'],
  ['ANAHTAR', 'Kilidi açıp kapamaya yarayan araç.'],
  ['KAPICI', 'Apartmanın işlerine bakan görevli.'],
  ['BALKON', 'Binadan dışarı taşan, korkuluklu çıkıntı.'],
  ['MUTFAK', 'Yemek pişirilen oda.'],
  ['SALON', 'Evin en geniş oturma odası.'],
  ['HALI', 'Yere serilen dokuma örtü.'],
  ['PERDE', 'Pencereyi örten kumaş.'],
  ['SAKSI', 'İçinde çiçek yetiştirilen kap.'],
  ['LALE', 'İstanbul\'un simgesi sayılan, soğanlı süs çiçeği.'],
  ['MENEKŞE', 'Mor renkli, kokulu küçük çiçek.'],
  ['PAPATYA', 'Beyaz yapraklı, ortası sarı kır çiçeği.'],
  ['ÇINAR', 'Uzun ömürlü, geniş yapraklı büyük ağaç.'],
  ['KESTANE', 'Kabuğu dikenli, kızartılarak yenen meyve.'],
  ['MARTI', 'Deniz kıyısında yaşayan beyaz kuş.'],
  ['YUNUS', 'Denizde yaşayan, zeki memeli hayvan.'],
  ['PALAMUT', 'Boğaz\'da avlanan göçmen balık.'],
  ['LÜFER', 'İstanbul\'da sevilen, mavimsi bir balık.'],
  ['HAMSİ', 'Karadeniz\'de bol bulunan küçük balık.'],
  ['ÇUPRA', 'Etli, gümüş renkli bir deniz balığı.'],
  ['OLTA', 'Balık tutmaya yarayan ip ve iğne.'],
  ['DALGA', 'Suyun yüzeyinde oluşan kabarma.'],
  ['KUMSAL', 'Kumlu deniz kıyısı.'],
  ['SAHİL', 'Deniz kıyısı.'],
  ['LİMAN', 'Gemilerin barındığı, yük boşalttığı yer.'],
  ['DENİZCİ', 'Denizde çalışan kimse.'],
  ['YELKEN', 'Rüzgarı tutarak tekneyi yürüten bez.'],
  ['ÇAPA', 'Gemiyi olduğu yerde tutan demir.'],
  ['FENER', 'Işık veren araç; deniz feneri.'],
  ['KÖPRÜ', 'İki yakayı birleştiren geçit.'],
  ['KULE', 'Yüksek, dar yapı.'],
  ['SARAY', 'Hükümdarların oturduğu büyük yapı.'],
  ['KUBBE', 'Yarım küre biçiminde dam.'],
  ['MİNARE', 'Caminin ince, yüksek kulesi.'],
  ['ÇEŞME', 'Akan suyun alındığı yapı.'],
  ['MEYDAN', 'Kentte geniş, açık alan.'],
  ['PARK', 'Gezinti ve dinlenme alanı.'],
  ['BAHÇIVAN', 'Bahçe işlerine bakan kimse.'],
  ['TOPRAK', 'Bitkilerin yetiştiği yer kabuğu katmanı.'],
  ['YAĞMUR', 'Bulutlardan düşen su damlaları.'],
  ['ŞEMSİYE', 'Yağmurdan korunmaya yarayan açılır araç.'],
  ['RÜZGAR', 'Havanın yer değiştirmesi, yel.'],
  ['FIRTINA', 'Çok şiddetli rüzgar.'],
  ['GÖKKUŞAĞI', 'Yağmurdan sonra gökte görülen renkli yay.'],
  ['YILDIZ', 'Gece gökyüzünde parlayan gök cismi.'],
  ['GÜNEŞ', 'Dünyaya ışık ve ısı veren yıldız.'],
  ['AKŞAM', 'Günün güneş batımından sonraki bölümü.'],
  ['SABAH', 'Günün güneş doğduktan sonraki bölümü.'],
  ['TAKVİM', 'Günleri ve ayları gösteren çizelge.'],
  ['SAATÇİ', 'Saat yapan ya da onaran kimse.'],
  ['ZAMAN', 'Olayların art arda geçtiği süre.'],
  ['DAKİKA', 'Saatin altmışta biri.'],
  ['TATİL', 'İşe ya da okula ara verilen dinlenme zamanı.'],
  ['BAVUL', 'Yolculukta eşya taşınan büyük çanta.'],
  ['HARİTA', 'Bir yerin çizimle gösterilmiş planı.'],
  ['PUSULA', 'Yönü gösteren araç.'],
  ['YOLCU', 'Yolculuk eden kimse.'],
  ['SEYAHAT', 'Bir yerden başka bir yere gitme, yolculuk.'],
  ['ADRES', 'Bir yerin bulunduğu yeri belirten bilgi.'],
  ['MEKTUP', 'Birine yazılıp gönderilen yazı.'],
  ['POSTACI', 'Mektup ve paket dağıtan görevli.'],
  ['TELEFON', 'Uzaktaki biriyle konuşmaya yarayan araç.'],
  ['GAZETE', 'Günlük haberlerin basıldığı yayın.'],
  ['DERGİ', 'Belli aralıklarla çıkan yayın.'],
  ['ROMAN', 'Uzun, kurmaca düzyazı eseri.'],
  ['MASAL', 'Olağanüstü olayları anlatan kısa öykü.'],
  ['ŞARKI', 'Sözlü müzik parçası.'],
  ['DAVUL', 'Tokmakla çalınan büyük vurmalı çalgı.'],
  ['KEMAN', 'Yayla çalınan telli çalgı.'],
  ['TİYATRO', 'Oyunların sahnelendiği sanat ve yapı.'],
  ['SİNEMA', 'Film gösterilen salon; film sanatı.'],
  ['RESSAM', 'Resim yapan sanatçı.'],
  ['TABLO', 'Çerçevelenmiş resim.'],
  ['MÜZİK', 'Seslerin uyumuyla yapılan sanat.'],
  ['OYUNCU', 'Oyun oynayan ya da rol alan kimse.'],
  ['KALECİ', 'Kaleyi koruyan oyuncu.'],
  ['MAÇ', 'İki takım arasındaki karşılaşma.'],
  ['TAKIM', 'Birlikte oynayan ya da çalışan grup.'],
  ['ŞAMPİYON', 'Bir yarışmada birinci olan.'],
  ['BİSİKLET', 'Pedalla çevrilen iki tekerlekli araç.'],
  ['KAYKAY', 'Üzerine binilen tekerlekli tahta.'],
  ['YÜZÜCÜ', 'Yüzme sporu yapan kimse.'],
  ['MARANGOZ', 'Ahşap işleri yapan usta.'],
  ['ÇEKİÇ', 'Çivi çakmaya yarayan araç.'],
  ['MERDANE', 'Hamur açmaya yarayan silindir araç.'],
  ['TERAZİ', 'Ağırlık ölçmeye yarayan araç.'],
  ['SEPET', 'Örülerek yapılan taşıma kabı.'],
  ['KUTU', 'Eşya konan kapaklı kap.'],
  ['PAKET', 'Sarılıp bağlanmış eşya.'],
  ['HEDİYE', 'Birine verilen armağan.'],
  ['BAYRAM', 'Kutlanan önemli gün.'],
  ['DÜĞÜN', 'Evlenme töreni ve eğlencesi.'],
  ['ARKADAŞ', 'Birlikte vakit geçirilen, sevilen kimse.'],
  ['KARDEŞ', 'Aynı anne babadan olan kimse.'],
  ['TORUN', 'Çocuğun çocuğu.'],
  ['DEDE', 'Annenin ya da babanın babası.'],
  ['NİNE', 'Annenin ya da babanın annesi; büyükanne.'],
  ['KOMŞULUK', 'Komşu olma durumu ve ilişkisi.'],
  ['SEVGİ', 'Bir kimseye ya da şeye duyulan yakınlık.'],
  ['UMUT', 'Bir şeyin olacağına inanma.'],
  ['MERAK', 'Bir şeyi öğrenme isteği.'],
  ['CESARET', 'Korkmadan davranabilme gücü.'],
  ['SABIR', 'Zorluğa katlanabilme gücü.'],
  ['TEMİZLİK', 'Temiz olma durumu ya da temizleme işi.'],
  ['SAĞLIK', 'Hasta olmama durumu.'],
  ['KARAKOL', 'Polislerin görev yaptığı bina.'],
  ['İTFAİYE', 'Yangın söndürme örgütü.'],
  ['HASTANE', 'Hastaların tedavi edildiği yer.'],
  ['ECZANE', 'İlaç satılan yer.'],
  ['BANKA', 'Para işlerinin yapıldığı kurum.'],
  ['KUMBARA', 'Para biriktirilen kap.'],
  ['ALTIN', 'Değerli, sarı renkli maden.'],
  ['GÜMÜŞ', 'Değerli, beyaz parlak maden.'],
  ['KAZAN', 'Büyük pişirme ya da ısıtma kabı.'],
  ['ORMAN', 'Ağaçlarla kaplı geniş alan.'],
  ['TAVŞAN', 'Uzun kulaklı, hızlı koşan küçük hayvan.'],
  ['KAPLAN', 'Çizgili postlu büyük yırtıcı kedi.'],
  ['TİLKİ', 'Kurnazlığıyla bilinen kızıl tüylü hayvan.'],
  ['KİRPİ', 'Sırtı dikenli küçük hayvan.'],
  ['KARINCA', 'Çalışkanlığıyla bilinen küçük böcek.'],
  ['KELEBEK', 'Renkli kanatlı böcek.'],
  ['SERÇE', 'Kentlerde bol bulunan küçük kuş.'],
  ['GÜVERCİN', 'Meydanlarda görülen, yemlenen kuş.'],
  ['KAPLUMBAĞA', 'Sırtında sert kabuk taşıyan yavaş hayvan.'],
  ['ATLET', 'Koşu ve atlama sporları yapan sporcu.'],
  ['KAMERA', 'Görüntü kaydeden araç.'],
  ['EKRAN', 'Görüntünün belirdiği yüzey.'],
];

// Yaygın kelimeler (geçerlilik için). Çoğu 3-7 harf.
export const EXTRA_WORDS_TR = `
ACI ACIK AÇI AÇIK ADA ADAK ADAM ADET ADIM ADRES AFİŞ AĞA AĞAÇ AĞIL AĞIR AĞIZ AĞLA AHİR AİLE AKIL AKIM AKIN AKŞAM AKTAR ALAN ALARM ALAY
ALEV ALET ALIM ALIN ALKIŞ ALT ALTI ALTIN AMA AMAÇ ANA ANAÇ ANAHTAR ANI ANKA ANLAM ANNE ARA ARABA ARAÇ ARALIK ARI ARKA ARMA ARMUT ARPA
ARSA ARSLAN ARŞİV ASA ASIL ASKER ASLAN ASMA ASTAR AŞ AŞAĞI AŞI AŞÇI AŞK AT ATA ATAK ATEŞ ATICI ATLAS ATLET AVCI AVLU AY AYAK AYAR
AYI AYIP AYNA AYRAN AYVA AZ AZAR AZIK BABA BACA BACAK BADEM BAĞ BAĞIŞ BAHAR BAHÇE BAKAN BAKIR BAKKAL BAL BALIK BALKON BALON BAMYA
BANKA BANT BARAJ BARIŞ BASAMAK BASİT BASKI BAŞ BAŞAK BATI BAVUL BAYRAK BAYRAM BEBEK BEDEN BEKÇİ BEL BELGE BEN BENİZ BERABER BERBER
BEŞ BEYAZ BEYİN BEZ BİBER BİLET BİLGİ BİN BİNA BİR BİRAZ BİSİKLET BİZ BOĞA BOĞAZ BOL BOMBA BORÇ BORU BOŞ BOY BOYA BOYUN BOZ BUĞDAY
BULUT BURUN BUZ BÜYÜK CADDE CAM CAMİ CAN CANAVAR CEKET CEP CESARET CETVEL CEVAP CEVİZ CİLT CİSİM CÜMLE ÇABA ÇADIR ÇAĞ ÇAKIL ÇALI
ÇAM ÇAMUR ÇANAK ÇANTA ÇAPA ÇARE ÇARŞI ÇATAL ÇATI ÇAY ÇAYIR ÇEK ÇEKİÇ ÇELİK ÇENE ÇEŞME ÇEŞİT ÇETE ÇİFT ÇİÇEK ÇİĞ ÇİLEK ÇİM ÇINAR
ÇİVİ ÇİZGİ ÇOBAN ÇOCUK ÇOK ÇORAP ÇORBA ÇÖL ÇÖP ÇUKUR ÇUVAL DADI DAĞ DAİRE DAKİKA DAL DALGA DAM DAMAR DAMLA DANS DAR DARI DAVET
DAVUL DEDE DEFTER DEĞER DEMİR DENEME DENİZ DERE DERİ DERİN DERS DERT DESEN DEV DEVE DEVİR DİK DİKEN DİL DİLEK DİNÇ DİŞ DİZ DOĞA
DOĞU DOKTOR DOLAP DOLU DOMATES DONUK DORU DOST DOYUM DOZ DUA DUL DUMAN DURAK DUVAR DUYGU DÜĞME DÜĞÜN DÜNYA DÜŞ DÜZ ECZANE EDEP
EK EKİM EKİN EKMEK EKRAN EL ELA ELEK ELMA ELMAS EMEK EMİR EN ENGEL ER ERİK ERKEN ES ESEN ESER ESKİ ESNAF EŞ EŞİK EŞYA ET ETEK ETKİ
EV EVET EVRAK EZAN FARE FAYDA FENER FIRÇA FIRIN FIRINCI FIRTINA FİDAN FİKİR FİL FİLM FİNCAN FİYAT FOTO GAZ GAZETE GECE GELİN GEMİ
GENÇ GERİ GEZİ GİDER GİRİŞ GİYSİ GÖĞÜS GÖK GÖL GÖLGE GÖNÜL GÖZ GÜÇ GÜL GÜMÜŞ GÜN GÜNEŞ GÜVERCİN GÜZEL HALI HALK HALA HAMSİ HANE
HARİTA HASTA HASTANE HAVA HAVLU HAYAT HAYVAN HEDİYE HEMŞİRE HER HESAP HIZ HİKAYE HİS IRMAK ISI ISLAK IŞIK İÇ İLAÇ İLİK İLK İNCİ
İNEK İNSAN İP İPEK İPLİK İŞ İŞÇİ İZ KABAK KABLO KABUK KADIN KAFA KAFES KAĞIT KAHVE KAKAO KALE KALECİ KALEM KALP KAMERA KAMP KANAT
KANEPE KAPI KAPICI KAPLAN KAR KARA KARINCA KARPUZ KARTAL KASA KASAP KAŞ KAŞIK KAT KATIK KAVAK KAVUN KAYA KAYIK KAYKAY KAZ KAZAK KAZAN
KEDİ KEK KEL KELEBEK KEMAN KENT KEPÇE KESE KESTANE KILIÇ KIR KIRMIZI KIŞ KIYI KIZ KİLİT KİM KİRAZ KİRPİ KİTAP KÖK KÖPEK KÖPRÜ KÖŞE
KÖY KUBBE KUM KUMBARA KUMSAL KURT KUŞ KUTU KUYU KUZU KÜÇÜK KÜPE LALE LAMBA LEZZET LİMAN LİMON LOKUM LÜFER MAÇ MAKAS MAKARNA
MAL MANAV MANDALİNA MANTI MARANGOZ MARTI MASA MASAL MAVİ MAYDANOZ MEKTUP MELEK MENEKŞE MERAK MERDİVEN MESLEK METİN MEYDAN MEYVE
MİNARE MİSAFİR MUTFAK MUZ MÜZİK NANE NAR NEHİR NİNE NOHUT OCAK ODA ODUN OKUL OKYANUS OLTA ORMAN ORTA OTEL OYUN OYUNCU ÖDEV ÖĞRENCİ
ÖĞRETMEN ÖRDEK ÖRNEK ÖYKÜ PAKET PALAMUT PAMUK PANCAR PAPATYA PARA PARK PASTA PATATES PAZAR PEKMEZ PENCERE PERDE PEYNİR PİDE PİLAV
PİRİNÇ POĞAÇA PORTAKAL POSTACI PUSULA RADYO RAF RENK RESİM RESSAM ROMAN RÜYA RÜZGAR SAAT SABAH SABIR SABUN SAÇ SAĞLIK SAHİL SAKSI
SALATA SALON SANAT SANDAL SANDIK SARAY SARI SARIMSAK SAYI SEBZE SEPET SERÇE SES SEVGİ SEYAHAT SİMİT SİNEMA SİRKE SOBA SOFRA SOKAK
SOĞAN SOLUK SU SÜT SÜRÜ ŞAL ŞAPKA ŞARKI ŞEHİR ŞEKER ŞEMSİYE ŞİİR ŞİŞE TABAK TABLO TAHTA TAKIM TAKVİM TARAK TARLA TAŞ TATİL
TATLI TAVŞAN TAVUK TEKNE TELEFON TEMİZ TENCERE TEPE TERAZİ TERZİ TİLKİ TİYATRO TOP TOPRAK TORBA TORUN TOZ TUZ TÜY UÇAK UMUT USTA
UZAK UZUN ÜLKE ÜZÜM VAZO YAĞ YAĞMUR YAKA YAPRAK YARA YASTIK YAYLA YAZ YAZAR YEL YELKEN YEMEK YEŞİL YILDIZ YOL YOLCU YORGAN YUMURTA
YUNUS YURT YÜZ YÜZÜK ZAMAN ZEYTİN ZİL
ALA AMA ANT ARK ARZ ASA AYA BAK BAL BAR BAŞ BAT BEL BEN BEY BİL BİN BOR BOY BUL BUZ CAN DAL DAM DAR DEN DİK
DİL DİN DİŞ DİZ DOL DON DUL DUR DÜN GEL GEN GER GİT GÖL GÖR GÜL GÜN HAK HAL HAN HAS HAT HAZ İKİ İLE İMA
İRİ İSE İSİM KAL KAN KAP KAR KAS KAT KAZ KEL KES KIL KIR KIZ KİM KİR KOL KOR KOŞ KUL KUM KUR KUŞ KUT LAF MAL MAN MAT
MİL NAL NAR NOT OBA ODA OKU ORA ÖDE ÖLÇ ÖZ PAS PAY PİR RAF RAY SAL SAN SAP SAR SAZ SEL SEN SER SIK
SİL SOL SON SOR SOY SUN TAK TAN TAŞ TAT TAV TEK TEL TEN TER TOK TON TOP TUT TUZ UYU YAK YAN YAR YAS YAT YAY YAZ YEL YEN
YER YOK YOL YÜN YÜZ ZAR ZİL
ACEMİ ADALET AKRABA ALTIN ARAZİ ARTIK BAHAR BAKIM BİLGİ BOYUT CADDE CİHAZ DENGE DERECE DÜŞÜNCE EKİP ENERJİ GÖREV
GÜVEN HAREKET İLGİ KANAL KARAR KONU KURAL MERKEZ ÖDÜL PLAN SAHNE SEÇİM SINIF SONUÇ SORU TARİH YARIŞ YETENEK
ALAKA AKILLI ANLAT ARALIK ASİL ATAK ATLAR ATLAMA AYLAK BAKLA BALKAN BALTA BASMA BATAK DALAK DAMAT KABA KAFA KALA
KALAS KALAY KALIN KALKAN KAMA KAMIŞ KANAL KAPAK KARAR KARE KARGA KARI KARIN KARTAL KASA KASAP KATIR KAVAL KAYAK KAYMAK KAZMA LAKAP
MASA MASKE MATBAA MAVİ MAYA NAKİT NAMLU OTLAK PALA PARTAL PASAK RAKAM SAKAL SAKAT SALMA SAMAN SANAT SARAÇ SATIR TAKA
TAKAS TAKLA TALAN TAMAM TAPA TARAMA TASA TAVA TOKA YAKA YAKIN YAMA YAMAÇ YANAK YARAMAZ YASAK YATAK YATAY ZALİM
KALE KALEM LEKE ELEK EKMEK KEMER MERAK EMEK MELEK KELEK ETEK KETEN NEFES DERE TERE TEPE ENGEL GELENEK
`.trim().split(/\s+/);
