import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { LOST_ITEMS_CATALOG, LOST_ITEMS_SETS, getRandomItem } from '../data/lostItems';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import ScreenHeader from './ScreenHeader';
import { formatKurus } from '../utils/format';

// Sürpriz kutu fiyatı kuruş cinsinden (eskiden 200 kuruş = ₺2 çekiyordu; eşyalar ₺15-300'e
// satılabildiği için sınırsız para kazandırıyordu)
const MYSTERY_BOX_PRICE = 20000;

const LostItemsScreen = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('raflar'); // 'raflar', 'kutu', 'pazar'
  const [selectedItem, setSelectedItem] = useState(null);
  const [isOpeningBox, setIsOpeningBox] = useState(false);
  const [boxResult, setBoxResult] = useState(null);

  const { inventory, completedSets, dailyItemTarget, balance, buyMysteryBox, sellItem, checkCompletedSets } = useGameStore();

  useEffect(() => {
    checkCompletedSets(LOST_ITEMS_SETS);
  }, [inventory, checkCompletedSets]);

  const itemsList = Object.values(LOST_ITEMS_CATALOG);

  const handleOpenBox = () => {
    if (balance < MYSTERY_BOX_PRICE || isOpeningBox) return;
    setIsOpeningBox(true);
    setBoxResult(null);
    if (useGameStore.getState().hapticEnabled) Haptics.impact({ style: ImpactStyle.Heavy }).catch(()=>{});
    
    setTimeout(() => {
      const newItemId = getRandomItem();
      buyMysteryBox(MYSTERY_BOX_PRICE, newItemId);
      setBoxResult(LOST_ITEMS_CATALOG[newItemId]);
      setIsOpeningBox(false);
      if (useGameStore.getState().hapticEnabled) Haptics.notification({ type: 'SUCCESS' }).catch(()=>{});
    }, 2000);
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center relative z-20 fade-in pb-6 px-4 min-h-screen">
      <ScreenHeader title="Kayıp Eşya Ofisi" onBack={onBack} className="px-0 pt-6 mb-3 max-w-sm"
        right={<span className="balance-pill">{formatKurus(balance)}</span>} />

      {/* Tabs */}
      <div className="flex w-full max-w-sm bg-white/5 p-1 rounded-full mb-6">
        <button onClick={() => setActiveTab('raflar')} className={`flex-1 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'raflar' ? 'bg-green-600 text-white shadow-[0_0_10px_rgba(22,163,74,0.5)]' : 'text-white/50 hover:text-white/80'}`}>Raflar</button>
        <button onClick={() => setActiveTab('kutu')} className={`flex-1 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'kutu' ? 'bg-green-600 text-white shadow-[0_0_10px_rgba(22,163,74,0.5)]' : 'text-white/50 hover:text-white/80'}`}>Sürpriz Kutu</button>
        <button onClick={() => setActiveTab('pazar')} className={`flex-1 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'pazar' ? 'bg-green-600 text-white shadow-[0_0_10px_rgba(22,163,74,0.5)]' : 'text-white/50 hover:text-white/80'}`}>Pazar</button>
      </div>

      {/* TAB CONTENT: RAFLAR */}
      {activeTab === 'raflar' && (
        <div className="flex-1 w-full max-w-sm overflow-y-auto no-scrollbar pb-10">
          {LOST_ITEMS_SETS.map(setInfo => {
            const isCompleted = completedSets.includes(setInfo.id);
            return (
              <div key={setInfo.id} className="mb-8">
                <div className="flex items-center justify-between mb-3 px-2">
                  <h3 className={`font-bold text-lg ${isCompleted ? 'text-green-400' : 'text-white'}`}>{setInfo.name}</h3>
                  {isCompleted && <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-green-500/30">Set Tamamlandı</span>}
                </div>
                <p className="text-xs text-white/50 px-2 mb-4">Ödül: {setInfo.description}</p>
                <div className="grid grid-cols-3 gap-3">
                  {setInfo.items.map(itemId => {
                    const item = LOST_ITEMS_CATALOG[itemId];
                    const count = inventory[itemId] || 0;
                    const unlocked = count > 0;
                    return (
                      <div key={itemId} onClick={() => unlocked && setSelectedItem(item)}
                        className={`relative p-3 rounded-xl border-b-4 flex flex-col items-center text-center transition-all ${unlocked ? 'bg-green-900/20 border-green-500/50 shadow-[0_0_15px_rgba(74,222,128,0.2)] cursor-pointer active:scale-95' : 'bg-white/5 border-black/20 opacity-60'}`}>
                        {count > 1 && <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-[#0a0f0d]">{count}x</div>}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-inner ${unlocked ? 'bg-gradient-to-br from-green-400/20 to-green-600/20' : 'bg-white/5'}`}>
                          <span className={`material-symbols-outlined text-[24px] ${unlocked ? 'text-green-300' : 'text-white/20'}`}>{unlocked ? item.icon : 'lock'}</span>
                        </div>
                        <h3 className={`font-black text-[10px] leading-tight ${unlocked ? 'text-green-50' : 'text-white/40'}`}>{unlocked ? item.name : 'Kilitli'}</h3>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB CONTENT: KUTU */}
      {activeTab === 'kutu' && (
        <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-center text-center pb-10">
          <div className="mb-8 relative w-48 h-48 flex items-center justify-center">
            {isOpeningBox ? (
              <div className="absolute inset-0 animate-spin" style={{ background: 'conic-gradient(from 0deg, transparent, rgba(74,222,128,0.2), transparent)', borderRadius: '50%' }}></div>
            ) : null}
            <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.2)] ${isOpeningBox ? 'animate-bounce' : ''}`}>
              {boxResult ? (
                <span className="material-symbols-outlined text-6xl text-green-400">{boxResult.icon}</span>
              ) : (
                <span className="material-symbols-outlined text-6xl text-white/50">inventory_2</span>
              )}
            </div>
          </div>
          
          {boxResult ? (
            <div className="mb-8 fade-in">
              <h3 className="text-2xl font-black text-green-400 mb-2">{boxResult.name}</h3>
              <p className="text-white/70 text-sm max-w-xs">{boxResult.description}</p>
            </div>
          ) : (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-2">Sürpriz Kutu</h3>
              <p className="text-white/50 text-sm">{formatKurus(MYSTERY_BOX_PRICE)} karşılığında rastgele bir kayıp eşya bulma şansı yakala!</p>
            </div>
          )}

          <button onClick={handleOpenBox} disabled={isOpeningBox || balance < MYSTERY_BOX_PRICE}
            className={`px-8 py-4 rounded-full font-black text-lg shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all ${isOpeningBox || balance < MYSTERY_BOX_PRICE ? 'bg-white/10 text-white/30' : 'bg-green-600 text-white active:scale-95'}`}>
            {isOpeningBox ? 'KUTU AÇILIYOR...' : `KUTU AÇ (${formatKurus(MYSTERY_BOX_PRICE)})`}
          </button>
        </div>
      )}

      {/* TAB CONTENT: PAZAR */}
      {activeTab === 'pazar' && (
        <div className="flex-1 w-full max-w-sm overflow-y-auto no-scrollbar pb-10">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6 text-center">
            <h3 className="text-blue-400 font-bold text-sm mb-1 uppercase tracking-wider">Günün Aranan Eşyası</h3>
            <p className="text-white/70 text-xs mb-3">Bu eşyayı bugün seferlerde bulursan 3x ödül kazanırsın!</p>
            {dailyItemTarget ? (
              <div className="inline-flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-xl">
                <span className="material-symbols-outlined text-blue-300">{LOST_ITEMS_CATALOG[dailyItemTarget].icon}</span>
                <span className="text-white font-bold">{LOST_ITEMS_CATALOG[dailyItemTarget].name}</span>
              </div>
            ) : (
              <span className="text-white/50 text-xs">Aranan eşya yok.</span>
            )}
          </div>

          <h3 className="text-white font-bold mb-4">Fazla Eşyaları Sat</h3>
          <div className="space-y-3">
            {itemsList.map(item => {
              const count = inventory[item.id] || 0;
              if (count <= 1) return null; // Only duplicates can be sold
              return (
                <div key={item.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{item.name}</h4>
                      <p className="text-white/50 text-xs">{count - 1} adet fazlan var</p>
                    </div>
                  </div>
                  <button onClick={() => {
                    sellItem(item.id, item.value * 100);
                    if (useGameStore.getState().hapticEnabled) Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{});
                  }} className="bg-green-600/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all">
                    SAT (+{formatKurus(item.value * 100)})
                  </button>
                </div>
              );
            })}
            {Object.keys(inventory).filter(id => inventory[id] > 1).length === 0 && (
              <div className="text-center text-white/40 text-sm py-8">Satılabilecek fazla eşyan yok. Sadece koleksiyonunda 1'den fazla olan eşyalar satılabilir.</div>
            )}
          </div>
        </div>
      )}

      {/* LORE MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelectedItem(null)}>
          <div className="bg-[#0a0f0d] border border-green-500/30 rounded-3xl p-6 max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="w-20 h-20 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-4 border border-green-400/30 shadow-[0_0_30px_rgba(74,222,128,0.2)]">
              <span className="material-symbols-outlined text-4xl text-green-400">{selectedItem.icon}</span>
            </div>
            <h2 className="text-2xl font-black text-white text-center mb-1">{selectedItem.name}</h2>
            <div className="text-green-400 text-[10px] font-bold uppercase tracking-widest text-center mb-4">{selectedItem.rarity} EŞYA</div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4 relative overflow-hidden">
              <span className="material-symbols-outlined absolute -bottom-4 -right-2 text-6xl text-white/5 opacity-50">format_quote</span>
              <p className="text-white/80 text-sm italic relative z-10 leading-relaxed">"{selectedItem.lore}"</p>
            </div>
            <p className="text-center text-xs text-white/40">Eşya Değeri: {formatKurus(selectedItem.value * 100)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostItemsScreen;
