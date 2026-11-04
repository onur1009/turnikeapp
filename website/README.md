# Turnike tanıtım sitesi

Statik, JavaScript'siz tek sayfa. `src/` → `node build.mjs` → `dist/`.

## Yayına alma (Vercel, ayrı proje)

1. Vercel → Add New Project → aynı GitHub deposu → Root Directory: `website`.
2. Framework: Other. Build/Output `vercel.json`'dan gelir.
3. Environment Variables:
   - `SITE_URL` – sitenin alan adı, ör. `https://turnikeoyun.com` (zorunlu)
   - `GAME_URL` – oyunun adresi (varsayılan `https://turnikeapp.vercel.app`)
   - `INSTAGRAM_URL` – ör. `https://www.instagram.com/turnikeoyun/`
4. Domains → alan adını bağla. Sonra Google Search Console'a ekle, `SITE_URL/sitemap.xml` gönder.

Yerelde: `SITE_URL=https://ornek.test node build.mjs`

## Tasarım dosyaları

- `design/og.html` → `src/og.png` (paylaşım görseli 1200×630)
- `design/instagram.html` → `design/instagram/*.png` (9 grid gönderisi, profil fotoğrafı, öne çıkan kapakları)
- Görseller Playwright ile öğe ekran görüntüsü alınarak üretildi.
