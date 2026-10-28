# Google Play mağaza sayfası (Türkçe)

Play Console → Mağazada görünüm → Ana mağaza girişi alanlarına kopyalanacak metinler.
Ekran görüntüleri ve 512 px simge `release/store/` ve `release/play-icon-512.png` altında üretilir
(git'e eklenmez; yeniden üretmek için oturum notlarındaki puppeteer betiği kullanılır).

> Marka notu: "İstanbulkart", "Metro İstanbul" ve "Şehir Hatları" tescilli marka olabilir. Mağaza
> metinlerinde bu adlar kullanılmadı. Oyun içi kart adı yayından önce değiştirilecekse (ör. "Turnike
> Kart") ekran görüntüleri de yeniden alınmalı.

## Uygulama adı (en fazla 30 karakter)

Turnike: Kelime Oyunu

## Kısa açıklama (en fazla 80 karakter)

İstanbul'u durak durak gez, harfleri birleştir, kelime bulmacalarını çöz!

## Uzun açıklama (en fazla 4000 karakter)

İstanbul'da bir yolculuğa çık! Turnike, metro, Marmaray, tramvay, vapur ve teleferik hatlarında durak durak ilerlediğin bir kelime bulmaca oyunu. Çarktaki harfleri parmağınla birleştir, çapraz bulmacadaki kelimeleri bul, bir sonraki durağa geç.

🚇 23 HAT, 350'DEN FAZLA DURAK
Yenikapı'dan Hacıosman'a, Halkalı'dan Gebze'ye, Kabataş'tan Adalar'a… Her durak 5 bölümden oluşur. Şafaktan geceye değişen İstanbul manzaraları, Boğaz köprüsü, Galata, Kız Kulesi ve martılar yolculuğa eşlik eder.

🧩 KOLAY BAŞLAR, GİDEREK ZORLAŞIR
İlk bölümler rahat; harf sayısı arttıkça bulmacalar dolar. Takıldığında harf, kelime, terim ya da istediğin kutuyu açan "Nokta" ipuçları yardımına koşar. Izgarada olmayan kelimeler de boşa gitmez: kelime kavanozunu doldur, ödülünü al.

📅 GÜNÜN SEFERİ
Her gün herkes aynı bulmacayı çözer. Süreni gör, sonucunu cevabı ele vermeden arkadaşlarınla paylaş, serini sürdür.

⚔️ ARKADAŞINA MEYDAN OKU
Aynı bulmacayı 120 saniyede kim daha iyi çözecek? Bağlantıyı WhatsApp'tan gönder ya da "Hemen oyna" ile beklemeden başka bir oyuncunun turuna karşı yarış.

🏆 HAFTALIK HAT LİGİ
Tramvay Ligi'nden Boğaz Ligi'ne yüksel. Her hafta 30 kişilik grubunda ilk beşe gir, bir üst lige çık.

🎁 GÖREVLER, ETKİNLİKLER, HAT PASOSU
Günlük görevler, hafta sonu etkinlikleri ve aylık Hat Pasosu ile ödüller kazan; yolcu kartını desenlerle kişiselleştir, tamamladığın her duraktan bir kartpostal topla.

♿ HERKES İÇİN
Büyük harf modu, yüksek kontrast seçeneği ve durak anonsu ayarlardan açılıp kapatılabilir.

Turnike ücretsizdir; isteğe bağlı ödüllü reklamlar içerir. İnternet olmadan da oynanabilir (düello ve lig için bağlantı gerekir).

## Kategori ve etiketler

- Kategori: Oyun → Kelime
- Etiketler: Kelime, Bulmaca, Çapraz bulmaca, Tek oyunculu, Rekabetçi çok oyunculu

## Anahtar kelimeler (açıklamada doğal geçenler)

kelime oyunu, kelime bulmaca, kelime bulma, çapraz bulmaca, harf birleştirme, İstanbul, metro, düello

## Ekran görüntüsü sırası ve üst yazıları

| Dosya | Önerilen üst yazı |
|---|---|
| 1-ana-ekran.png | İstanbul'u durak durak gez |
| 2-oyun.png | Harfleri birleştir, kelimeleri bul |
| 3-gunun-seferi.png | Her gün yeni bir bulmaca, sonucunu paylaş |
| 4-duello.png | Arkadaşına meydan oku |
| 5-hat-ligi.png | Haftalık ligde zirveye yüksel |
| 6-harita.png | 23 hat, 350'den fazla durak |
| 7-istanbulkart.png | Kartını kişiselleştir, ödüller topla |

## Yayın öncesi kontrol listesi

- [ ] AdMob: gerçek uygulama ve reklam birimi kimlikleri (`src/utils/adService.js`, `AndroidManifest.xml`), `IS_TESTING = false`
- [ ] Gizlilik politikası sayfası (reklam kimliği, anonim analitik, Supabase anonim oturum) ve Play Console "Veri güvenliği" formu
- [ ] İmzalı sürüm (release) AAB: yükleme anahtarı oluştur, `versionCode`/`versionName` artır
- [ ] İçerik derecelendirme anketi, hedef kitle (13+ önerilir: düello bağlantıları ve reklam)
- [ ] Marka adları kararı (kart adı, hat adlarının yalnızca bilgi amaçlı kullanımı)
