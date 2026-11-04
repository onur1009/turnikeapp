# Turnike Instagram planı (ilk 4 hafta)

Hesap: yeni, 0 takipçi. Amaç: oyuna trafik (tanıtım sitesi, sonra Google Play).
Kitle: 18–34, Türkiye, ağırlıkla İstanbul'da toplu taşıma kullananlar ve kelime oyunu sevenler.
Saat dilimi: Europe/Istanbul. Hesap ilk haftalarda kişisel değil marka sesiyle konuşur ("biz" değil, "Turnike" ya da doğrudan oyuncuya "sen").

## Ses (voice)

- Kısa, esprili, İstanbul'lu. Vapur sırası, aktarma, "son durak" dili. Emoji az: 🚇 ⛴️ 🚋 yeter.
- Asla: "En iyi kelime oyunu!", "Hemen indir!!!", ünlem yağmuru, İBB/Metro İstanbul logosu ya da resmi görünüm.
- Her gönderinin tek işi var: ya oynat (bulmaca), ya güldür (İstanbul ulaşım hâli), ya göster (oyun ekranı).
- Marka notu: "İstanbulkart" deme (tescilli); oyundaki kart "Turnike Kart". Hat adları gerçek (M2, Marmaray, T1) ama resmi kurum adı/logosu yok.

## Profil

- Kullanıcı adı: @turnikeoyun (yedek: @turnike.oyun, @sozcukseferi)
- Ad alanı (aramada çıkar): `Turnike · İstanbul Kelime Oyunu`
- Profil fotoğrafı: oyun simgesi (lacivert zemin, ortada beyaz T), kenarda boşluk; 320×320 görünür alan.
- Bio (150 karakter altı):
  ```
  İstanbul'u durak durak gez, kelimeleri bul 🚇
  Her gün yeni bulmaca: Günün Seferi
  Yakında Google Play ve App Store ⬇️
  ```
- Bağlantı: `https://turnikeapp.com.tr/?utm_source=instagram&utm_medium=bio`. Oyun yalnızca Google Play ve App Store'da; mağazalar açılınca site üzerinden yönlendir, bio bağlantısını değiştirme.
- Öne çıkanlar (kapaklar: hat rozeti biçiminde, renkli daire + kısa kod):
  1. `NASIL` (yeşil, M2) – 3 karede nasıl oynanır
  2. `GÜNÜN` (sarı) – günlük bulmaca hikâyeleri
  3. `DÜELLO` (kırmızı) – takipçi düelloları
  4. `HATLAR` (mavi, vapur) – hat hat tanıtım
  5. `SSS` (gri) – ücretsiz mi, internetsiz mi, kayıt var mı

## İlk 9 gönderi (grid, açılıştan önce hazır)

Grid düzeni 3×3, renk ritmi: lacivert / hat rengi / fotoğraf dönüşümlü, böylece profil ilk bakışta "metro tabelası" gibi görünür.
Paylaşım sırası tersten: 9 önce, 1 en son (1 en üstte kalır).

| # | Tür | İçerik | Biçim |
|---|---|---|---|
| 1 | Tanıtım | "İstanbul'u durak durak gez, kelimeleri bul." Durak tabelası + telefon ekranı | Tek görsel 4:5 |
| 2 | Bulmaca | "Bu harflerden kaç kelime çıkar? V A P U R" yorumda cevap | Tek görsel 4:5 |
| 3 | Reel | Harf çarkı yakın çekim, kelime ızgaraya oturuyor (ASMR, ses açık) | Reel 9:16 |
| 4 | Öğret | "Nasıl oynanır" 4 kare | Carousel 4:5 |
| 5 | Mizah | "Marmaray'da 40 dakika = 6 bölüm" | Tek görsel 4:5 |
| 6 | Reel | 23 hat haritası hızlı geçiş, "hangisinde oturuyorsun?" | Reel 9:16 |
| 7 | Bulmaca | "Günün Seferi #1" boş ızgara, ipucu: ulaşım | Tek görsel 4:5 |
| 8 | Kartpostal | Kız Kulesi kartpostalı, "Bu durağı bitirene hediye" | Tek görsel 4:5 |
| 9 | Duyuru | "Turnike yolda. İlk sefer yakında." | Tek görsel 4:5 |

Tasarım dosyası: `TurnikeApp/website/design/instagram.html` (1080×1350 kareler), PNG'ler `TurnikeApp/website/design/instagram/`.

## Haftalık ritim

| Gün | Ne | Saat |
|---|---|---|
| Pzt | sadece etkileşim (20 dk) | – |
| Sal | REEL | 18:30 (akşam dönüş yolu) |
| Çar | hikâyeler + etkileşim | – |
| Per | CAROUSEL ya da bulmaca görseli | 20:30 |
| Cum | REEL | 18:30 |
| Cmt | – | – |
| Paz | REEL | 20:00 |

Saat, ilk iki saniyeden çok daha az önemli. Kanca tutmuyorsa saat denemek boşa uğraş.
Hikâyeler her gün 3–5 kare: sabah 08:00 "Günün Seferi hazır" (anket: kaç kelime buldun?), akşam sonuç.

## 4 haftalık takvim

