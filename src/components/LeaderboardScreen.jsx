import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { cloudService } from '../utils/supabaseClient';

// Baseline Mock Data
const MOCK_LEADERBOARD = [
  { id: '1', username: 'MetroUstası', score: 12500, avatar: 'train' },
  { id: '2', username: 'SözcükAvcısı', score: 11200, avatar: 'sports_esports' },
  { id: '3', username: 'Makinist_34', score: 9800, avatar: 'directions_subway' },
  { id: '4', username: 'TurnikeKralı', score: 8500, avatar: 'stars' },
  { id: '5', username: 'VapurYolcusu', score: 7600, avatar: 'directions_boat' },
];

const LeaderboardScreen = ({ onBack }) => {
  const balance = useGameStore(state => state.balance);
  const username = useGameStore(state => state.username);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        // Gerçek verileri Supabase'den çek
        const realPlayers = await cloudService.getTopPlayers();
        
        // Kendi anlık skorumuzu hazırlayalım
        const myScore = {
          id: 'me',
          username: username || 'Sen (Misafir)',
          score: Math.floor(balance), 
          avatar: 'person',
          isMe: true
        };
        
        // Eğer Supabase'de hiç veri yoksa Mock'u kullan, varsa gerçekleri al
        let combined = [];
        if (realPlayers.length > 0) {
          // Gerçek oyuncular + Benim anlık skorum (Eğer gerçek listede yoksam diye)
          // Gerçek listede kendimiz varsak isMe bayrağı ekleyelim
          const mappedRealPlayers = realPlayers.map((p, idx) => ({
            id: `real_${idx}`,
            username: p.username,
            score: p.score,
            avatar: 'person',
            isMe: p.username === username
          }));
          
          // Eğer kendimizi sunucudan çekemediysek ama lokal skorumuz varsa, listeye geçici ekleyelim
          if (!mappedRealPlayers.some(p => p.username === username)) {
             combined = [...mappedRealPlayers, myScore];
          } else {
             combined = mappedRealPlayers;
          }
        } else {
          // Veritabanı boş veya ayarlanamamışsa mock veriler + ben
          combined = [...MOCK_LEADERBOARD, myScore];
        }

        combined.sort((a, b) => b.score - a.score);
        
        // Aynı isimli mükerrer kayıtları engelle (upsert bazen eski mock vs karışırsa)
        const uniqueData = combined.filter((v, i, a) => a.findIndex(t => (t.username === v.username)) === i);
        
        setData(uniqueData.slice(0, 10)); // Sadece ilk 10
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [balance, username]);

  return (
    <div className="flex-1 w-full flex flex-col items-center game-bg relative z-20 fade-in pt-8 pb-6 px-4">
      {/* Üst Kısım */}
      <div className="w-full flex items-center justify-between mb-6 max-w-sm px-2">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-full border border-white/10 active:scale-95 transition-all text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-black text-white tracking-widest font-orbitron text-center flex-1">
          LİDERLİK
        </h2>
        <div className="w-[50px]"></div>
      </div>

      {/* Kupa Görseli */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative w-24 h-24 flex flex-col items-center justify-center mb-2">
          <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-[30px]"></div>
          <span className="material-symbols-outlined text-[64px] text-yellow-400 relative z-10 float-slow" style={{ fontVariationSettings: "'FILL' 1" }}>
            trophy
          </span>
        </div>
        <p className="text-white/50 text-[11px] font-black tracking-[4px] uppercase text-center">
          Haftalık Sıralama
        </p>
      </div>

      {/* Liste */}
      <div className="w-full max-w-sm flex-1 overflow-y-auto px-1 flex flex-col gap-3 pb-8 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a110a]/50 z-20 backdrop-blur-sm rounded-2xl">
            <span className="material-symbols-outlined animate-spin text-green-400 text-3xl">sync</span>
          </div>
        )}
        {data.map((player, index) => {
          const isTop3 = index < 3;
          const rankColor = index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : '#334155';
          
          return (
            <div 
              key={player.id}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-transform ${player.isMe ? 'scale-105 my-2 shadow-lg z-10' : ''}`}
              style={{
                background: player.isMe ? 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(21,128,61,0.2))' : 'rgba(255,255,255,0.03)',
                border: player.isMe ? '1.5px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.05)',
                boxShadow: player.isMe ? '0 0 20px rgba(34,197,94,0.2)' : 'none',
              }}
            >
              {/* Sıra Numarası */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border-2 shrink-0"
                style={{
                  background: isTop3 ? rankColor : 'transparent',
                  borderColor: rankColor,
                  color: isTop3 ? '#000' : '#fff'
                }}
              >
                {index + 1}
              </div>

              {/* Avatar & İsim */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]" style={{ color: player.isMe ? '#4ade80' : '#94a3b8' }}>
                    {player.avatar}
                  </span>
                  <h3 className={`font-bold text-[15px] truncate ${player.isMe ? 'text-green-400' : 'text-white'}`}>
                    {player.username}
                  </h3>
                </div>
              </div>

              {/* Puan */}
              <div className="text-right shrink-0">
                <p className="text-white font-black text-[16px] tracking-wider">{player.score}</p>
                <p className="text-white/30 text-[9px] font-bold tracking-widest uppercase">PUAN</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default LeaderboardScreen;
