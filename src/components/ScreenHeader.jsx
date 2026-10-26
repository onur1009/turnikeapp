import React from 'react';
import { useTranslation } from '../utils/i18n';

// Yan ekranların ortak başlığı: geri düğmesi | başlık | isteğe bağlı sağ öğe (ör. bakiye)
export default function ScreenHeader({ title, onBack, right = null, className = 'px-4 pt-6' }) {
  const { t } = useTranslation();
  return (
    <header className={`w-full flex items-center gap-3 pb-3 shrink-0 relative z-30 ${className}`}>
      <button onClick={onBack} className="icon-btn" aria-label={t('back')}>
        <span aria-hidden="true" className="material-symbols-outlined text-[20px]">arrow_back</span>
      </button>
      <h2 className="flex-1 min-w-0 truncate text-white text-[18px] font-black tracking-wide">{title}</h2>
      {right}
    </header>
  );
}
