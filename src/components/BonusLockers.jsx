import React, { useState, useEffect } from 'react';
import { formatKurus } from '../utils/format';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../utils/i18n';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { playCorrect, playWrong, playBalanceUp, playBadgeUnlock } from '../utils/soundManager';

const REWARD_TYPES = [
  { type: 'cash_small', id: 'istanbulkart', value: 1000 /* kuruş */, label: 'Unutulmuş\nİstanbulkart\n(+₺10)', icon: 'credit_card', color: '#22c55e', chance: 35 },
  { type: 'cash_big', id: 'cuzdan', value: 5000 /* kuruş */, label: 'Dolu Cüzdan\n(+₺50)', icon: 'account_balance_wallet', color: '#fbbf24', chance: 15 },
  { type: 'hints', id: 'gozluk', value: 2, label: 'Gözlük\n(+2 İpucu)', icon: 'eyeglasses', color: '#3b82f6', chance: 20 },
  { type: 'life', id: 'semsiye', value: 1, label: 'Şemsiye\n(+1 Can)', icon: 'umbrella', color: '#ec4899', chance: 15 },
  { type: 'empty', id: 'takmadis', value: 0, label: 'Takma Diş\n(Boş)', icon: 'dentistry', color: '#94a3b8', chance: 10 },
  { type: 'empty', id: 'tencere', value: 0, label: 'Tencere\n(Boş)', icon: 'cooking', color: '#64748b', chance: 5 },
];

const generateLockerContents = () => {
  const contents = [];
  for (let i = 0; i < 9; i++) {
    const roll = Math.random() * 100;
    let cumulative = 0;
    let selectedReward = REWARD_TYPES[0];
    for (const reward of REWARD_TYPES) {
      cumulative += reward.chance;
      if (roll < cumulative) {
        selectedReward = reward;
        break;
      }
    }
    contents.push(selectedReward);
  }
  // İçinde en az 1 tane büyük ödül (cüzdan) olmasını garantile
  if (!contents.some(c => c.type === 'cash_big')) {
    contents[Math.floor(Math.random() * 9)] = REWARD_TYPES.find(r => r.type === 'cash_big');
  }
  return contents;
};

