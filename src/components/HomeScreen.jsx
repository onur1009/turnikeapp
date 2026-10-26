import React, { useState } from 'react';
import AnimatedBalance from './AnimatedBalance';
import { useGameStore, VAULT_SIZE } from '../store/gameStore';
import { useTranslation } from '../utils/i18n';
import { getStationForLevel } from '../utils/transitNetwork';

// Sekmelerin açıldığı seviye (maxUnlockedLevel, 0 tabanlı). Kilitliyse uyarı gösterilir.
const TABS = [
  { id: 'levels', icon: 'map', labelKey: 'map', unlockAt: 0 },
  { id: 'dictionary', icon: 'menu_book', labelKey: 'dictionary', unlockAt: 2 },
  { id: 'badges', icon: 'emoji_events', labelKey: 'badges', unlockAt: 4 },
  { id: 'collection', icon: 'inventory_2', labelKey: 'collection', unlockAt: 0 },
  { id: 'leaderboard', icon: 'leaderboard', labelKey: 'leaderboard', unlockAt: 0 },
];

export default function HomeScreen({ setScreen, onPlay, showFeedback, flashBalance }) {
  const { t } = useTranslation();
  const balance = useGameStore(state => state.balance);
  const streak = useGameStore(state => state.streak);
  const maxUnlockedLevel = useGameStore(state => state.maxUnlockedLevel);
  const vaultCount = useGameStore(state => state.vaultWords.length);
  const [showCollection, setShowCollection] = useState(false);

  const station = getStationForLevel(maxUnlockedLevel);

  const openTab = (tab) => {
    if (maxUnlockedLevel < tab.unlockAt) {
      showFeedback('wrong', t('unlocks_at').replace('{n}', tab.unlockAt + 1));
      return;
    }
    if (tab.id === 'collection') setShowCollection(true);
    else setScreen(tab.id);
  };

  return (
    <div className="game-bg h-full flex flex-col relative z-10 fade-in overflow-hidden">
      <style>{`
        @keyframes ybsMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes ybsLedBlink { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes homeFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .ybs-display { background: #0a0a0a; border: 1.5px solid var(--led); border-radius: 12px; font-family: 'Orbitron', monospace; color: var(--led); overflow: hidden; }
        .ybs-led { text-shadow: 0 0 8px #ff8c00, 0 0 16px #ff6600; }
        .ybs-marquee-inner { display: inline-block; white-space: nowrap; animation: ybsMarquee 14s linear infinite; }
      `}</style>

      {/* Üst çubuk */}
      <header className="flex items-center justify-between gap-2 px-4 pt-6 pb-3 shrink-0">
        <button className={`balance-pill active:scale-95 transition-transform ${flashBalance ? 'balance-flash' : ''}`} onClick={() => setScreen('akbil')}>
          <span className="material-symbols-outlined text-[16px]" style={{ color: 'var(--coin)', fontVariationSettings: "'FILL' 1" }}>toll</span>
          <AnimatedBalance value={balance} />
        </button>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <span className="status-chip" title="Seri">🔥 {streak}</span>
          )}
          <button className="icon-btn" onClick={() => setScreen('stats')} aria-label={t('stats')}>
            <span className="material-symbols-outlined text-[18px]">bar_chart</span>
          </button>
          <button className="icon-btn" onClick={() => setScreen('settings')} aria-label={t('settings')}>
            <span className="material-symbols-outlined text-[18px]">settings</span>
          </button>
        </div>
      </header>

      {/* YBS panosu: gerçek hat ve sıradaki durak */}
      <div className="px-4 shrink-0">
        <div className="ybs-display">
          <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(255,140,0,0.25)' }}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="line-badge" style={{ background: station.color, fontFamily: 'inherit' }}>{station.id}</span>
              <span className="ybs-led text-[11px] font-black tracking-[1px] truncate">{station.name.toLocaleUpperCase('tr-TR')}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="ybs-led text-[9px]" style={{ animation: 'ybsLedBlink 1.2s ease-in-out infinite' }}>●</span>
              <span className="text-[10px] font-bold">CANLI</span>
            </div>
          </div>
          <div className="px-3 pt-2 pb-1">
            <div className="text-[10px] tracking-[3px] mb-1" style={{ color: 'rgba(255,140,0,0.6)' }}>{t('next_stop')}</div>
            <div className="overflow-hidden whitespace-nowrap">
              <div className="ybs-marquee-inner">
                {[0, 1].map(k => (
                  <span key={k} className="ybs-led font-black tracking-[4px] pr-10" style={{ fontSize: 20 }}>
                    ► {station.displayName.toLocaleUpperCase('tr-TR')}  ■  {t('leg').toLocaleUpperCase('tr-TR')} {station.leg}/{station.legsPerStation}  ■
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* Duraktaki bölüm ilerlemesi */}
          <div className="flex items-center gap-2 px-3 pb-2.5 pt-1">
            {Array.from({ length: station.legsPerStation }, (_, i) => (
              <span key={i} className="h-1.5 flex-1 rounded-full" style={{
                background: i < station.leg - 1 ? 'var(--led)' : i === station.leg - 1 ? 'rgba(255,140,0,0.55)' : 'rgba(255,140,0,0.15)'
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Ortada tek ana eylem */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
        <div className="relative w-24 h-24 mb-5 rounded-full flex items-center justify-center"
          style={{ animation: 'homeFloat 3s ease-in-out infinite', background: `radial-gradient(circle, ${station.color}26, transparent 70%)`, border: `1px solid ${station.color}55` }}>
          <span className="material-symbols-outlined text-[52px]" style={{ color: station.color, fontVariationSettings: "'FILL' 1", filter: `drop-shadow(0 0 12px ${station.color}88)` }}>{station.icon}</span>
        </div>
        <p className="text-white/60 text-[14px] font-semibold mb-5 text-center">{t('subtitle')}</p>
        <button onClick={onPlay} className="play-btn flex items-center gap-3">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
          <span className="flex flex-col items-start leading-tight">
            <span>{maxUnlockedLevel === 0 ? t('play') : t('continue_journey')}</span>
            <span className="text-[11px] font-bold opacity-80 tracking-wider">{t('level_short')} {maxUnlockedLevel + 1}</span>
          </span>
        </button>
      </div>

      {/* Alt sekme çubuğu */}
      <nav className="tab-bar shrink-0">
        {TABS.map(tab => {
          const locked = maxUnlockedLevel < tab.unlockAt;
          return (
            <button key={tab.id} onClick={() => openTab(tab)} className={`tab-item ${locked ? 'locked' : ''}`}>
              <span className="material-symbols-outlined text-[22px]">{locked ? 'lock' : tab.icon}</span>
              <span className="truncate max-w-full px-1">{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </nav>

      {/* Koleksiyon seçimi: Kasa ve Kayıp Eşya */}
      {showCollection && (
        <div className="fixed inset-0 z-[150] bg-black/60 flex items-end fade-in" onClick={() => setShowCollection(false)}>
          <div className="w-full rounded-t-3xl p-5 pb-8 flex flex-col gap-3" style={{ background: '#0b1428', borderTop: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-2" />
            <button onClick={() => setScreen('vault')} className="card-panel flex items-center gap-3 p-4 text-left active:scale-[0.98] transition-transform">
              <span className="material-symbols-outlined text-[28px] text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>savings</span>
              <span className="flex-1">
                <span className="block text-white font-extrabold text-[15px]">{t('vault')}</span>
                <span className="block text-white/55 text-[12px]">{vaultCount}/{VAULT_SIZE}</span>
              </span>
              <span className="material-symbols-outlined text-white/40">chevron_right</span>
            </button>
            <button onClick={() => setScreen('lostitems')} className="card-panel flex items-center gap-3 p-4 text-left active:scale-[0.98] transition-transform">
              <span className="material-symbols-outlined text-[28px] text-blue-400">search</span>
              <span className="flex-1">
                <span className="block text-white font-extrabold text-[15px]">Kayıp Eşya Ofisi</span>
                <span className="block text-white/55 text-[12px]">Setleri tamamla, kalıcı bonus kazan</span>
              </span>
              <span className="material-symbols-outlined text-white/40">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
