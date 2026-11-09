# Turnike iOS: MacBook'ta adım adım

Windows'ta hazırlananlar (repo'da): `ios/` Capacitor projesi, Info.plist (AdMob, izleme izni metni, SKAdNetwork,
şifreleme beyanı), `PrivacyInfo.xcprivacy`, yalnızca iPhone hedefi, sürüm 1.0.0 (1), ATT isteği (`src/utils/adService.js`).

Kalanlar Mac'te yapılır. Sıra önemli.

## 0. Hesaplar (bir kez)
1. developer.apple.com/programs → bireysel kayıt (yıllık ücret). Apple Kimliğinde iki adımlı doğrulama açık olmalı.
2. Onay gelince App Store Connect → Uygulamalarım → + → Yeni uygulama:
   - Platform iOS, ad `Turnike: Sözcük Seferi`, birincil dil Türkçe
   - Paket kimliği (Bundle ID): `com.turnike.app` (listede yoksa Certificates, Identifiers & Profiles → Identifiers → + ile oluştur)
   - SKU: `turnike-ios`
3. AdMob → Uygulamalar → Uygulama ekle → iOS → "henüz yayında değil" → ad `Turnike: Sözcük Seferi`.
   - İki reklam birimi: Ödüllü (`turnike_rewarded_ios`) ve Geçiş (`turnike_interstitial_ios`).
   - Gizlilik ve mesajlaşma → **IDFA açıklayıcı** mesajı oluştur ve yayınla. Mevcut GDPR mesajına iOS uygulamasını da ekle.

## 1. Mac'i hazırla
```bash
xcode-select --install
```
- App Store'dan **Xcode** kur, bir kez aç, lisansı kabul et.
- Node.js LTS kur (nodejs.org).
- Xcode → Settings → Accounts → + → Apple Kimliğinle giriş yap.

## 2. Projeyi al
```bash
git clone https://github.com/onur1009/turnikeapp.git
cd turnikeapp
npm ci
```
`.env.local` git'te yok. Windows'taki `TurnikeApp/.env.local` dosyasını USB ya da AirDrop ile proje köküne kopyala,
sonra iOS kimliklerini ekle:
```
VITE_ADMOB_REWARDED_IOS=ca-app-pub-3513557002252302/...
VITE_ADMOB_INTERSTITIAL_IOS=ca-app-pub-3513557002252302/...
```

## 3. AdMob iOS uygulama kimliği
`ios/App/App/Info.plist` içindeki `GADApplicationIdentifier` şu an Google'ın TEST kimliği.
AdMob iOS uygulamasının kimliğiyle (`ca-app-pub-3513557002252302~...`) değiştir. Değiştirmezsen gelir gelmez.

## 4. Derle ve Xcode'u aç
```bash
npm run build
npx cap sync ios
npx cap open ios
```
Xcode'da:
1. Sol panelde **App** klasörüne sağ tık → Add Files to "App" → `PrivacyInfo.xcprivacy` → "Add to targets: App" işaretli → Add.
2. **App** hedefi → Signing & Capabilities → "Automatically manage signing" açık, Team: kendi adın.
3. Üstte cihaz olarak bir iPhone simülatörü seç → ▶ (Run). Oyunu aç, bir bölüm oyna, ödüllü reklam düğmesine bas
   (test reklamı ya da "reklam yok" mesajı gelmeli, oyun kilitlenmemeli).

## 5. TestFlight'a yükle
1. Cihaz olarak **Any iOS Device (arm64)** seç.
2. Product → Archive.
3. Organizer açılınca → Distribute App → App Store Connect → Upload → varsayılanlarla devam.
4. 10–30 dk sonra App Store Connect → TestFlight'ta derleme görünür. Kendini dahili test kullanıcısı olarak ekle,
   iPhone'a TestFlight uygulamasından kur.

Her yeni yüklemede Xcode → App hedefi → General → **Build** numarasını 1 artır.

## 6. App Store sayfası ve inceleme
- Ekran görüntüleri: 6,9" (1320×2868) ve 6,5" (1284×2778). Simülatörde iPhone 16 Pro Max ile ⌘S → masaüstüne kaydeder.
- Simge: 1024×1024, köşesiz, şeffaflıksız (repo: `store/play-icon-512.png` kaynak; Xcode Assets.xcassets → AppIcon).
- Açıklama: `store/listing-tr.md` (Apple'da kısa açıklama yerine 30 karakterlik **Alt başlık** ve 100 karakterlik **Anahtar kelimeler** var).
- Gizlilik politikası: `https://turnikeapp.com.tr/gizlilik`, destek adresi: `https://turnikeapp.com.tr`.
- App Privacy (veri gizliliği): Play'deki veri güvenliği formuyla aynı cevaplar. AdMob için
  "Cihaz kimliği, Reklam verisi, Ürün etkileşimi, Kilitlenme/Performans → Üçüncü taraf reklam, Analiz; İzleme: Evet".
- Yaş sınırı anketi: şiddet/kumar yok → 4+ çıkar; reklam içerdiği için "Reklamlar" işaretlenir.
- İnceleme notu: "Giriş gerekmiyor. Oyun ücretsiz, ödüllü video ve geçiş reklamı içerir. Uygulama içi satın alma yok."
- Gönder → inceleme genelde 1–2 gün.

## Henüz yapılmayanlar
- Düello bağlantıları iOS'ta (Universal Links): Apple Team ID belli olunca `website/src/.well-known/apple-app-site-association`
  dosyası ve Xcode'da **Associated Domains** (`applinks:turnikeapp.com.tr`) eklenecek.
- Gerçek iPhone'da test yapılmadı.
