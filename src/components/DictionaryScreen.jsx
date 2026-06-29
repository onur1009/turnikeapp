import React, { useState } from 'react';
import { WORD_MEANINGS_TR, WORD_MEANINGS_EN } from '../utils/gameLogic';
import { useTranslation } from '../utils/i18n';

const CATEGORY_COLORS = {
  'ULAŞIM': '#3b82f6',
  'ALTYAPI': '#8b5cf6',
  'BİLET': '#22c55e',
  'MİMARİ': '#f59e0b',
  'TEKNİK': '#ef4444',
  'DENİZCİLİK': '#06b6d4',
  'TARİHİ': '#ec4899',
  'TRANSPORT': '#3b82f6',
  'TECH': '#ef4444',
  'MARINE': '#06b6d4',
};

const DictionaryScreen = ({ learnedWords = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t, language } = useTranslation();

  const WORD_MEANINGS = language === 'en' ? WORD_MEANINGS_EN : WORD_MEANINGS_TR;

  // Sadece WORD_MEANINGS'de olan (teknik/açıklaması olan) kelimeleri göster
  const displayedWords = learnedWords.filter(word =>
    word.toLowerCase().includes(searchTerm.toLowerCase()) && !!WORD_MEANINGS[word]
  );

  return (
    <main className="flex-1 w-full p-4 overflow-y-auto pb-20">
      {/* Search */}
      <div className="relative mb-5 max-w-lg mx-auto">
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

      {/* Counter */}
      <div className="card-panel px-4 py-2.5 mb-5 max-w-lg mx-auto flex items-center justify-between">
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
            const hasMeaning = !!meaning;

            return (
              <div key={wordKey} className="card-panel p-4 relative overflow-hidden">
                {/* Accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-full" style={{ background: hasMeaning ? '#22c55e' : '#64748b' }} />

                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white text-lg font-extrabold tracking-wide">{wordKey}</h3>
                  {hasMeaning && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(34,197,94,0.15)',
                        color: '#22c55e',
                        border: '1px solid rgba(34,197,94,0.3)'
                      }}
                    >
                      {language === 'en' ? 'TECH' : 'TEKNİK'}
                    </span>
                  )}
                </div>

                {/* Description */}
                {hasMeaning ? (
                  <p className="text-white/60 text-sm leading-relaxed">{meaning}</p>
                ) : (
                  <p className="text-white/40 text-xs italic">{language === 'en' ? 'Word found during gameplay' : 'Oyun sırasında bulunan kelime'}</p>
                )}

                {/* Rarity */}
                <div className="flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-[12px]" style={{ color: hasMeaning ? '#fbbf24' : 'rgba(255,255,255,0.3)' }}>
                    {hasMeaning ? 'star' : 'circle'}
                  </span>
                  <span className="text-white/30 text-[10px] font-bold">
                    {hasMeaning 
                      ? (language === 'en' ? 'TECHNICAL' : 'TEKNİK') 
                      : (language === 'en' ? 'COMMON' : 'GENEL')
                    }
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
