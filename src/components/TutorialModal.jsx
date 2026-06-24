import React, { useState } from 'react';

const TutorialModal = ({ onClose }) => {
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md fade-in px-6">
      <div className="bg-[#0f172a] border-2 border-green-500/50 rounded-2xl w-full max-w-sm p-6 shadow-[0_0_40px_rgba(34,197,94,0.3)] relative text-center">
        {step === 1 && (
          <div className="fade-in">
            <span className="material-symbols-outlined text-green-400 text-6xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>touch_app</span>
            <h2 className="text-white font-black text-xl mb-2">Çarkı Çevir</h2>
            <p className="text-white/80 text-sm leading-relaxed mb-6">Harfleri sürükleyerek birleştirin ve İstanbul ulaşım kelimelerini oluşturun.</p>
          </div>
        )}
        {step === 2 && (
          <div className="fade-in">
            <span className="material-symbols-outlined text-blue-400 text-6xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
            <h2 className="text-white font-black text-xl mb-2">Harfleri Karıştır</h2>
            <p className="text-white/80 text-sm leading-relaxed mb-6">Ortadaki düğmeye dokunarak harflerin yerlerini değiştirebilirsiniz. Bazen farklı bir açı kelimeyi bulmanızı kolaylaştırır.</p>
          </div>
        )}
        {step === 3 && (
          <div className="fade-in">
            <div className="flex justify-center gap-4 mb-4">
              <span className="material-symbols-outlined text-yellow-400 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              <span className="material-symbols-outlined text-blue-400 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>spellcheck</span>
            </div>
            <h2 className="text-white font-black text-xl mb-2">Yardımcılar</h2>
            <p className="text-white/80 text-sm leading-relaxed mb-6">Takıldığınızda bakiyenizi kullanarak <b>sarı ampul</b> ile tek bir harf, <b>mavi ikon</b> ile tüm kelimeyi açtırabilirsiniz.</p>
          </div>
        )}

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${step === i ? 'bg-green-500' : 'bg-white/20'}`} />
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="w-full py-4 rounded-xl font-bold text-white text-sm tracking-widest bg-green-600 hover:bg-green-500 transition-colors uppercase">
          {step < 3 ? 'İLERİ' : 'BAŞLA'}
        </button>
      </div>
    </div>
  );
};

export default TutorialModal;
