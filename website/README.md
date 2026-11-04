# Turnike tanıtım sitesi

Statik, JavaScript'siz tek sayfa. `src/` → `node build.mjs` → `dist/`.

## Yayına alma (Cloudflare Pages, önerilen)

1. dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git → `onur1009/turnikeapp`.
2. Production branch: `main`. Framework preset: None. Build command: `node build.mjs`. Build output: `dist`. Root directory: `website`.
3. Environment variables (Production): aşağıdaki değişkenlerin aynısı.
4. Custom domains → `turnikeapp.com.tr` (alan adının DNS'i Cloudflare'de olmalı).
Başlıklar `src/_headers` dosyasından gelir; uzantısız adresler (`/gizlilik`) Pages'te kendiliğinden çalışır.

## Yayına alma (Vercel, eski)

1. Vercel → Add New Project → aynı GitHub deposu → Root Directory: `website`.
2. Framework: Other. Build/Output `vercel.json`'dan gelir.
3. Environment Variables:
   - `SITE_URL` – sitenin alan adı, `https://turnikeapp.com.tr` (zorunlu)
   - `ANDROID_CERT_SHA256` – Play Console > Uygulama imzalama > SHA-256 (düello bağlantıları uygulamayı açar)
   - `ADMOB_PUBLISHER_ID` – AdMob yayıncı kimliği, ör. `pub-1234567890123456` (app-ads.txt üretilir)
   - `INSTAGRAM_URL` – ör. `https://www.instagram.com/turnikeoyun/`
4. Domains → alan adını bağla. Sonra Google Search Console'a ekle, `SITE_URL/sitemap.xml` gönder.

Yerelde: `SITE_URL=https://ornek.test node build.mjs`

## Tasarım dosyaları

- `design/og.html` → `src/og.png` (paylaşım görseli 1200×630)
- `design/instagram.html` → `design/instagram/*.png` (9 grid gönderisi, profil fotoğrafı, öne çıkan kapakları)
- Görseller Playwright ile öğe ekran görüntüsü alınarak üretildi.
