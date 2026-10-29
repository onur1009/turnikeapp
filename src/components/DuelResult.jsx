import React, { useEffect } from 'react';
import { formatKurus } from '../utils/format';
import { compareScores, DUEL_WIN_REWARD } from '../utils/duel';
import { LEAGUE_POINTS } from '../utils/league';
import { PASS_XP } from '../utils/pass';
import { playWin, playLose } from '../utils/soundManager';

// Düello sonucu: kim kazandı, iki skorun karşılaştırması, farkın nereden geldiği, kazanılanlar
// ve sıradaki adım. Kazanınca konfeti ve fanfar; kaybedince ne kadar yaklaştığı.
const initials = (n) => (n || '?').trim().slice(0, 1).toLocaleUpperCase('tr-TR');

const gapText = (me, them, r) => {
  if (r === 0) return 'Aynı kelime, aynı süre: tam bir berabere!';
  const dw = me.w - them.w;
  if (dw !== 0) return `${Math.abs(dw)} kelime ${r > 0 ? 'farkla kazandın' : 'farkla kaçırdın'}`;
  const dt = Math.abs(me.t - them.t);
  return r > 0 ? `Aynı kelime sayısı, ${dt} sn daha hızlıydın` : `Aynı kelime sayısı, ${dt} sn geç kaldın`;
};

export default function DuelResult({ myName, opponent, mine, theirs, streak, children }) {
  const r = theirs ? compareScores(mine, theirs) : null;
  useEffect(() => { if (r > 0) playWin(); else if (r != null && r < 0) playLose(); }, [r]);
  const tone = r == null ? 'pending' : r > 0 ? 'win' : r < 0 ? 'lose' : 'draw';
  const title = { pending: 'Skorun hazır!', win: 'KAZANDIN!', lose: 'Az kaldı!', draw: 'Berabere' }[tone];

  return (
    <div className={`duel-result is-${tone}`}>
      {tone === 'win' && (
        <div className="duel-confetti" aria-hidden="true">
          {Array.from({ length: 28 }, (_, i) => <span key={i} style={{ '--x': `${(i * 37) % 100}%`, '--d': `${(i % 7) * 0.12}s`, '--c': ['#fde047', '#4ade80', '#60a5fa', '#f472b6', '#fb923c'][i % 5] }} />)}
        </div>
      )}
      <span aria-hidden="true" className="material-symbols-outlined duel-result-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
        {{ pending: 'hourglass_top', win: 'emoji_events', lose: 'directions_subway', draw: 'handshake' }[tone]}
      </span>
      <h2 className="duel-result-title">{title}</h2>
      {theirs && <p className="duel-result-gap">{gapText(mine, theirs, r)}</p>}

      {/* Skor tablosu */}
      <div className="duel-board" role="table" aria-label="Düello skorları">
        <div className="duel-board-row head" role="row">
          <span role="columnheader" />
          <span role="columnheader" className="me"><i>{initials(myName)}</i>{myName}</span>
          <span role="columnheader" className="them"><i>{initials(opponent)}</i>{opponent || 'Arkadaşın'}</span>
        </div>
        <div className="duel-board-row" role="row">
          <span role="rowheader">Kelime</span>
          <b className={theirs && mine.w > theirs.w ? 'best' : ''}>{mine.w}</b>
          <b className={theirs && theirs.w > mine.w ? 'best' : ''}>{theirs ? theirs.w : '?'}</b>
        </div>
        <div className="duel-board-row" role="row">
          <span role="rowheader">Süre</span>
          <b className={theirs && mine.w === theirs.w && mine.t < theirs.t ? 'best' : ''}>{mine.t} sn</b>
          <b className={theirs && mine.w === theirs.w && theirs.t < mine.t ? 'best' : ''}>{theirs ? `${theirs.t} sn` : '?'}</b>
        </div>
      </div>

      {tone === 'win' && (
        <div className="duel-gains">
          <span><b>+{formatKurus(DUEL_WIN_REWARD)}</b>kart</span>
          <span><b>+{LEAGUE_POINTS.duelWin}</b>lig</span>
          <span><b>+{PASS_XP.duelWin}</b>XP</span>
          {streak > 1 && <span><b>🔥 {streak}</b>seri</span>}
        </div>
      )}
      {tone === 'lose' && <p className="duel-result-tip">Rövanşta kısa kelimelerle başla, uzun kökü sona bırak.</p>}
      {tone === 'pending' && <p className="duel-result-tip">Bağlantıyı gönder; arkadaşın aynı bulmacayı çözünce sonucu burada görürsün.</p>}

      <div className="w-full flex flex-col gap-2.5 mt-1">{children}</div>
    </div>
  );
}
