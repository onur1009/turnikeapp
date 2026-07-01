import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const UsernameModal = () => {
  const { setUsername } = useGameStore();
  const [inputName, setInputName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = inputName.trim();
    if (cleanName.length < 3) {
      setError('En az 3 karakter olmalı');
      return;
    }
    if (cleanName.length > 15) {
      setError('En fazla 15 karakter olmalı');
      return;
    }
    // Basit bir regex (sadece harf, rakam ve alt tire)
    if (!/^[a-zA-Z0-9_]+$/.test(cleanName)) {
      setError('Sadece harf, rakam ve alt tire (_) kullanın');
      return;
    }
    
    setUsername(cleanName);
    setTimeout(() => {
      useGameStore.getState().syncCloud();
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm fade-in touch-none">
      <div 
        className="w-full max-w-[320px] rounded-3xl p-6 relative flex flex-col items-center shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #0a150a, #030a05)',
          border: '1px solid rgba(34,197,94,0.3)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 40px rgba(34, 197, 94, 0.15)'
        }}
      >
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/30">
          <span className="material-symbols-outlined text-4xl text-green-400">person_add</span>
        </div>
        
        <h2 className="text-xl font-black text-white text-center mb-2 tracking-wide font-orbitron">
          LİDERLİK İÇİN<br/>KULLANICI ADI
        </h2>
        <p className="text-white/60 text-sm text-center mb-6 px-2">
          Dünya sıralamasında görünmek için kendine bir ad seç.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <input
            type="text"
            value={inputName}
            onChange={(e) => { setInputName(e.target.value); setError(''); }}
            placeholder="Kullanıcı Adın"
            className="w-full bg-black/40 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-center focus:outline-none focus:border-green-400 transition-colors mb-2 placeholder-white/20 font-bold"
            autoFocus
          />
          {error && <p className="text-red-400 text-xs mb-3 text-center w-full">{error}</p>}
          
          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-xl font-bold text-white text-sm tracking-wide bg-green-600 hover:bg-green-500 transition-colors"
          >
            KAYDET VE BAŞLA
          </button>
        </form>
      </div>
    </div>
  );
};

export default UsernameModal;
