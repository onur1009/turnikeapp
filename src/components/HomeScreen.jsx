import SceneBackground from './SceneBackground';
import TipBubble from './TipBubble';
import HomeTrain from './HomeTrain';
import ConsentSheet from './ConsentSheet';
import MissionsSheet, { useMissionProgress } from './MissionsSheet';
import { todayKey, dayNumber } from '../utils/daily';
import { currentEvent, timeLeft } from '../utils/events';
import EventSheet from './EventSheet';
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
  const [showMissions, setShowMissions] = useState(false);
  const [showEvent, setShowEvent] = useState(false);
  const event = currentEvent();
  const postcardCount = useGameStore(state => state.postcards.length);
  const dailySolved = useGameStore(state => !!state.dailyResults[todayKey()]);
  const { ready: missionsReady, doneCount } = useMissionProgress();

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
    <div className="game-bg scenic h-full flex flex-col relative z-10 fade-in overflow-hidden">
      <SceneBackground station={station} />
      <style>{`
        @keyframes ybsMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes ybsLedBlink { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes homeFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .ybs-marquee-inner { display: inline-block; white-space: nowrap; animation: ybsMarquee 14s linear infinite; }
      `}</style>

      {/* Üst çubuk */}
      <header className="flex items-center justify-between gap-2 px-4 pt-6 pb-3 shrink-0">
        <button className={`balance-pill active:scale-95 transition-transform ${flashBalance ? 'balance-flash' : ''}`} onClick={() => setScreen('akbil')}>
          <span aria-hidden="true" className="material-symbols-outlined text-[16px]" style={{ color: 'var(--coin)', fontVariationSettings: "'FILL' 1" }}>toll</span>
          <AnimatedBalance value={balance} />
        </button>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <span className="status-chip" title="Seri">🔥 {streak}</span>
          )}
          <button className="icon-btn" onClick={() => setScreen('stats')} aria-label={t('stats')}>
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">bar_chart</span>
          </button>
          <button className="icon-btn" onClick={() => setScreen('settings')} aria-label={t('settings')}>
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">settings</span>
          </button>
        </div>
      </header>

      {/* YBS panosu: gerçek hat ve sıradaki durak */}
      <div className="px-4 shrink-0">
        <div className="ybs-display">
          <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', borderLeft: `4px solid ${station.color}` }}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="line-badge" style={{ background: station.color, fontFamily: 'inherit' }}>{station.code}</span>
              <span className="ybs-led text-[11px] font-black tracking-[1px] truncate">{station.name.toLocaleUpperCase('tr-TR')}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="ybs-led text-[9px]" style={{ animation: 'ybsLedBlink 1.2s ease-in-out infinite' }}>●</span>
              <span className="text-[10px] font-bold">CANLI</span>
            </div>
          </div>
          <div className="px-3 pt-2 pb-1">
            <div className="text-[10px] tracking-[3px] mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>{t('next_stop')}</div>
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
                background: i < station.leg - 1 ? station.color : i === station.leg - 1 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.15)'
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Ortada tek ana eylem */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
        <HomeTrain station={station} />
        <p className="text-white/75 text-[14px] font-semibold mb-5 text-center" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{t('subtitle')}</p>
        {/* İki ana eylem: yolculuğa devam ve düello */}
        <div className="w-full max-w-[340px] flex flex-col gap-3">
          {event && (
            <button onClick={() => setShowEvent(true)} className="event-strip" style={{ background: event.color }}>
              <span aria-hidden="true" className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{event.icon}</span>
              <span className="flex-1 min-w-0 text-left leading-tight">
                <span className="block font-black text-[14px] truncate">{event.name} · 2x</span>
                <span className="block text-[11px] font-bold opacity-85">{timeLeft(event.endsAt)} kaldı</span>
              </span>
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          )}
          {/* Günlük ritim: Günün Seferi ve görevler */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setScreen('daily')} className="home-chip" aria-label={`Günün Seferi #${dayNumber()}`}>
              <span aria-hidden="true" className="material-symbols-outlined text-[22px] text-amber-300" style={{ fontVariationSettings: "'FILL' 1" }}>{dailySolved ? 'event_available' : 'today'}</span>
              <span className="flex flex-col items-start leading-tight min-w-0">
                <span className="font-black text-[13px]">Günün Seferi</span>
                <span className="text-[11px] font-bold opacity-75">{dailySolved ? 'Çözüldü ✓' : `#${dayNumber()} hazır`}</span>
              </span>
              {!dailySolved && <span className="home-dot" aria-hidden="true" />}
            </button>
            <button onClick={() => setShowMissions(true)} className="home-chip">
              <span aria-hidden="true" className="material-symbols-outlined text-[22px] text-green-300" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
              <span className="flex flex-col items-start leading-tight min-w-0">
                <span className="font-black text-[13px]">Görevler</span>
                <span className="text-[11px] font-bold opacity-75">{doneCount}/3 tamam</span>
              </span>
              {missionsReady > 0 && <span className="home-badge">{missionsReady}</span>}
            </button>
          </div>
          <button onClick={onPlay} className="play-btn w-full flex items-center justify-center gap-3">
            <span aria-hidden="true" className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            <span className="flex flex-col items-start leading-tight">
              <span>{maxUnlockedLevel === 0 ? t('play') : t('continue_journey')}</span>
              <span className="text-[11px] font-bold opacity-80 tracking-wider">{t('level_short')} {maxUnlockedLevel + 1}</span>
            </span>
          </button>
          <TipBubble id="tip-duel" when={maxUnlockedLevel >= 5}>
            Arkadaşına meydan oku: aynı bulmacayı kim daha hızlı çözecek?
          </TipBubble>
          <button onClick={() => setScreen('duels')} className="duel-btn w-full flex items-center justify-center gap-3">
            <span aria-hidden="true" className="material-symbols-outlined text-[26px]">swords</span>
            <span className="flex flex-col items-start leading-tight">
              <span>DÜELLO</span>
              <span className="text-[11px] font-bold opacity-85 tracking-wider">Arkadaşına meydan oku</span>
            </span>
          </button>
        </div>
      </div>

      {/* Alt sekme çubuğu */}
      <nav className="tab-bar shrink-0">
        {TABS.map(tab => {
          const locked = maxUnlockedLevel < tab.unlockAt;
          return (
            <button key={tab.id} onClick={() => openTab(tab)} className={`tab-item ${locked ? 'locked' : ''}`}>
              <span aria-hidden="true" className="material-symbols-outlined text-[22px]">{locked ? 'lock' : tab.icon}</span>
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
            <button onClick={() => setScreen('postcards')} className="card-panel flex items-center gap-3 p-4 text-left active:scale-[0.98] transition-transform">
              <span aria-hidden="true" className="material-symbols-outlined text-[28px] text-amber-300" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
              <span className="flex-1">
                <span className="block text-white font-bold">Kartpostallarım</span>
                <span className="block text-white/55 text-[12px] font-semibold">{postcardCount} durak kartpostalı</span>
              </span>
            </button>
            <button onClick={() => setScreen('vault')} className="card-panel flex items-center gap-3 p-4 text-left active:scale-[0.98] transition-transform">
              <span aria-hidden="true" className="material-symbols-outlined text-[28px] text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>savings</span>
              <span className="flex-1">
                <span className="block text-white font-extrabold text-[15px]">{t('vault')}</span>
                <span className="block text-white/55 text-[12px]">{vaultCount}/{VAULT_SIZE}</span>
              </span>
              <span aria-hidden="true" className="material-symbols-outlined text-white/40">chevron_right</span>
            </button>
            <button onClick={() => setScreen('lostitems')} className="card-panel flex items-center gap-3 p-4 text-left active:scale-[0.98] transition-transform">
              <span aria-hidden="true" className="material-symbols-outlined text-[28px] text-blue-400">search</span>
              <span className="flex-1">
                <span className="block text-white font-extrabold text-[15px]">Kayıp Eşya Ofisi</span>
                <span className="block text-white/55 text-[12px]">Setleri tamamla, kalıcı bonus kazan</span>
              </span>
              <span aria-hidden="true" className="material-symbols-outlined text-white/40">chevron_right</span>
            </button>
          </div>
        </div>
      )}
      {showMissions && <MissionsSheet onClose={() => setShowMissions(false)} onOpenPass={() => setScreen('pass')} />}
      {showEvent && event && <EventSheet event={event} onClose={() => setShowEvent(false)} onPlay={() => { setShowEvent(false); onPlay(); }} />}
      <ConsentSheet />
    </div>
  );
}
