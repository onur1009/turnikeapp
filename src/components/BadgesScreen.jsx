import React from 'react';
import { useGameStore } from '../store/gameStore';
import { BADGES } from '../utils/badges';

const BadgesScreen = ({ onBack }) => {
  const { unlockedBadges } = useGameStore();

  return (
    <main className="flex-1 w-full flex flex-col p-4 relative z-10 fade-in">
      {/* Header */}
      <div className="flex items-center mb-6 pt-4">
        <button onClick={onBack} className="capsule">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </button>
        <h2 className="flex-1 text-center text-white text-xl font-black tracking-widest uppercase mr-12">
          Rozetler
        </h2>
      </div>

      <div className="text-center mb-6">
        <p className="text-white/40 text-sm font-medium mb-1">Kazanılan Rozetler</p>
        <div className="text-3xl font-black text-white" style={{ fontFamily: "'Orbitron', monospace" }}>
          {unlockedBadges.length} <span className="text-white/20 text-xl">/ {BADGES.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-10">
        {BADGES.map((badge) => {
          const isUnlocked = unlockedBadges.includes(badge.id);
          return (
            <div 
              key={badge.id}
              className={`p-4 rounded-2xl flex flex-col items-center text-center transition-all ${isUnlocked ? 'card-panel' : 'bg-white/5 border border-white/5'}`}
              style={isUnlocked ? { border: `1px solid ${badge.color}40`, boxShadow: `0 8px 32px ${badge.color}15, inset 0 2px 0 ${badge.color}20` } : {}}
            >
              <div 
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${isUnlocked ? '' : 'grayscale opacity-20'}`}
                style={isUnlocked ? { background: `linear-gradient(135deg, ${badge.color}30, ${badge.color}10)`, border: `2px solid ${badge.color}` } : { background: 'rgba(255,255,255,0.1)' }}
              >
                <span 
                  className="material-symbols-outlined text-[32px]"
                  style={{ color: isUnlocked ? badge.color : 'white', fontVariationSettings: "'FILL' 1" }}
                >
                  {isUnlocked ? badge.icon : 'lock'}
                </span>
              </div>
              <h3 className={`text-[13px] font-black uppercase tracking-wider mb-1 ${isUnlocked ? 'text-white' : 'text-white/30'}`}>
                {badge.title}
              </h3>
              <p className={`text-[10px] leading-tight ${isUnlocked ? 'text-white/60' : 'text-white/20'}`}>
                {badge.description}
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default BadgesScreen;
