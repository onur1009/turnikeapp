import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { BADGES } from '../utils/badges';
import { useTranslation } from '../utils/i18n';
import ScreenHeader from './ScreenHeader';

const BadgesScreen = ({ onBack }) => {
  const { unlockedBadges, maxUnlockedLevel, totalWordsFound, streak, maxCombo, balance } = useGameStore();
  // Kilitli rozetlerde "ne kadar kaldı" göstermek için [şu an, hedef]
  const progressFor = (id) => ({
    first_ticket: [maxUnlockedLevel, 1], level_5: [maxUnlockedLevel, 5], level_10: [maxUnlockedLevel, 10],
    level_20: [maxUnlockedLevel, 20], level_30: [maxUnlockedLevel, 30],
    words_10: [totalWordsFound, 10], words_50: [totalWordsFound, 50], words_100: [totalWordsFound, 100],
    streak_3: [streak, 3], streak_7: [streak, 7], combo_5: [maxCombo, 5], combo_10: [maxCombo, 10],
    rich: [balance, 5000], wealthy: [balance, 20000],
  })[id];
  const { t, language } = useTranslation();
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [animatingBadge, setAnimatingBadge] = useState(null);

  const handleBadgeClick = (badge, isUnlocked) => {
    if (!isUnlocked) return;
    setAnimatingBadge(badge.id);
    setTimeout(() => setAnimatingBadge(null), 600);
    setSelectedBadge(badge);
  };

  return (
    <main className="flex-1 w-full flex flex-col px-4 pb-4 relative z-10 fade-in overflow-y-auto">
      <ScreenHeader title={t('badges')} onBack={onBack} className="px-0 pt-6 mb-3" />

      <div className="text-center mb-6">
        <p className="text-white/40 text-sm font-medium mb-1">{t('earned_badges')}</p>
        <div className="text-3xl font-black text-white" style={{ fontFamily: "'Orbitron', monospace" }}>
          {unlockedBadges.length} <span className="text-white/20 text-xl">/ {BADGES.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pb-10">
        {BADGES.map((badge) => {
          const isUnlocked = unlockedBadges.includes(badge.id);
          const isAnimating = animatingBadge === badge.id;
          const title = language === 'en' ? badge.titleEn : badge.title;
          const desc = language === 'en' ? badge.descriptionEn : badge.description;

          return (
            <button 
              key={badge.id}
              onClick={() => handleBadgeClick(badge, isUnlocked)}
              className={`p-4 rounded-2xl flex flex-col items-center text-center transition-all ${isUnlocked ? 'card-panel active:scale-95 cursor-pointer' : 'bg-white/5 border border-white/5 cursor-default'} ${isAnimating ? 'badge-flip' : ''}`}
              style={isUnlocked ? { 
                border: `1px solid ${badge.color}40`, 
                boxShadow: isAnimating 
                  ? `0 0 30px ${badge.color}60, 0 0 60px ${badge.color}30, inset 0 2px 0 ${badge.color}20` 
                  : `0 8px 32px ${badge.color}15, inset 0 2px 0 ${badge.color}20` 
              } : {}}
            >
              <div 
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all ${isUnlocked ? '' : 'grayscale opacity-20'} ${isAnimating ? 'scale-125' : ''}`}
                style={isUnlocked ? { 
                  background: `linear-gradient(135deg, ${badge.color}30, ${badge.color}10)`, 
                  border: `2px solid ${badge.color}`,
                  boxShadow: isAnimating ? `0 0 20px ${badge.color}80` : 'none'
                } : { background: 'rgba(255,255,255,0.1)' }}
              >
                <span aria-hidden="true" 
                  className={`material-symbols-outlined text-[32px] transition-transform ${isAnimating ? 'animate-bounce' : ''}`}
                  style={{ color: isUnlocked ? badge.color : 'white', fontVariationSettings: "'FILL' 1" }}
                >
                  {isUnlocked ? badge.icon : 'lock'}
                </span>
              </div>
              <h3 className={`text-[13px] font-black uppercase tracking-wider mb-1 ${isUnlocked ? 'text-white' : 'text-white/60'}`}>
                {title}
              </h3>
              <p className={`text-[12px] leading-snug ${isUnlocked ? 'text-white/65' : 'text-white/50'}`}>
                {desc}
              </p>
              {!isUnlocked && progressFor(badge.id) && (() => {
                const [cur, target] = progressFor(badge.id);
                return (
                  <div className="w-full mt-2.5">
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, (cur / target) * 100)}%`, background: badge.color }} />
                    </div>
                  </div>
                );
              })()}
            </button>
          );
        })}
      </div>

      {/* Rozet Detay Modal */}
      {selectedBadge && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm fade-in px-6"
          onClick={() => setSelectedBadge(null)}
        >
          <div 
            className="bg-[#0f172a] border rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl badge-flip"
            style={{ borderColor: `${selectedBadge.color}50` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ 
                background: `linear-gradient(135deg, ${selectedBadge.color}30, ${selectedBadge.color}10)`, 
                border: `3px solid ${selectedBadge.color}`,
                boxShadow: `0 0 30px ${selectedBadge.color}40`
              }}
            >
              <span aria-hidden="true" 
                className="material-symbols-outlined text-[52px]"
                style={{ color: selectedBadge.color, fontVariationSettings: "'FILL' 1" }}
              >
                {selectedBadge.icon}
              </span>
            </div>
            <h3 className="text-white text-xl font-black uppercase tracking-widest mb-2">
              {language === 'en' ? selectedBadge.titleEn : selectedBadge.title}
            </h3>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {language === 'en' ? selectedBadge.descriptionEn : selectedBadge.description}
            </p>
            <button 
              onClick={() => setSelectedBadge(null)}
              className="px-8 py-2 rounded-full bg-white/10 text-white/80 font-bold text-sm hover:bg-white/20 transition-colors"
            >
              {t('back')}
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default BadgesScreen;
