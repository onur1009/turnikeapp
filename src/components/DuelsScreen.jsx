import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import ScreenHeader from './ScreenHeader';
import DuelGame from './DuelGame';
import { formatKurus } from '../utils/format';
import { DUEL_SECONDS, DUEL_WIN_REWARD, newDuelSeed, decodeDuel, compareScores, shareDuel } from '../utils/duel';

// Arkadaş düelloları (bağlantıyla). Ekranlar: liste → oyun → sonuç.
// incoming: açılışta ?duel= ile gelen ya da yapıştırılan düello.
const scoreText = (s) => `${s.w} kelime · ${s.t} sn`;

const ResultCard = ({ me, them, myName, theirName }) => {
  const r = compareScores(me, them);
  return (
    <div className="card-panel !rounded-2xl p-4">
      <p className="text-center font-black text-[22px] mb-3" style={{ color: r > 0 ? '#4ade80' : r < 0 ? '#f87171' : '#fbbf24' }}>
        {r > 0 ? 'Kazandın!' : r < 0 ? 'Kaybettin' : 'Berabere'}
      </p>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl p-3 bg-white/5"><p className="text-white/60 text-[12px] font-bold truncate">{myName} (sen)</p><p className="text-white font-black text-[16px]">{scoreText(me)}</p></div>
        <div className="rounded-xl p-3 bg-white/5"><p className="text-white/60 text-[12px] font-bold truncate">{theirName}</p><p className="text-white font-black text-[16px]">{scoreText(them)}</p></div>
      </div>
    </div>
  );
};

