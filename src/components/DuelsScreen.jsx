import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import DuelGame from './DuelGame';
import { formatKurus } from '../utils/format';
import { DUEL_SECONDS, DUEL_WIN_REWARD, newDuelSeed, decodeDuel, compareScores, shareDuel } from '../utils/duel';

// Arkadaş düellosu (bağlantıyla). Tek ekran, tek ana düğme:
//  - gelen meydan okuma varsa: "Kabul et"
//  - cevap geldiyse: sonucu göster
//  - yoksa: "Meydan oku"
// Oyun → sonuç (VS kartı) → tek paylaş düğmesi.

const initials = (name) => (name || '?').trim().slice(0, 1).toLocaleUpperCase('tr-TR');

const Avatar = ({ name, color, crown }) => (
  <div className="flex flex-col items-center gap-1.5 min-w-0 w-full">
    <div className="relative">
      {crown && <span aria-hidden="true" className="absolute -top-5 left-1/2 -translate-x-1/2 text-[22px]">👑</span>}
      <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-white font-black text-[30px] border-4 border-white/90"
        style={{ background: color, boxShadow: '0 8px 20px rgba(0,0,0,0.35)' }}>
        {initials(name)}
      </div>
    </div>
    <p className="text-white font-extrabold text-[14px] truncate max-w-full">{name}</p>
  </div>
);

