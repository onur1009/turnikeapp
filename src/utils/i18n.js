import { useGameStore } from '../store/gameStore';

export const translations = {
  tr: {
    play: 'SEFERE BAŞLA',
    map: 'HARİTA',
    badges: 'ROZETLER',
    settings: 'AYARLAR',
    stats: 'İSTATİSTİKLER',
    akbil: 'İSTANBULKART',
    level: 'Seviye',
    game_over: 'Treni Kaçırdın!',
    game_over_desc: 'Devam etmek için aşağıdaki seçeneklerden birini kullanabilirsin.',
    watch_ad: 'Reklam İzle (1 Can Al)',
    buy_life: '25₺ Öde (1 Can Al)',
    skip_level: '50₺ Öde (Seviyeyi Geç)',
    main_menu: 'ANA MENÜYE DÖN',
    time_up: 'SÜRE BİTTİ - YENİ KELİME',
    perfect: 'KUSURSUZ! +₺0.50',
    sound: 'Ses Efektleri',
    haptic: 'Titreşim (Haptik)',
    theme: 'Tema Seçimi',
    lang: 'Dil (Language)',
    dark_theme: 'Koyu Tema',
    light_theme: 'Açık Tema',
    retro_theme: 'Retro (8-Bit)'
  },
  en: {
    play: 'START JOURNEY',
    map: 'MAP',
    badges: 'BADGES',
    settings: 'SETTINGS',
    stats: 'STATISTICS',
    akbil: 'TRANSIT CARD',
    level: 'Level',
    game_over: 'You missed the train!',
    game_over_desc: 'Use one of the options below to continue.',
    watch_ad: 'Watch Ad (+1 Life)',
    buy_life: 'Pay ₺25 (+1 Life)',
    skip_level: 'Pay ₺50 (Skip Level)',
    main_menu: 'MAIN MENU',
    time_up: 'TIME IS UP - NEW WORD',
    perfect: 'PERFECT! +₺0.50',
    sound: 'Sound Effects',
    haptic: 'Haptics (Vibration)',
    theme: 'Theme Selection',
    lang: 'Language (Dil)',
    dark_theme: 'Dark Theme',
    light_theme: 'Light Theme',
    retro_theme: 'Retro (8-Bit)'
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