const DuelsScreen = ({ onBack }) => {
  const username = useGameStore(s => s.username);
  const cardName = useGameStore(s => s.cardName);
  const duels = useGameStore(s => s.duels);
  const saveDuel = useGameStore(s => s.saveDuel);
  const recordTopUp = useGameStore(s => s.recordTopUp);
  const incomingDuel = useGameStore(s => s.incomingDuel);
  const setSettings = useGameStore(s => s.setSettings);
  const myName = (username || cardName || 'Yolcu').slice(0, 16);

  const [view, setView] = useState('list'); // list | play | result
  const [active, setActive] = useState(null); // { seed, opponent?: {name, score} }
  const [result, setResult] = useState(null); // { duel, myScore, theirScore? }
  const [paste, setPaste] = useState('');
  const [note, setNote] = useState(null);

  // Gelen bağlantı: cevap mı (iki skor da var), meydan okuma mı?
  const incoming = incomingDuel ? decodeDuel(incomingDuel) : null;
  const known = incoming ? duels.find(d => d.seed === incoming.seed) : null;
  const isReplyToMe = incoming && incoming.toScore && known?.role === 'sent';

  const clearIncoming = () => setSettings({ incomingDuel: null });

  const giveReward = (record) => {
    if (record.rewarded) return record;
    recordTopUp('duel', DUEL_WIN_REWARD);
    return { ...record, rewarded: true };
  };

  // Gönderdiğim düellonun cevabı geldi: sonucu kaydet, kazandıysam ödül
  const acceptReply = () => {
    let record = { ...known, theirs: incoming.toScore, opponent: incoming.to, at: Date.now() };
    if (compareScores(record.mine, record.theirs) > 0) record = giveReward(record);
    saveDuel(record);
    setResult({ duel: { seed: incoming.seed }, myScore: record.mine, theirScore: record.theirs, theirName: incoming.to, final: true });
    clearIncoming();
    setView('result');
  };

  const startNew = () => { setActive({ seed: newDuelSeed() }); setView('play'); };
  const startChallenge = (d) => {
    setActive({ seed: d.seed, opponent: { name: d.from, score: d.fromScore } });
    clearIncoming();
    setView('play');
  };

  const onFinish = (score) => {
    if (active.opponent) {
      // Meydan okumaya cevap: sonucu hemen gör, cevabı geri gönder
      let record = { seed: active.seed, role: 'received', opponent: active.opponent.name, mine: score, theirs: active.opponent.score, at: Date.now() };
      if (compareScores(score, active.opponent.score) > 0) record = giveReward(record);
      saveDuel(record);
      setResult({ duel: { seed: active.seed, from: active.opponent.name, fromScore: active.opponent.score, to: myName, toScore: score }, myScore: score, theirScore: active.opponent.score, theirName: active.opponent.name });
    } else {
      saveDuel({ seed: active.seed, role: 'sent', opponent: null, mine: score, theirs: null, at: Date.now() });
      setResult({ duel: { seed: active.seed, from: myName, fromScore: score }, myScore: score });
    }
    setView('result');
  };

  const share = async () => {
    const d = result.duel;
    const text = d.toScore
      ? `${myName}: ${scoreText(d.toScore)} — senin skorun ${scoreText(d.fromScore)}. Sonuca bak!`
      : `${myName} seni Turnike düellosuna çağırıyor: ${scoreText(d.fromScore)}. Geçebilir misin?`;
    const r = await shareDuel(d, text);
    if (r === 'copied') setNote('Bağlantı kopyalandı, arkadaşına yapıştır.');
  };

  const openPasted = () => {
    const d = decodeDuel(paste);
    if (!d) { setNote('Bu bağlantı ya da kod okunamadı.'); return; }
    setSettings({ incomingDuel: paste.trim() });
    setPaste('');
    setNote(null);
  };

  if (view === 'play' && active) {
    return <DuelGame seed={active.seed} opponent={active.opponent} onFinish={onFinish} onQuit={() => setView('list')} />;
  }

  return (
    <main className="flex-1 w-full overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
      <div className="w-full max-w-sm mx-auto px-4 pb-8">
        <ScreenHeader title="Düellolar" onBack={view === 'result' ? () => setView('list') : onBack} className="px-0" />

        {view === 'result' && result && (
          <div className="flex flex-col gap-3 fade-in">
            {result.theirScore
              ? <ResultCard me={result.myScore} them={result.theirScore} myName={myName} theirName={result.theirName} />
              : (
                <div className="card-panel !rounded-2xl p-4 text-center">
                  <p className="text-white/60 text-[13px] font-bold">Skorun</p>
                  <p className="text-white font-black text-[26px]">{scoreText(result.myScore)}</p>
                  <p className="text-white/60 text-[13px] font-semibold mt-1">Bağlantıyı arkadaşına gönder; aynı bulmacayı çözsün.</p>
                </div>
              )}
            {result.theirScore && compareScores(result.myScore, result.theirScore) > 0 && (
              <p className="text-center text-green-300 font-bold text-[13px]">+{formatKurus(DUEL_WIN_REWARD)} İstanbulkart'ına yüklendi</p>
            )}
            {!result.final && (
              <button onClick={share} className="w-full py-3.5 rounded-full bg-green-600 text-white font-black text-[15px] active:scale-95 transition-transform flex items-center justify-center gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">share</span>
                {result.theirScore ? 'Sonucu arkadaşına gönder' : 'Arkadaşına meydan oku'}
              </button>
            )}
            {note && <p role="status" className="text-center text-white/70 text-[13px] font-semibold">{note}</p>}
          </div>
        )}

        {view === 'list' && (
          <div className="flex flex-col gap-3">
            {incoming && (isReplyToMe ? (
              <div className="card-panel !rounded-2xl p-4 fade-in">
                <p className="text-white font-extrabold text-[15px]">{incoming.to} düellonu oynadı</p>
                <p className="text-white/60 text-[13px] font-semibold mb-3">Sonucu görmek için aç.</p>
                <button onClick={acceptReply} className="w-full py-3 rounded-full bg-green-600 text-white font-black text-[14px]">Sonucu gör</button>
              </div>
            ) : incoming.toScore ? (
              <div className="card-panel !rounded-2xl p-4 fade-in">
                <p className="text-white font-extrabold text-[15px]">{incoming.from} – {incoming.to}</p>
                <p className="text-white/60 text-[13px] font-semibold">{scoreText(incoming.fromScore)} / {scoreText(incoming.toScore)}</p>
                <button onClick={clearIncoming} className="mt-3 w-full py-2.5 rounded-full bg-white/10 text-white font-bold text-[13px]">Tamam</button>
              </div>
            ) : (
              <div className="card-panel !rounded-2xl p-4 fade-in" style={{ borderColor: '#e11d48' }}>
                <p className="text-white font-extrabold text-[16px]">⚔️ {incoming.from} seni düelloya çağırdı</p>
                <p className="text-white/65 text-[13px] font-semibold mb-3">Skoru: {scoreText(incoming.fromScore)}. Aynı bulmaca, {DUEL_SECONDS} saniye.</p>
                <button onClick={() => startChallenge(incoming)} className="w-full py-3 rounded-full bg-rose-600 text-white font-black text-[14px] active:scale-95 transition-transform">Kabul et ve oyna</button>
              </div>
            ))}

            <button onClick={startNew} className="w-full py-4 rounded-2xl bg-rose-600 text-white font-black text-[16px] active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
              <span aria-hidden="true" className="material-symbols-outlined text-[22px]">swords</span>
              Yeni düello başlat
            </button>
            <p className="text-white/55 text-[12px] font-semibold text-center -mt-1">
              Bulmacayı çöz, bağlantıyı WhatsApp vb. ile gönder. Kazanana {formatKurus(DUEL_WIN_REWARD)}.
            </p>

            <div className="card-panel !rounded-2xl p-3">
              <label className="kart-label block" htmlFor="duel-paste">Bağlantı ya da kod yapıştır</label>
              <div className="flex gap-2">
                <input id="duel-paste" value={paste} onChange={e => setPaste(e.target.value)} placeholder="https://…?duel=…"
                  className="flex-1 min-w-0 rounded-xl bg-white/10 border border-white/15 px-3 py-2.5 text-white text-[14px] outline-none focus:border-white/40" />
                <button onClick={openPasted} disabled={!paste.trim()} className="px-4 rounded-xl bg-white text-[#10263f] font-black text-[13px] disabled:opacity-40">Aç</button>
              </div>
              {note && view === 'list' && <p role="status" className="text-white/70 text-[12px] font-semibold mt-2">{note}</p>}
            </div>

            <h2 className="kart-label mt-2">Geçmiş düellolar</h2>
            {duels.length === 0 ? (
              <p className="text-white/45 text-[13px] font-semibold">Henüz düello yok.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {duels.map(d => {
                  const r = d.theirs ? compareScores(d.mine, d.theirs) : null;
                  return (
                    <li key={`${d.seed}-${d.role}`} className="flex items-center justify-between rounded-xl px-3 py-2.5 bg-white/5">
                      <span className="min-w-0">
                        <span className="block text-white/90 text-[13px] font-bold truncate">{d.opponent || 'Cevap bekleniyor'}</span>
                        <span className="block text-white/45 text-[11px] font-semibold">Sen: {scoreText(d.mine)}{d.theirs ? ` · Rakip: ${scoreText(d.theirs)}` : ''}</span>
                      </span>
                      <span className="text-[12px] font-black shrink-0" style={{ color: r == null ? 'rgba(255,255,255,0.5)' : r > 0 ? '#4ade80' : r < 0 ? '#f87171' : '#fbbf24' }}>
                        {r == null ? 'Bekliyor' : r > 0 ? 'Kazandın' : r < 0 ? 'Kaybettin' : 'Berabere'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default DuelsScreen;
