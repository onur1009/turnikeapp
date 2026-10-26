import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { cloudService } from '../utils/supabaseClient';
import ScreenHeader from './ScreenHeader';

const FETCH_TIMEOUT_MS = 8000;

// Sunucu cevap vermezse sonsuza dek dönmesin
const withTimeout = (promise) => Promise.race([
  promise,
  new Promise(resolve => setTimeout(() => resolve(null), FETCH_TIMEOUT_MS)),
]);

const LeaderboardScreen = ({ onBack }) => {
  const balance = useGameStore(state => state.balance);
  const username = useGameStore(state => state.username);
  const [data, setData] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'offline'

  const fetchLeaderboard = useCallback(async () => {
    setStatus('loading');
    const realPlayers = await withTimeout(cloudService.getTopPlayers());
    if (realPlayers === null) {
      // Eskiden burada sahte oyuncular gösteriliyordu; artık dürüstçe bağlantı yok diyoruz
      setStatus('offline');
      return;
    }

    const players = realPlayers.map((p, idx) => ({
      id: `real_${idx}`,
      username: p.username,
      score: p.score,
      isMe: p.username === username
    }));
    // Kendi skorumuz sunucuda henüz yoksa listeye yerel değerle ekle
    if (username && !players.some(p => p.isMe)) {
      players.push({ id: 'me', username, score: Math.floor(balance), isMe: true });
    }
    players.sort((a, b) => b.score - a.score);
    setData(players.slice(0, 10));
    setStatus('ready');
  }, [balance, username]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  return (
    <div className="flex-1 w-full flex flex-col items-center relative z-20 fade-in pb-6 px-4">
      <ScreenHeader title="Liderlik" onBack={onBack} className="px-0 pt-6 mb-4 max-w-sm" />

      <div className="flex flex-col items-center mb-5">
        <span aria-hidden="true" className="material-symbols-outlined text-[56px] text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
        <p className="text-white/55 text-[12px] font-bold tracking-[3px] uppercase mt-1">En çok bakiye biriktirenler</p>
      </div>

      <div className="w-full max-w-sm flex-1 overflow-y-auto flex flex-col gap-2.5 pb-8">
        {status === 'loading' && (
          <div className="flex-1 flex items-center justify-center py-16">
            <span aria-hidden="true" className="material-symbols-outlined animate-spin text-green-400 text-3xl">sync</span>
          </div>
        )}

        {status === 'offline' && (
          <div className="card-panel p-6 flex flex-col items-center text-center gap-3">
            <span aria-hidden="true" className="material-symbols-outlined text-[40px] text-white/40">wifi_off</span>
            <p className="text-white font-bold text-[15px]">Bağlantı kurulamadı</p>
            <p className="text-white/55 text-[13px]">Sıralamayı görmek için internet bağlantını kontrol et.</p>
            <button onClick={fetchLeaderboard} className="mt-1 px-5 py-2.5 rounded-full bg-green-600 text-white font-bold text-[13px] active:scale-95 transition-transform">
              Tekrar dene
            </button>
          </div>
        )}

        {status === 'ready' && data.length === 0 && (
          <div className="card-panel p-6 text-center text-white/60 text-[14px]">
            Henüz sıralamada kimse yok. Bir seviye bitir, listeye ilk sen gir!
          </div>
        )}

        {status === 'ready' && data.map((player, index) => {
          const isTop3 = index < 3;
          const rankColor = index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : '#334155';
          return (
            <div
              key={player.id}
              className="w-full p-3 rounded-2xl flex items-center gap-3"
              style={{
                background: player.isMe ? 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(21,128,61,0.2))' : 'var(--surface)',
                border: player.isMe ? '1.5px solid rgba(34,197,94,0.5)' : '1px solid var(--border)',
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-black text-[15px] border-2 shrink-0"
                style={{ background: isTop3 ? rankColor : 'transparent', borderColor: rankColor, color: isTop3 ? '#000' : '#fff' }}
              >
                {index + 1}
              </div>
              <h3 className={`flex-1 min-w-0 font-bold text-[15px] truncate ${player.isMe ? 'text-green-400' : 'text-white'}`}>
                {player.username}
              </h3>
              <p className="text-white font-black text-[15px] tabular-nums shrink-0">{player.score}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaderboardScreen;
