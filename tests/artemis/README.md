# Turnike mobil testleri (Artemis)

[Artemis](https://github.com/google/artemis), Android cihazı ekranı görerek kullanan bir yapay zekâ test ajanı.
Bu klasördeki senaryolar Turnike'nin Android uygulamasını gerçek bir telefon ya da emülatör
üzerinde uçtan uca test eder.

## Senaryolar (`scenarios.py`)

| Ad | Ne doğrular |
|---|---|
| `home_layout` | Ana ekran: LED pano, oyna butonu ve alt sekme çubuğunun beşinin de görünür olması |
| `first_level` | 1. seviye: Hacıosman başlığı, KART + KAR kaydırarak çözme, varış ekranı |
| `progress_persists` | Uygulama kapatılıp açılınca seviyenin korunması |
| `wrong_word_costs_life` | Geçersiz kelimede "GEÇERSİZ" uyarısı ve bir can kaybı (TDK'ya erişim gerekir) |
| `term_hint` | Terim ipucunun kelimeyi ● ile gizleyip anlamı göstermesi |
| `tabs_and_back_button` | Sekmelerin açılması ve Android geri tuşuyla ana ekrana dönüş |

Senaryolar sırayla çalışır; her biri bir öncekinin bıraktığı durumdan devam eder.

## Çalıştırma

1. Artemis kurulu ve sunucusu açık olmalı: `cd C:\artemis && uv run artemis ui`
   (model API anahtarları Artemis'in `.env` dosyasında)
2. Emülatör açık ya da telefon USB hata ayıklamayla bağlı olmalı (`adb devices`)
3. Debug APK'yı derleyin:
   ```bash
   npm run android:apk
   ```
4. Testleri çalıştırın:
   ```bash
   npm run test:mobile
   ```
   Tek senaryo: `npm run test:mobile -- --only home_layout`

Her senaryo bir model çağrısı zinciridir (Flash profili ~3–5 sn/adım) ve Artemis'in `.env`
dosyasındaki API anahtarıyla ücretlendirilir. Sonuçlar `tests/artemis/reports/` altına JSON olarak
yazılır; adım adım kayıtlar ve ekran görüntüleri için Artemis arayüzünde (http://127.0.0.1:8000)
`trace_id` ile açabilirsiniz.

## Yeni senaryo eklerken

Artemis'in kuralı: önce uygulamayı cihazda keşfedip gerçek ekran metinlerini doğrulayın, sonra
senaryoyu yazın. Hedefi ekranda görünen Türkçe metinlerle tarif edin ve sonucu `VERDICT_FORMAT`
ile istenen PASS/FAIL JSON'una bağlayın.