const VsBadge = () => (
  <div className="w-12 h-12 rounded-full bg-amber-400 text-[#10263f] font-black text-[18px] flex items-center justify-center shrink-0"
    style={{ boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.2), 0 6px 14px rgba(0,0,0,0.3)' }}>VS</div>
);

const Score = ({ s }) => s
  ? <p className="text-white/80 text-[13px] font-bold tabular-nums">{s.w} kelime · {s.t} sn</p>
  : <p className="text-white/40 text-[13px] font-bold">?</p>;

const DuelsScreen = ({ onBack }) => {
  const username = useGameStore(s => s.username);
  const cardName = useGameStore(s => s.cardName);
  const duels = useGameStore(s => s.duels);
  const saveDuel = useGameStore(s => s.saveDuel);
  const recordTopUp = useGameStore(s => s.recordTopUp);
  const incomingDuel = useGameStore(s => s.incomingDuel);
  const setSettings = useGameStore(s => s.setSettings);
  const myName = (username || cardName || 'Sen').slice(0, 16);

  const [view, setView] = useState('lobby'); // lobby | play | result
  const [active, setActive] = useState(null); // { seed, opponent?: {name, score} }
  const [result, setResult] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [paste, setPaste] = useState('');
  const [note, setNote] = useState(null);

  const incoming = incomingDuel ? decodeDuel(incomingDuel) : null;
  const known = incoming ? duels.find(d => d.seed === incoming.seed && d.role === 'sent') : null;
  const isReply = !!(incoming?.toScore && known);
  const wins = duels.filter(d => d.theirs && compareScores(d.mine, d.theirs) > 0).length;
  const losses = duels.filter(d => d.theirs && compareScores(d.mine, d.theirs) < 0).length;

  const clearIncoming = () => setSettings({ incomingDuel: null });
  const reward = (record) => {
    if (record.rewarded || compareScores(record.mine, record.theirs) <= 0) return record;
    recordTopUp('duel', DUEL_WIN_REWARD);
    return { ...record, rewarded: true };
  };

  const openReply = () => {
    const record = reward({ ...known, theirs: incoming.toScore, opponent: incoming.to, at: Date.now() });
    saveDuel(record);
    setResult({ mine: record.mine, theirs: record.theirs, opponent: incoming.to, final: true });
    clearIncoming();
    setView('result');
  };

  const play = (seed, opponent) => { setActive({ seed, opponent }); setView('play'); };

  const onFinish = (score) => {
    if (active.opponent) {
      const record = reward({ seed: active.seed, role: 'received', opponent: active.opponent.name, mine: score, theirs: active.opponent.score, at: Date.now() });
      saveDuel(record);
      clearIncoming();
      setResult({
        mine: score, theirs: active.opponent.score, opponent: active.opponent.name,
        link: { seed: active.seed, from: active.opponent.name, fromScore: active.opponent.score, to: myName, toScore: score },
      });
    } else {
      saveDuel({ seed: active.seed, role: 'sent', opponent: null, mine: score, theirs: null, at: Date.now() });
      setResult({ mine: score, link: { seed: active.seed, from: myName, fromScore: score } });
    }
    setView('result');
  };

  const share = async () => {
    const l = result.link;
    const text = l.toScore
      ? `${myName} düellonu oynadı: ${l.toScore.w} kelime, ${l.toScore.t} sn. Sonuca bak!`
      : `${myName} seni Turnike düellosuna çağırıyor: ${l.fromScore.w} kelime, ${l.fromScore.t} sn. Geçebilir misin?`;
    const r = await shareDuel(l, text);
    if (r === 'copied') setNote('Bağlantı kopyalandı. WhatsApp\'ta arkadaşına yapıştır.');
  };

  const openPasted = () => {
    if (!decodeDuel(paste)) { setNote('Bu bağlantı okunamadı.'); return; }
    setSettings({ incomingDuel: paste.trim() });
    setPaste(''); setShowCode(false); setNote(null);
  };

  if (view === 'play' && active) {
    return <DuelGame seed={active.seed} me={myName} opponent={active.opponent} onFinish={onFinish} onQuit={() => setView('lobby')} />;
  }

  const outcome = result?.theirs ? compareScores(result.mine, result.theirs) : null;

  return (
    <main className="duel-bg flex-1 w-full flex flex-col overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
      <header className="flex items-center justify-between px-4 pt-4 shrink-0">
        <button className="icon-btn" onClick={view === 'result' ? () => setView('lobby') : onBack} aria-label="Geri">
          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <span className="status-chip">🏆 {wins} · {losses} 💔</span>
      </header>

      <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto px-5 py-6 gap-6">
        {view === 'result' && result ? (
          <>
            <p className="text-center font-black text-[34px] tracking-tight fade-in"
              style={{ color: outcome == null ? '#ffffff' : outcome > 0 ? '#4ade80' : outcome < 0 ? '#fda4af' : '#fde047' }}>
              {outcome == null ? 'Skorun hazır!' : outcome > 0 ? 'KAZANDIN!' : outcome < 0 ? 'Kaybettin' : 'Berabere'}
            </p>
            <div className="flex items-start justify-between scale-in">
              <div className="flex flex-col items-center w-[38%]"><Avatar name={myName} color="#2563eb" crown={outcome > 0} /><Score s={result.mine} /></div>
              <div className="pt-3"><VsBadge /></div>
              <div className="flex flex-col items-center w-[38%]"><Avatar name={result.opponent || 'Arkadaşın'} color="#e11d48" crown={outcome < 0} /><Score s={result.theirs} /></div>
            </div>
            {outcome > 0 && <p className="text-center text-green-300 font-bold text-[14px]">+{formatKurus(DUEL_WIN_REWARD)} İstanbulkart'ına yüklendi</p>}
            {!result.final && (
              <button onClick={share} className="duel-btn w-full flex items-center justify-center gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-[24px]">send</span>
                {result.theirs ? 'SONUCU GÖNDER' : 'ARKADAŞINA GÖNDER'}
              </button>
            )}
            {result.final && (
              <button onClick={() => play(newDuelSeed())} className="duel-btn w-full flex items-center justify-center gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-[24px]">replay</span>RÖVANŞ
              </button>
            )}
            {note && <p role="status" className="text-center text-white/75 text-[13px] font-semibold">{note}</p>}
          </>
        ) : incoming && !isReply && !incoming.toScore ? (
          <>
            <p className="text-center text-white font-black text-[26px] leading-tight">{incoming.from}<br />seni düelloya çağırdı!</p>
            <div className="flex items-start justify-between">
              <div className="flex flex-col items-center w-[38%]"><Avatar name={incoming.from} color="#e11d48" /><Score s={incoming.fromScore} /></div>
              <div className="pt-3"><VsBadge /></div>
              <div className="flex flex-col items-center w-[38%]"><Avatar name={myName} color="#2563eb" /><Score s={null} /></div>
            </div>
            <p className="text-center text-white/70 text-[14px] font-semibold">Aynı bulmaca, {DUEL_SECONDS} saniye. Daha çok kelime bulan kazanır.</p>
            <button onClick={() => play(incoming.seed, { name: incoming.from, score: incoming.fromScore })} className="duel-btn w-full flex items-center justify-center gap-2">
              <span aria-hidden="true" className="material-symbols-outlined text-[24px]">swords</span>KABUL ET
            </button>
            <button onClick={clearIncoming} className="text-white/55 font-bold text-[13px]">Şimdi değil</button>
          </>
        ) : isReply ? (
          <>
            <p className="text-center text-white font-black text-[26px] leading-tight">{incoming.to}<br />düellonu oynadı!</p>
            <button onClick={openReply} className="duel-btn w-full">SONUCU GÖR</button>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div className="flex flex-col items-center w-[38%]"><Avatar name={myName} color="#2563eb" /></div>
              <div className="pt-3"><VsBadge /></div>
              <div className="flex flex-col items-center w-[38%]"><Avatar name="Arkadaşın" color="#64748b" /></div>
            </div>
            <ol className="flex flex-col gap-2 text-white/80 text-[14px] font-semibold">
              <li className="duel-step"><span>1</span>{DUEL_SECONDS} saniyede bulmacayı çöz</li>
              <li className="duel-step"><span>2</span>Bağlantıyı arkadaşına gönder</li>
              <li className="duel-step"><span>3</span>Aynı bulmacada seni geçmeye çalışsın</li>
            </ol>
            <button onClick={() => play(newDuelSeed())} className="duel-btn w-full flex items-center justify-center gap-2">
              <span aria-hidden="true" className="material-symbols-outlined text-[24px]">swords</span>MEYDAN OKU
            </button>
            <p className="text-center text-white/55 text-[12px] font-semibold -mt-3">Kazanana {formatKurus(DUEL_WIN_REWARD)} İstanbulkart bakiyesi</p>

            {showCode ? (
              <div className="flex gap-2">
                <input aria-label="Düello bağlantısı" value={paste} onChange={e => setPaste(e.target.value)} placeholder="Bağlantıyı yapıştır"
                  className="flex-1 min-w-0 rounded-full bg-white/10 border border-white/20 px-4 py-2.5 text-white text-[14px] outline-none focus:border-white/50" />
                <button onClick={openPasted} disabled={!paste.trim()} className="px-5 rounded-full bg-white text-[#10263f] font-black text-[13px] disabled:opacity-40">Aç</button>
              </div>
            ) : (
              <button onClick={() => setShowCode(true)} className="text-white/60 font-bold text-[13px] underline underline-offset-4">Bağlantım var</button>
            )}
            {note && <p role="status" className="text-center text-white/75 text-[13px] font-semibold">{note}</p>}
          </>
        )}
      </div>
    </main>
  );
};

export default DuelsScreen;
