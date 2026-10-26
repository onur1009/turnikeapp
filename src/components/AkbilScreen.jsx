import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../utils/i18n';
import ScreenHeader from './ScreenHeader';
import { formatKurus } from '../utils/format';

const SHOW_STORE_FEATURES = false;

const CARD_COLORS = [
  { id: '#1d4ed8', name: 'Mavi', nameEn: 'Blue' },
  { id: '#dc2626', name: 'Kırmızı', nameEn: 'Red' },
  { id: '#16a34a', name: 'Yeşil', nameEn: 'Green' },
  { id: '#ea580c', name: 'Turuncu', nameEn: 'Orange' },
  { id: '#7c3aed', name: 'Mor', nameEn: 'Purple' },
  { id: '#0f172a', name: 'Siyah', nameEn: 'Black' },
];

const BALANCE_PACKS = [
  { amount: 100, label: '₺1.00', color: '#22c55e' },
  { amount: 500, label: '₺5.00', color: '#3b82f6' },
  { amount: 1000, label: '₺10.00', color: '#8b5cf6' },
  { amount: 2500, label: '₺25.00', color: '#f59e0b' },
];

const AkbilScreen = ({ onBack }) => {
  const balance = useGameStore(state => state.balance);
  const addBalance = useGameStore(state => state.addBalance);
  const cardColor = useGameStore(state => state.cardColor);
  const setSettings = useGameStore(state => state.setSettings);
  const { t, language } = useTranslation();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPacks, setShowPacks] = useState(false);
  const [purchaseFeedback, setPurchaseFeedback] = useState(null);


  const handlePurchase = (amount, label) => {
    addBalance(amount);
    setPurchaseFeedback(label);
    setTimeout(() => setPurchaseFeedback(null), 2000);
  };

  return (
    <main className="flex-1 w-full flex flex-col p-6 pb-20 relative z-10 fade-in items-center overflow-y-auto">
      <div className="w-full max-w-sm">
        <ScreenHeader title={t('akbil')} onBack={onBack} className="px-0 pt-0 mb-6" />

        {/* Akbil Card */}
        <div 
          className="w-full aspect-[1.586/1] rounded-2xl p-6 flex flex-col justify-between shadow-[0_20px_40px_rgba(0,0,0,0.5)] mb-6 relative overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${cardColor}, ${cardColor}dd)`,
            border: '1px solid rgba(255,255,255,0.15)'
          }}
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          {/* Card Decorations */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/[0.03]" />
          
          <div className="flex justify-between items-start relative z-10">
            <span aria-hidden="true" className="material-symbols-outlined text-white/80 text-[32px]">subway</span>
            <div className="flex gap-2 items-center">
              <span aria-hidden="true" className="material-symbols-outlined text-white/40 text-[16px]">palette</span>
              <div className="px-2 py-1 bg-white/10 rounded font-black text-white/50 text-[10px] tracking-widest">
                {language === 'en' ? 'TRANSIT' : 'İBB'}
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">{t('available_balance')}</p>
            <div className="flex items-end gap-2">
              <span className="text-white text-5xl font-black tracking-tighter">{formatKurus(balance)}</span>
            </div>
          </div>
        </div>

        {/* Renk Seçici */}
        {showColorPicker && (
          <div className="mb-4 p-4 bg-white/5 rounded-2xl border border-white/10 fade-in">
            <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">{t('card_color')}</h3>
            <div className="flex gap-2 flex-wrap">
              {CARD_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSettings({ cardColor: c.id }); setShowColorPicker(false); }}
                  className={`w-10 h-10 rounded-full transition-all ${cardColor === c.id ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                  style={{ background: c.id, border: '2px solid rgba(255,255,255,0.2)' }}
                  title={language === 'en' ? c.nameEn : c.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Satın Alma Geri Bildirimi */}
        {purchaseFeedback && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-center fade-in">
            <span className="text-green-400 font-bold text-sm">✓ {purchaseFeedback} yüklendi!</span>
          </div>
        )}

        {/* Reklam, bakiye yükleme ve işlem geçmişi gerçek servislere bağlanana kadar gizli:
            yükleme ödeme almadan bakiye ekliyordu, geçmiş sabit örnek veriydi */}
        {SHOW_STORE_FEATURES && (
        <div className="flex flex-col gap-3">
          {/* Reklam İzle */}
          <button 
            disabled={isWatchingAd}
            onClick={() => {
              setIsWatchingAd(true);
              setTimeout(() => {
                addBalance(50);
                setIsWatchingAd(false);
              }, 3000);
            }}
            className={`w-full py-4 rounded-xl font-bold text-white text-sm tracking-wide bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 ${isWatchingAd ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
              {isWatchingAd ? 'hourglass_empty' : 'play_circle'}
            </span>
            {isWatchingAd ? t('watching_ad') : t('watch_ad_balance')}
          </button>
          
          {/* Bakiye Yükle */}
          <button 
            onClick={() => setShowPacks(!showPacks)}
            className="w-full py-4 rounded-xl font-bold text-white text-sm tracking-wide bg-green-600 hover:bg-green-500 transition-colors flex items-center justify-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">add_circle</span>
            {t('load_balance')}
          </button>

          {showPacks && (
            <div className="grid grid-cols-2 gap-2 fade-in">
              {BALANCE_PACKS.map(pack => (
                <button
                  key={pack.amount}
                  onClick={() => handlePurchase(pack.amount, pack.label)}
                  className="py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
                  style={{ background: `${pack.color}20`, border: `1px solid ${pack.color}40` }}
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[16px]" style={{ color: pack.color }}>add</span>
                  {pack.label}
                </button>
              ))}
            </div>
          )}
          
          {/* Geçmiş */}
          <button 
            onClick={() => setShowHistory(true)}
            className="w-full py-4 rounded-xl font-bold text-white/80 text-sm tracking-wide bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">history</span>
            {t('history')}
          </button>
        </div>
        )}

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in px-4">
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
              <button 
                onClick={() => setShowHistory(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                <span aria-hidden="true" className="material-symbols-outlined">close</span>
              </button>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-blue-400">history</span>
                {t('recent_ops')}
              </h3>
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                  <div>
                    <p className="text-white/90 text-sm font-medium">{language === 'en' ? 'Ad Reward' : 'Video İzleme Ödülü'}</p>
                    <p className="text-white/40 text-xs">{language === 'en' ? 'Today' : 'Bugün'}</p>
                  </div>
                  <span className="text-green-400 font-bold">+₺0.50</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                  <div>
                    <p className="text-white/90 text-sm font-medium">{language === 'en' ? 'Word Found (Fast)' : 'Kelime Bulma (Hızlı)'}</p>
                    <p className="text-white/40 text-xs">{language === 'en' ? 'Today' : 'Bugün'}</p>
                  </div>
                  <span className="text-green-400 font-bold">+₺2.00</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                  <div>
                    <p className="text-white/90 text-sm font-medium">{language === 'en' ? 'Hint Used' : 'Otomatik Bul (Kopya)'}</p>
                    <p className="text-white/40 text-xs">{language === 'en' ? 'Today' : 'Bugün'}</p>
                  </div>
                  <span className="text-red-400 font-bold">-₺0.75</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AkbilScreen;
