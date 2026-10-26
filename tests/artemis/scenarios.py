"""Turnike mobil uçtan uca test senaryoları (Artemis ile gerçek cihaz / emülatör üzerinde).

Her senaryo Artemis ajanına verilen doğal dilde bir görevdir. Ajan ekranı görerek dokunur,
kaydırır ve sonunda beklenen çıktıya göre PASS/FAIL döndürür. Senaryolar sırayla çalışır ve
bir öncekinin bıraktığı durumdan devam eder (ör. 'first_level' bitince ilerleme 2. seviyededir).

Ekrandaki metinler uygulamanın Türkçe arayüzünden alınmıştır; arayüz metni değişirse burayı
da güncelleyin.
"""

from dataclasses import dataclass

APP_PACKAGE = "com.turnike.app"

# Ajanın sonunda döndürmesi istenen tek tip çıktı; run_artemis.py bunu ayrıştırır.
VERDICT_FORMAT = (
    'Sonunda yalnızca şu JSON\'u döndür: {"verdict": "PASS" veya "FAIL", '
    '"notes": "gözlemlerin, başarısızsa nedeni"}'
)


@dataclass(frozen=True)
class Scenario:
    name: str
    goal: str
    profile: str = "flash"


SCENARIOS = [
    Scenario(
        name="home_layout",
        goal=(
            "Turnike uygulamasını aç ve ana ekranın yüklenmesini bekle (yaklaşık 4 saniye). "
            "Günlük çark ya da başka bir pencere açılırsa kapat. Ana ekranda turuncu LED panoda "
            "'SIRADAKİ DURAK' yazısını, ortada 'OYNA' ya da 'DEVAM ET' butonunu ve ekranın en altında "
            "HARİTA, SÖZLÜK, ROZETLERİM, KOLEKSİYON, LİDERLİK sekmelerinin beşinin de tamamen "
            "görünür olduğunu (alttan kesilmediğini) doğrula."
        ),
    ),
    Scenario(
        name="first_level",
        goal=(
            "Ana ekranda 'OYNA' butonuna bas. Oyun ekranının üst başlığında 'Hacıosman' ve "
            "'Bölüm 1/5' yazdığını doğrula. Alttaki harf çarkında K, A, R, T harfleri var: parmağını "
            "kaldırmadan K → A → R → T harflerinin üzerinden kaydırarak KART kelimesini yaz. "
            "Ardından aynı şekilde K → A → R kaydırarak KAR kelimesini yaz. Seviye bitince açılan "
            "ekranda 'durağına vardın' yazısını ve 'SONRAKİ DURAK' butonunu doğrula, sonra "
            "'ANA MENÜYE DÖN' butonuna bas."
        ),
    ),
    Scenario(
        name="progress_persists",
        goal=(
            "Ana ekrandaki büyük yeşil butonun altında yazan seviye numarasını oku (ör. 'SEVİYE 2'). "
            "Uygulamayı son uygulamalar ekranından kaydırarak tamamen kapat, sonra Turnike'yi "
            "yeniden aç. Açılış bitince aynı seviye numarasının göründüğünü doğrula; "
            "numara 1'e dönmüşse FAIL."
        ),
    ),
    Scenario(
        name="wrong_word_costs_life",
        goal=(
            "Ana ekranda büyük yeşil butona basarak oyuna gir. Sol üstteki kırmızı kalp sayısını say. "
            "Çarktaki harflerden anlamsız bir dizi oluştur: üç harfin üzerinden ters sırayla kaydır "
            "(ör. sağdan sola). 'GEÇERSİZ' uyarısının göründüğünü ve kalp sayısının bir azaldığını "
            "doğrula. İnternet yoksa 'Sözlük sunucusuna ulaşılamadı' çıkar; bu durumda notlara yaz "
            "ve FAIL ver."
        ),
    ),
    Scenario(
        name="term_hint",
        goal=(
            "Oyun ekranındayken çarkın altındaki üç butondan 'Terim' yazanına bas. Açılan bilgi "
            "kartında 'Terim:' başlığı altında kelimenin ● işaretleriyle gizlendiğini ve altında bir "
            "açıklama cümlesi olduğunu doğrula. Kelimenin kendisi açıkça yazılıyorsa FAIL."
        ),
    ),
    Scenario(
        name="tabs_and_back_button",
        goal=(
            "Oyun ekranındaysan sol üstteki geri okuna basarak ana ekrana dön. Ana ekranın altındaki "
            "HARİTA sekmesine bas, haritanın açıldığını doğrula ve Android'in sistem geri tuşuna bas; "
            "ana ekrana döndüğünü doğrula. Aynısını SÖZLÜK ve KOLEKSİYON için de yap (Koleksiyon "
            "alttan bir menü açar; içinden 'Kasa'yı seç, sonra geri tuşuna bas). Her seferinde ana "
            "ekrana dönülmeli."
        ),
    ),
]
