import React, { useState } from 'react';

export const DICTIONARY_DB = {
  "METRO": { desc: "Şehir içinde, çoğunlukla yer altında çalışan elektrikli tren.", category: "ULAŞIM", rarity: "YAYGIN" },
  "VAPUR": { desc: "Su buharı gücüyle çalışan, denizde ve nehirlerde yolcu taşıyan gemi.", category: "ULAŞIM", rarity: "YAYGIN" },
  "TURNİKE": { desc: "İstasyonlarda geçişi düzenleyen döner engelli kapı mekanizması.", category: "ALTYAPI", rarity: "YAYGIN" },
  "AKBİL": { desc: "İstanbul'da ulaşım araçlarında kullanılan elektronik bilet.", category: "BİLET", rarity: "YAYGIN" },
  "RAY": { desc: "Tren, tramvay gibi taşıtların tekerleklerinin hareket ettiği yol.", category: "ALTYAPI", rarity: "YAYGIN" },
  "MAKAS": { desc: "Demir yollarında trenin bir yoldan diğerine geçmesini sağlayan düzenek.", category: "ALTYAPI", rarity: "NADİR" },
  "PERON": { desc: "Tren istasyonlarında yolcuların trene binip indikleri yüksekçe yer.", category: "MİMARİ", rarity: "YAYGIN" },
  "KART": { desc: "Toplu taşımada ödeme yapmak için kullanılan plastik okutulabilir nesne.", category: "BİLET", rarity: "YAYGIN" },
  "HAT": { desc: "Taşıtların gidiş geliş yolu.", category: "ULAŞIM", rarity: "YAYGIN" },
  "TRAMVAY": { desc: "Şehir içinde raylar üzerinde hareket eden elektrikli yolcu taşıtı.", category: "ULAŞIM", rarity: "YAYGIN" },
  "BOGİ": { desc: "Tren ve metro vagonlarının tekerleklerini taşıyan şasi sistemi.", category: "TEKNİK", rarity: "NADİR" },
  "KATANER": { desc: "Tren ve tramvaylara elektrik sağlayan üst havai hat sistemi.", category: "TEKNİK", rarity: "NADİR" },
  "KONKORS": { desc: "Metrolarda yolcuların dağıldığı geniş ana salon.", category: "MİMARİ", rarity: "NADİR" },
  "KÜPEŞTE": { desc: "Vapur ve gemilerde güverte kenarındaki korkuluk.", category: "DENİZCİLİK", rarity: "NADİR" },
  "İSKELE": { desc: "Gemi ve vapurların yanaştığı, yolcu indirip bindirdiği yer.", category: "DENİZCİLİK", rarity: "YAYGIN" },
  "HALAT": { desc: "Vapuru iskeleye bağlamak için kullanılan kalın ip.", category: "DENİZCİLİK", rarity: "YAYGIN" },
  "JETON": { desc: "Eskiden ulaşım araçlarına binmek için kullanılan metal para.", category: "TARİHİ", rarity: "NADİR" },
  "TREN": { desc: "Demir yolunda yolcu ve yük taşıyan ulaşım aracı.", category: "ULAŞIM", rarity: "YAYGIN" },
  "VAGON": { desc: "Tren katarını oluşturan yolcu veya yük taşıyan araçlardan her biri.", category: "ULAŞIM", rarity: "YAYGIN" },
};

const CATEGORY_COLORS = {
  'ULAŞIM': '#3b82f6',
  'ALTYAPI': '#8b5cf6',
  'BİLET': '#22c55e',
  'MİMARİ': '#f59e0b',
  'TEKNİK': '#ef4444',
  'DENİZCİLİK': '#06b6d4',
  'TARİHİ': '#ec4899',
};

const DictionaryScreen = ({ learnedWords = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const displayedWords = learnedWords.filter(word =>
    DICTIONARY_DB[word] && word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="flex-1 w-full p-4 overflow-y-auto pb-20">
      {/* Search */}
      <div className="relative mb-5 max-w-lg mx-auto">
        <div className="flex items-center rounded-full overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <span className="material-symbols-outlined text-white/50 pl-4 pr-2 text-[20px]">search</span>
          <input
            className="w-full bg-transparent border-none py-3 pr-4 text-white placeholder-white/40 outline-none text-sm font-semibold"
            placeholder="Kelime ara..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Counter */}
      <div className="card-panel px-4 py-2.5 mb-5 max-w-lg mx-auto flex items-center justify-between">
        <span className="text-white/60 text-xs font-bold tracking-wider uppercase">Keşfedilen Kelimeler</span>
        <span className="text-white text-sm font-extrabold">{displayedWords.length} Adet</span>
      </div>

      {/* Word List */}
      <div className="max-w-lg mx-auto flex flex-col gap-3">
        {displayedWords.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-white/20 text-[56px] mb-3 block">menu_book</span>
            <p className="text-white/40 text-sm font-semibold">
              {learnedWords.length === 0 ? 'Henüz kelime keşfetmediniz.' : 'Arama sonucu bulunamadı.'}
            </p>
            <p className="text-white/25 text-xs mt-1">Oyunda kelime bularak sözlüğü doldurabilirsiniz.</p>
          </div>
        ) : (
          displayedWords.map((wordKey) => {
            const data = DICTIONARY_DB[wordKey];
            if (!data) return null;
            const catColor = CATEGORY_COLORS[data.category] || '#94a3b8';

            return (
              <div key={wordKey} className="card-panel p-4 relative overflow-hidden">
                {/* Accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-full" style={{ background: catColor }} />

                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white text-lg font-extrabold tracking-wide">{wordKey}</h3>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${catColor}22`,
                      color: catColor,
                      border: `1px solid ${catColor}44`
                    }}
                  >
                    {data.category}
                  </span>
                </div>

                {/* Description */}
                <p className="text-white/60 text-sm leading-relaxed">{data.desc}</p>

                {/* Rarity */}
                <div className="flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-[12px]" style={{ color: data.rarity === 'NADİR' ? '#fbbf24' : 'rgba(255,255,255,0.3)' }}>
                    {data.rarity === 'NADİR' ? 'star' : 'circle'}
                  </span>
                  <span className="text-white/30 text-[10px] font-bold">{data.rarity}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
};

export default DictionaryScreen;
