import React, { useState } from 'react';
import { WORD_MEANINGS_TR, WORD_MEANINGS_EN, PROVIDER_MAP_TR, PROVIDER_MAP_EN } from '../utils/gameLogic';
import { useTranslation } from '../utils/i18n';

const PROVIDER_THEMES = {
  "Metro Istanbul": { color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", label: "Metro İstanbul" },
  "Metro": { color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", label: "Metro" },
  "IETT": { color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", label: "İETT" },
  "Sehir Hatlari": { color: "#06b6d4", bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.3)", label: "Şehir Hatları" },
  "City Lines": { color: "#06b6d4", bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.3)", label: "City Lines" },
  "Busforus": { color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.3)", label: "Busforus" }
};

const DictionaryScreen = ({ learnedWords = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { t, language } = useTranslation();

  const WORD_MEANINGS = language === 'en' ? WORD_MEANINGS_EN : WORD_MEANINGS_TR;
  const PROVIDER_MAP = language === 'en' ? PROVIDER_MAP_EN : PROVIDER_MAP_TR;

  // Tabs list
  const tabs = [
    { id: 'all', label: language === 'en' ? 'All' : 'Tümü', icon: 'apps' },
    { id: 'metro', label: language === 'en' ? 'Metro' : 'Metro İstanbul', icon: 'train' },
    { id: 'iett', label: 'İETT', icon: 'directions_bus' },
    { id: 'marine', label: language === 'en' ? 'City Lines' : 'Şehir Hatları', icon: 'directions_boat' },
    { id: 'busforus', label: 'Busforus', icon: 'directions_run' }
  ];

  // Filtering logic
  const displayedWords = learnedWords.filter(word => {
    const matchesSearch = word.toLowerCase().includes(searchTerm.toLowerCase());
    const meaningExists = !!WORD_MEANINGS[word];
    if (!matchesSearch || !meaningExists) return false;

    const provider = PROVIDER_MAP[word];

    if (activeTab === 'all') return true;
    if (activeTab === 'metro') return provider === 'Metro Istanbul' || provider === 'Metro';
    if (activeTab === 'iett') return provider === 'IETT';
    if (activeTab === 'marine') return provider === 'Sehir Hatlari' || provider === 'City Lines';
    if (activeTab === 'busforus') return provider === 'Busforus';

    return true;
  });

  return (
    <main className="flex-1 w-full p-4 overflow-y-auto pb-20">
      {/* Search */}
      <div className="relative mb-4 max-w-lg mx-auto">
        <div className="flex items-center rounded-full overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <span className="material-symbols-outlined text-white/50 pl-4 pr-2 text-[20px]">search</span>
          <input
            className="w-full bg-transparent border-none py-3 pr-4 text-white placeholder-white/40 outline-none text-sm font-semibold"
            placeholder={t('search_word')}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Sekmeli Filtreleme (Transit Tabs) */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 px-1 max-w-lg mx-auto no-scrollbar scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black tracking-wider uppercase whitespace-nowrap transition-all active:scale-95 cursor-pointer border"
              style={{
                background: isActive ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.06)',
                borderColor: isActive ? '#22c55e' : 'rgba(255,255,255,0.1)',
                color: isActive ? '#white' : 'rgba(255,255,255,0.6)',
                boxShadow: isActive ? '0 4px 12px rgba(34,197,94,0.25)' : 'none'
              }}
            >
              <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Counter */}
      <div className="card-panel px-4 py-2.5 mb-4 max-w-lg mx-auto flex items-center justify-between">
        <span className="text-white/60 text-xs font-bold tracking-wider uppercase">{t('discovered_words')}</span>
        <span className="text-white text-sm font-extrabold">{displayedWords.length} {t('count_unit')}</span>
      </div>

      {/* Word List */}
      <div className="max-w-lg mx-auto flex flex-col gap-3">
        {displayedWords.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-white/20 text-[56px] mb-3 block">menu_book</span>
            <p className="text-white/40 text-sm font-semibold">
              {learnedWords.length === 0 ? t('no_words_yet') : t('no_search_result')}
            </p>
            <p className="text-white/25 text-xs mt-1">{t('play_to_discover')}</p>
          </div>
        ) : (
          displayedWords.map((wordKey) => {
            const meaning = WORD_MEANINGS[wordKey];
            const provider = PROVIDER_MAP[wordKey];
            const theme = PROVIDER_THEMES[provider] || { color: '#64748b', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)', label: 'Genel' };

            return (
              <div key={wordKey} className="card-panel p-4 relative overflow-hidden transition-all hover:translate-x-0.5">
                {/* Left accent border matching provider color */}
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: theme.color }} />

                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white text-lg font-extrabold tracking-wide">{wordKey}</h3>
                  <span
                    className="text-[9px] font-black px-2 py-0.5 rounded-md border tracking-wider uppercase"
                    style={{
                      backgroundColor: theme.bg,
                      color: theme.color,
                      borderColor: theme.border
                    }}
                  >
                    {theme.label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-white/60 text-sm leading-relaxed">{meaning}</p>

                {/* Footer Rarity */}
                <div className="flex items-center gap-1 mt-3 pt-2.5 border-t border-white/5">
                  <span className="material-symbols-outlined text-[12px] text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                    shield
                  </span>
                  <span className="text-white/30 text-[9px] font-black tracking-widest uppercase">
                    {language === 'en' ? 'VERIFIED TERM' : 'ONAYLI TERİM'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
};

export default DictionaryScreen;
