import { useGameStore } from '../store/gameStore';

export const translations = {
  tr: {
    // Menü
    play: 'OYNA',
    map: 'HARİTA',
    dictionary: 'SÖZLÜK',
    badges: 'ROZETLERİM',
    settings: 'AYARLAR',
    stats: 'İSTATİSTİKLER',
    akbil: 'İSTANBULKART',
    back: 'GERİ',

    // Ana Ekran
    welcome: 'Hoş Geldin!',
    subtitle: 'İstanbul\'u dolaşarak kelime bul',
    day_streak: 'GÜN SERİSİ',
    level_label: 'Seviye',
    word_journey: 'SÖZCÜK SEFERİ',

    // Oyun
    correct: 'DOĞRU!',
    wrong: 'GEÇERSİZ',
    already_found: 'ZATEN BULUNDU',
    extra_word: 'EKSTRA! +₺0.20',
    time_up: 'SÜRE BİTTİ!',
    perfect: 'KUSURSUZ! +₺0.50',
    gold_letter: 'ALTIN HARF! +₺0.25',
    balance_low: 'BAKİYE YETERSİZ',
    new_badge: '🏆 YENİ ROZET!',
    combo_15: '1.5x KOMBO',
    combo_20: '2.0x KOMBO',
    journey: 'SEFER',

    // Game Over
    game_over: 'Treni Kaçırdın!',
    game_over_desc: 'Devam etmek için aşağıdaki seçeneklerden birini kullanabilirsin.',
    watch_ad: 'Reklam İzle (1 Can Al)',
    watching_ad: 'Reklam İzleniyor...',
    buy_life: '₺0.25 Öde (1 Can Al)',
    skip_level: '₺0.50 Öde (Seviyeyi Geç)',
    main_menu: 'ANA MENÜYE DÖN',

    // Sözlük
    search_word: 'Kelime ara...',
    discovered_words: 'Keşfedilen Kelimeler',
    count_unit: 'Adet',
    no_words_yet: 'Henüz kelime keşfetmediniz.',
    no_search_result: 'Arama sonucu bulunamadı.',
    play_to_discover: 'Oyunda kelime bularak sözlüğü doldurabilirsiniz.',

    // Rozet
    earned_badges: 'Kazanılan Rozetler',

    // Akbil
    available_balance: 'Kullanılabilir Bakiye',
    watch_ad_balance: 'Reklam İzle (+₺0.50)',
    load_balance: 'Bakiye Yükle',
    history: 'Geçmiş İşlemler',
    recent_ops: 'Son İşlemler',
    card_color: 'Kart Rengi',

    // İstatistik
    games_played: 'Oynanan Oyun',
    words_found: 'Bulunan Kelime',
    max_combo: 'Maksimum Kombo',
    daily_streak: 'Günlük Seri',
    total_earned: 'Toplam Kazanılan Bakiye',

    // Ayarlar
    sound: 'Ses Efektleri',
    haptic: 'Titreşim (Haptik)',
    theme: 'Tema Seçimi',
    lang: 'Dil (Language)',
    dark_theme: 'Koyu Tema',
    light_theme: 'Açık Tema',
    retro_theme: 'Retro (8-Bit)',

    // Harita
    istanbul_line: 'İSTANBUL HATTI',

    // Seviye Tamamlama
    level_complete: 'SEFER TAMAMLANDI!',

    // Kasa & Liderlik
    vault: 'KASA',
    leaderboard: 'LİDERLİK',

    // Onay
    confirm_reset: 'Ana menüye dönmek istediğinize emin misiniz? İlerlemeniz korunacaktır.',

    // Hint Maliyetleri
    hint_cost_word: 'İpucu (75₺)',
    hint_cost_letter: 'Harf (25₺)',

    // Yolculuk (v1.4 yeniden tasarım)
    continue_journey: 'DEVAM ET',
    level_short: 'SEVİYE',
    next_stop: 'SIRADAKİ DURAK',
    leg: 'Bölüm',
    express: 'EKSPRES',
    express_over: 'Normal sefer · süre baskısı yok',
    express_bonus: 'Ekspres bonusu',
    word_points: 'Kelime puanı',
    perfect_bonus: 'Kusursuz sefer',
    arrived_at: 'durağına vardın',
    next_station: 'Sonraki durak',
    line_change: 'Aktarma: yeni hatta geçiyorsun',
    learned_terms: 'Bu durakta öğrendiklerin',
    tutorial_hint: 'Harfleri sırayla kaydırarak kelimeyi yaz',
    tool_letter: 'Harf',
    tool_word: 'Kelime',
    tool_eliminate: 'Ele',
    words_label: 'kelime',
    unlocks_at: '{n}. seviyede açılır',
    collection: 'KOLEKSİYON',
    vault_short: 'Kasa',
  },
  en: {
    // Menu
    play: 'PLAY',
    map: 'MAP',
    dictionary: 'DICTIONARY',
    badges: 'MY BADGES',
    settings: 'SETTINGS',
    stats: 'STATISTICS',
    akbil: 'TRANSIT CARD',
    back: 'BACK',

    // Home Screen
    welcome: 'Welcome!',
    subtitle: 'Travel through Istanbul and find words',
    day_streak: 'DAY STREAK',
    level_label: 'Level',
    word_journey: 'WORD JOURNEY',

    // Game
    correct: 'CORRECT!',
    wrong: 'INVALID',
    already_found: 'ALREADY FOUND',
    extra_word: 'EXTRA! +₺0.20',
    time_up: 'TIME IS UP!',
    perfect: 'PERFECT! +₺0.50',
    gold_letter: 'GOLD LETTER! +₺0.25',
    balance_low: 'LOW BALANCE',
    new_badge: '🏆 NEW BADGE!',
    combo_15: '1.5x COMBO',
    combo_20: '2.0x COMBO',
    journey: 'TRIP',

    // Game Over
    game_over: 'You Missed the Train!',
    game_over_desc: 'Use one of the options below to continue.',
    watch_ad: 'Watch Ad (+1 Life)',
    watching_ad: 'Watching Ad...',
    buy_life: 'Pay ₺0.25 (+1 Life)',
    skip_level: 'Pay ₺0.50 (Skip Level)',
    main_menu: 'MAIN MENU',

    // Dictionary
    search_word: 'Search word...',
    discovered_words: 'Discovered Words',
    count_unit: 'Total',
    no_words_yet: 'No words discovered yet.',
    no_search_result: 'No search results found.',
    play_to_discover: 'Find words in the game to fill your dictionary.',

    // Badges
    earned_badges: 'Earned Badges',

    // Akbil
    available_balance: 'Available Balance',
    watch_ad_balance: 'Watch Ad (+₺0.50)',
    load_balance: 'Load Balance',
    history: 'Transaction History',
    recent_ops: 'Recent Transactions',
    card_color: 'Card Color',

    // Stats
    games_played: 'Games Played',
    words_found: 'Words Found',
    max_combo: 'Max Combo',
    daily_streak: 'Daily Streak',
    total_earned: 'Total Balance Earned',

    // Settings
    sound: 'Sound Effects',
    haptic: 'Haptics (Vibration)',
    theme: 'Theme Selection',
    lang: 'Language (Dil)',
    dark_theme: 'Dark Theme',
    light_theme: 'Light Theme',
    retro_theme: 'Retro (8-Bit)',

    // Map
    istanbul_line: 'TRANSIT LINE',

    // Level Complete
    level_complete: 'JOURNEY COMPLETE!',

    // Vault & Leaderboard
    vault: 'VAULT',
    leaderboard: 'LEADERBOARD',

    // Confirm
    confirm_reset: 'Are you sure you want to return to menu? Your progress will be saved.',

    // Hint Costs
    hint_cost_word: 'Hint (₺75)',
    hint_cost_letter: 'Letter (₺25)',

    // Journey (v1.4 redesign)
    continue_journey: 'CONTINUE',
    level_short: 'LEVEL',
    next_stop: 'NEXT STOP',
    leg: 'Leg',
    express: 'EXPRESS',
    express_over: 'Regular service · no time pressure',
    express_bonus: 'Express bonus',
    word_points: 'Word points',
    perfect_bonus: 'Flawless trip',
    arrived_at: 'reached',
    next_station: 'Next stop',
    line_change: 'Transfer: switching to a new line',
    learned_terms: 'Terms you learned here',
    tutorial_hint: 'Swipe the letters in order to spell the word',
    tool_letter: 'Letter',
    tool_word: 'Word',
    tool_eliminate: 'Remove',
    words_label: 'words',
    unlocks_at: 'Unlocks at level {n}',
    collection: 'COLLECTION',
    vault_short: 'Vault',
  }
};

export const useTranslation = () => {
  const language = useGameStore(state => state.language);
  
  const t = (key) => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    return translations['tr'][key] || key;
  };

  return { t, language };
};
