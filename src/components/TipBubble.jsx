import React from 'react';
import { useGameStore } from '../store/gameStore';

// Bir kez gösterilen ipucu baloncuğu (ilk oturum rehberi). Okundu deyince seenTips'e yazılır
// ve bir daha çıkmaz. `when` false ise hiç görünmez.
export default function TipBubble({ id, when = true, children, className = '' }) {
  const seen = useGameStore(s => s.seenTips.includes(id));
  if (!when || seen) return null;
  const dismiss = () => useGameStore.setState(s => ({ seenTips: [...s.seenTips, id] }));
  return (
    <div role="status" className={`tip-bubble fade-in ${className}`}>
      <span className="flex-1">{children}</span>
      <button onClick={dismiss} className="tip-ok">Tamam</button>
    </div>
  );
}