```
HAFTA 1  (açılış: 9 grid gönderisi hazır, hesap herkese açık)
PZT  etkileşim only
SAL  18:30  REEL      PROOF    #18 Cold Open Demo   – çark kaydırma, 3 sn'de ilk kelime, ızgara dolar
PER  20:30  CAROUSEL  TEACH    #11 Numbered         – "Turnike'de 4 ipucu, 4. si kimsenin kullanmadığı: Nokta"
CUM  18:30  REEL      OPINION  #22 Contrarian Flip  – "Telefonu yolda bırak derler. Biz yolda oynatıyoruz."
PAZ  20:00  REEL      STORY    #21 Mid-Sentence     – "...ve vapur iskeleye yanaşırken son kelimeyi buldum."

HAFTA 2
SAL  18:30  REEL      TEACH    #10 If This Then     – "Metroda sinyal yoksa: Turnike internetsiz çalışır"
PER  20:30  GÖRSEL    TEACH    bulmaca              – "M A R M A R A Y: kaç kelime?" (yorumda yarış)
CUM  18:30  REEL      PROOF    #6 The Receipt       – "Hacıosman'dan Yenikapı'ya tek seferde kaç bölüm bitti" (gerçek süre, gerçek sayı)
PAZ  20:00  CAROUSEL  OFFER    –                    – "Ücretsiz, kayıt yok: çıkınca 3 adımda başla" + bio bağlantısı (turnikeapp.com.tr)

HAFTA 3
SAL  18:30  REEL      OPINION  #2 Negative Command  – "Aktarmada sosyal medyada kaydırma. Harf kaydır."
PER  20:30  GÖRSEL    TEACH    bulmaca              – "Günün Seferi #N" ekran, sonuç paylaşma çağrısı
CUM  18:30  REEL      PROOF    #17 Head To Head     – "İki arkadaş, aynı bulmaca, 120 saniye" (Düello ekran kaydı)
PAZ  20:00  REEL      STORY    #25 Someone Else's   – ilk oyuncu yorumu/sonucu (izinle) – yoksa ekipten biri

HAFTA 4
SAL  18:30  REEL      TEACH    #14 The Callout      – "Vapurla işe gidenler: Adalar hattı seni bekliyor"
PER  20:30  CAROUSEL  TEACH    –                    – "İstanbul'un 23 hattı, oyundaki sırasıyla" (kaydırmalı harita)
CUM  18:30  REEL      PROOF    #23 The Statistic    – ilk 3 haftanın gerçek sayısı (oynanan bölüm, bulunan kelime) – sayı yoksa çekme
PAZ  20:00  CAROUSEL  OFFER    #19 The Deadline     – "Google Play'de ilk sefer: [tarih]" (yalnızca tarih kesinse)
```

## Reels senaryoları (çekim listesi)

Hepsi 9:16, 7–15 sn, ilk kare metinli (ses kapalı izleyen için), alt yazı kalın beyaz, kenarlardan 150 px güvenli alan.
Çekim: telefon ekran kaydı (oyun içi) + gerçek İstanbul görüntüsü (kendi çekimin; başkasının videosu yok).

1. **Çark ASMR** (#18) – 0–2 sn: parmak çarkta, "Bu sese bağımlı olacaksın" · 2–8 sn: 3 kelime art arda, ızgara dolar · 8–10 sn: "BÖLÜM TAMAM" + tren geçer · Son kare: "Bio'da, ücretsiz." Ses: oyunun kendi efektleri.
2. **Vapur seferi** (#21) – 0–2 sn: vapur camından Boğaz, üstte "...ve iskeleye 30 saniye kala" · 2–9 sn: elde telefon, son kelime aranıyor · 9–12 sn: bulundu, kartpostal açılır · Yazı: "Kadıköy–Karaköy = 1 durak."
3. **Sinyal yok** (#10) – 0–2 sn: metroda "sinyal yok" ikonu, "Tünelde internet gitti mi?" · 2–8 sn: oyun açık, oynanıyor · Yazı: "Turnike internetsiz oynanır."
4. **120 saniye** (#17) – bölünmüş ekran, iki telefon, aynı bulmaca, sayaç · son: kazanan sonucu · Yazı: "Arkadaşını etiketle, 120 sn düello."
5. **Hangi hattasın?** (#14) – hat rozetleri hızlı kesme (M2, Marmaray, T1, vapur, teleferik) · "Yorumda hattını yaz, sana o hattın bulmacasını atalım" · Takip eden günlerde yorumlara görselle cevap.
6. **Günün Seferi sonuç** (#6) – paylaşılan sonuç kartı (cevabı ele vermeyen kareler) · "Bugün 4/6. Senin skorun?"

## Etkileşim turu (her gün 20 dk, paylaşımdan ÖNCE)

Gerçek hesap adlarını sen seç; aşağıdakiler hangi tür hesap olacağını söyler. 10 hesabı `~/.claude/instagram/voice.md` altına yaz.
- 5 erişim: İstanbul şehir hayatı ve mizah sayfaları, İstanbul fotoğraf hesapları, Türkçe dil/kelime hesapları (yazım, deyim, TDK paylaşımları), toplu taşıma meraklısı hesaplar, mobil oyun tanıtım sayfaları. Erken ve özlü yorum; asla link.
- 3 akran: küçük bağımsız Türk oyun geliştiricileri, indie oyun hesapları.
- 2 "alıcı": günlük bulmaca oynayan içerik üreticileri (Wordle/Kelimelik paylaşanlar). Haftalarca yorum, sonra DM'de düello daveti.

## Ölçüm (her pazar 10 dk)

- Reel: 3 sn izlenme oranı (kanca), tamamlama oranı, paylaşım sayısı.
- Profil: bio bağlantı tıklaması (site UTM'den görülür).
- Kural: 2 hafta üst üste 3 sn oranı düşük kalan kanca formülü bırakılır.

## Kayıt

Bu plan bir plandır; hiçbir şey zamanlanmadı ya da paylaşılmadı. "Salıyı yaz" de, o gönderiyi tam metin + kapak ile hazırlayayım.
