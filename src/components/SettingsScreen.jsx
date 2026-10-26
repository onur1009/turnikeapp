import React from 'react';
import { useGameStore } from '../store/gameStore';
import { useTranslation } from '../utils/i18n';
import ScreenHeader from './ScreenHeader';

const SettingsScreen = ({ onBack }) => {
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const hapticEnabled = useGameStore(state => state.hapticEnabled);
  const theme = useGameStore(state => state.theme);
  const language = useGameStore(state => state.language);
  const setSettings = useGameStore(state => state.setSettings);
  const { t } = useTranslation();

  return (
    <main className="flex-1 w-full flex flex-col p-6 pb-20 relative z-10 fade-in items-center">
      <div className="w-full max-w-sm">
        <ScreenHeader title={t('settings')} onBack={onBack} className="px-0 pt-0 mb-5" />

        <div className="flex flex-col gap-6">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white font-bold flex items-center gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-blue-400">volume_up</span>
                {t('sound')}
              </span>
              <button 
                onClick={() => setSettings({ soundEnabled: !soundEnabled })}
                className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${soundEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white font-bold flex items-center gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-orange-400">vibration</span>
                {t('haptic')}
              </span>
              <button 
                onClick={() => setSettings({ hapticEnabled: !hapticEnabled })}
                className={`w-12 h-6 rounded-full transition-colors relative ${hapticEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${hapticEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h3 className="text-white/50 text-sm font-bold mb-3 uppercase tracking-wider">{t('theme')}</h3>
            <div className="flex flex-col gap-2">
              {['dark', 'light', 'retro'].map((themeOption) => (
                <button
                  key={themeOption}
                  onClick={() => setSettings({ theme: themeOption })}
                  className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-colors flex items-center justify-between px-4 ${theme === themeOption ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                >
                  {t(`${themeOption}_theme`)}
                  {theme === themeOption && <span aria-hidden="true" className="material-symbols-outlined">check_circle</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h3 className="text-white/50 text-sm font-bold mb-3 uppercase tracking-wider">{t('lang')}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSettings({ language: 'tr' })}
                className={`flex-1 py-3 rounded-xl font-bold text-sm tracking-wide transition-colors ${language === 'tr' ? 'bg-red-600 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >
                Türkçe
              </button>
              <button
                onClick={() => setSettings({ language: 'en' })}
                className={`flex-1 py-3 rounded-xl font-bold text-sm tracking-wide transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SettingsScreen;