const BonusLockers = ({ onComplete }) => {
  const [lockers, setLockers] = useState([]);
  const [openedIndices, setOpenedIndices] = useState([]);
  const [picksLeft, setPicksLeft] = useState(3);
  const [isFinishing, setIsFinishing] = useState(false);
  const [totalWon, setTotalWon] = useState({ cash: 0, hints: 0, lives: 0 });

  const { soundEnabled, hapticEnabled, addBalance, addHints, addLives } = useGameStore();
  const { t } = useTranslation();

  useEffect(() => {
    setLockers(generateLockerContents());
  }, []);

  const handleOpenLocker = (index) => {
    if (picksLeft <= 0 || openedIndices.includes(index) || isFinishing) return;
    
    setOpenedIndices(prev => [...prev, index]);
    setPicksLeft(prev => prev - 1);
    
    const reward = lockers[index];
    
    if (reward.type === 'empty') {
      if (soundEnabled) playWrong();
      if (hapticEnabled) Haptics.impact({ style: ImpactStyle.Heavy }).catch(()=>{});
    } else {
      if (reward.type.includes('cash')) {
        addBalance(reward.value);
        setTotalWon(prev => ({ ...prev, cash: prev.cash + reward.value }));
        if (soundEnabled) playBalanceUp();
      } else if (reward.type === 'hints') {
        addHints(reward.value);
        setTotalWon(prev => ({ ...prev, hints: prev.hints + reward.value }));
        if (soundEnabled) playCorrect();
      } else if (reward.type === 'life') {
        addLives(reward.value);
        setTotalWon(prev => ({ ...prev, lives: prev.lives + reward.value }));
        if (soundEnabled) playBadgeUnlock();
      }
      if (hapticEnabled) Haptics.notification({ type: NotificationType.Success }).catch(()=>{});
    }

    if (picksLeft - 1 === 0) {
      setIsFinishing(true);
      setTimeout(() => {
        onComplete();
      }, 4500);
    }
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 relative z-10 fade-in">
      {/* Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3" style={{ background: 'rgba(245, 158, 11, 0.15)', border: '2px solid rgba(245, 158, 11, 0.4)' }}>
          <span className="material-symbols-outlined text-[32px] text-amber-500">luggage</span>
        </div>
        <h1 className="text-white text-2xl font-black mb-1 uppercase tracking-widest" style={{ fontFamily: "'Orbitron', monospace" }}>Kayıp Eşya Bürosu</h1>
        <p className="text-white/60 text-sm font-semibold max-w-xs mx-auto">İETT ve Metro'da unutulan eşyalar arasında şansını dene!</p>
      </div>

      {/* Picks Left Badge */}
      <div className="mb-6 px-4 py-2 rounded-full flex items-center gap-2 transition-all shadow-lg"
        style={{
          background: picksLeft > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${picksLeft > 0 ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`
        }}
      >
        <span className="material-symbols-outlined text-[18px]" style={{ color: picksLeft > 0 ? '#4ade80' : '#f87171' }}>key</span>
        <span className="font-bold text-sm" style={{ color: picksLeft > 0 ? '#4ade80' : '#f87171' }}>{picksLeft} HAKKIN KALDI</span>
      </div>

      {/* Lockers Grid */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[340px] mb-8" style={{ perspective: '1000px' }}>
        {lockers.map((reward, i) => {
          const isOpened = openedIndices.includes(i);
          const isRevealed = isFinishing && !isOpened; // Oyun bitince açılmayanları da göster
          const showFront = !isOpened && !isRevealed;

          return (
            <div 
              key={i} 
              className="relative aspect-square cursor-pointer group"
              onClick={() => handleOpenLocker(i)}
            >
              <div 
                className="w-full h-full transition-transform duration-700 relative preserve-3d"
                style={{ 
                  transformStyle: 'preserve-3d', 
                  transform: showFront ? 'rotateY(0deg)' : 'rotateY(180deg)' 
                }}
              >
                {/* FRONT (Kapak Kapalı) */}
                <div 
                  className="absolute inset-0 rounded-xl flex flex-col items-center justify-center backface-hidden shadow-lg border-2 transition-colors duration-200"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                    borderColor: 'rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="w-8 h-1 bg-white/10 rounded-full mb-3"></div>
                  <span className="material-symbols-outlined text-white/20 text-[28px] mb-1 group-hover:text-amber-500/50 transition-colors">lock</span>
                  <span className="text-white/20 text-xs font-black tracking-widest">{i + 1}</span>
                </div>

                {/* BACK (Kapak Açık - Eşya) */}
                <div 
                  className="absolute inset-0 rounded-xl flex flex-col items-center justify-center backface-hidden shadow-xl border-2"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: isOpened ? 'rgba(15,23,42,0.9)' : 'rgba(15,23,42,0.5)',
                    borderColor: isOpened ? reward.color : 'rgba(255,255,255,0.05)',
                    boxShadow: isOpened ? `0 0 20px ${reward.color}40, inset 0 0 15px ${reward.color}20` : 'none',
                    opacity: isRevealed ? 0.6 : 1,
                  }}
                >
                  <span className="material-symbols-outlined text-[36px] mb-1" style={{ color: reward.color, fontVariationSettings: "'FILL' 1" }}>
                    {reward.icon}
                  </span>
                  <span className="font-bold text-[10px] leading-tight text-center px-1 whitespace-pre-line" style={{ color: reward.color }}>
                    {reward.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Finishing Summary */}
      <div className={`transition-all duration-700 flex flex-col items-center ${isFinishing ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}>
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-2xl p-4 shadow-2xl flex flex-col items-center">
          <p className="text-white font-black text-sm uppercase tracking-widest mb-3 text-center">TOPLAM KAZANÇ</p>
          <div className="flex flex-wrap justify-center gap-2">
            {totalWon.cash > 0 && <span className="text-green-400 font-bold bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/30">+{formatKurus(totalWon.cash)}</span>}
            {totalWon.hints > 0 && <span className="text-blue-400 font-bold bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/30">+{totalWon.hints} İpucu</span>}
            {totalWon.lives > 0 && <span className="text-pink-400 font-bold bg-pink-500/10 px-3 py-1.5 rounded-lg border border-pink-500/30">+{totalWon.lives} Can</span>}
            {totalWon.cash === 0 && totalWon.hints === 0 && totalWon.lives === 0 && <span className="text-slate-400 font-bold bg-slate-500/10 px-3 py-1.5 rounded-lg border border-slate-500/30">Maalesef boş çektin...</span>}
          </div>
        </div>
      </div>
    </main>
  );
};

export default BonusLockers;
