// Turnike: Sözcük Seferi — Ses Efektleri (Web Audio API)
// soundEnabled ayarı ile kontrol edilir.

let audioCtx = null;
let activeTimeouts = [];

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
};

const safeTimeout = (fn, delay) => {
  const id = setTimeout(() => {
    fn();
    activeTimeouts = activeTimeouts.filter(t => t !== id);
  }, delay);
  activeTimeouts.push(id);
  return id;
};

export const cancelAllSounds = () => {
  activeTimeouts.forEach(clearTimeout);
  activeTimeouts = [];
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

const playTone = (frequency, duration, type = 'sine', volume = 0.3) => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) { /* Sessizce başarısız ol */ }
};

// Doğru kelime bulunduğunda — kısa "ding"
export const playCorrect = () => {
  playTone(880, 0.15, 'sine', 0.25);
  safeTimeout(() => playTone(1100, 0.2, 'sine', 0.2), 80);
};

// Yanlış kelime — kısa "buzz"
export const playWrong = () => {
  playTone(200, 0.25, 'sawtooth', 0.15);
};

// Seviye tamamlama — mini fanfar
export const playLevelComplete = () => {
  playTone(523, 0.15, 'sine', 0.2);
  safeTimeout(() => playTone(659, 0.15, 'sine', 0.2), 120);
  safeTimeout(() => playTone(784, 0.15, 'sine', 0.2), 240);
  safeTimeout(() => playTone(1047, 0.3, 'sine', 0.25), 360);
};

// Turnike geçişi — "bip"
export const playTurnike = () => {
  playTone(1200, 0.08, 'square', 0.15);
  safeTimeout(() => playTone(1600, 0.08, 'square', 0.12), 100);
};

// Kombo sesi
export const playCombo = () => {
  playTone(660, 0.1, 'sine', 0.2);
  safeTimeout(() => playTone(880, 0.1, 'sine', 0.2), 60);
  safeTimeout(() => playTone(1100, 0.15, 'sine', 0.25), 120);
};

// Rozet kazanma
export const playBadgeUnlock = () => {
  playTone(440, 0.12, 'sine', 0.2);
  safeTimeout(() => playTone(554, 0.12, 'sine', 0.2), 100);
  safeTimeout(() => playTone(659, 0.12, 'sine', 0.2), 200);
  safeTimeout(() => playTone(880, 0.3, 'triangle', 0.3), 300);
};

// Çark çevirme
export const playSpin = () => {
  for (let i = 0; i < 8; i++) {
    safeTimeout(() => playTone(800 + (i * 50), 0.05, 'sine', 0.1), i * 60);
  }
};

// Bakiye kazanma
export const playBalanceUp = () => {
  playTone(600, 0.1, 'sine', 0.15);
  safeTimeout(() => playTone(900, 0.15, 'sine', 0.2), 80);
};

// Süre azaldığında (Tick) - Süreye göre tansiyon artar
export const playTick = (timeLeft = 10) => {
  const freq = Math.min(1500, 800 + ((15 - timeLeft) * 40));
  playTone(freq, 0.05, 'triangle', 0.25);
};

// Süre bittiğinde
export const playTimeUp = () => {
  playTone(200, 0.15, 'sine', 0.6);
  safeTimeout(() => playTone(150, 0.3, 'sine', 0.6), 180);
};

// Game Over (Canların hepsi bittiğinde)
export const playGameOver = () => {
  playTone(300, 0.2, 'sine', 0.3);
  safeTimeout(() => playTone(280, 0.2, 'sine', 0.3), 200);
  safeTimeout(() => playTone(250, 0.2, 'sine', 0.3), 400);
  safeTimeout(() => playTone(200, 0.5, 'sine', 0.3), 600);
};

// Web Speech API ile İstasyon Anonsu (Kuyruk Modeli)
let announcementQueue = [];
let isAnnouncing = false;

const processAnnouncementQueue = () => {
  if (announcementQueue.length === 0 || isAnnouncing) return;
  
  isAnnouncing = true;
  const { text, lang } = announcementQueue.shift();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'en' ? 'en-US' : 'tr-TR';
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  utterance.volume = 0.8;
  
  utterance.onend = () => {
    isAnnouncing = false;
    processAnnouncementQueue();
  };
  
  utterance.onerror = () => {
    isAnnouncing = false;
    processAnnouncementQueue();
  };
  
  // Metro çanı (ding-dong) çal, ardından anonsu oku
  playTone(600, 0.3, 'sine', 0.2);
  safeTimeout(() => playTone(500, 0.4, 'sine', 0.2), 400);
  
  safeTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 1000);
};

export const playStationAnnouncement = (stationName, lang = 'tr') => {
  if (!('speechSynthesis' in window)) return;
  
  const text = lang === 'en' 
    ? `Next station is ${stationName}.` 
    : `Bir sonraki istasyon... ${stationName}.`;
    
  announcementQueue.push({ text, lang });
  processAnnouncementQueue();
};
