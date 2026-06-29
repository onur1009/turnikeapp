// Turnike: Sözcük Seferi — Ses Efektleri (Web Audio API)
// soundEnabled ayarı ile kontrol edilir.

let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
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
  setTimeout(() => playTone(1100, 0.2, 'sine', 0.2), 80);
};

// Yanlış kelime — kısa "buzz"
export const playWrong = () => {
  playTone(200, 0.25, 'sawtooth', 0.15);
};

// Seviye tamamlama — mini fanfar
export const playLevelComplete = () => {
  playTone(523, 0.15, 'sine', 0.2);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.2), 120);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.2), 240);
  setTimeout(() => playTone(1047, 0.3, 'sine', 0.25), 360);
};

// Turnike geçişi — "bip"
export const playTurnike = () => {
  playTone(1200, 0.08, 'square', 0.15);
  setTimeout(() => playTone(1600, 0.08, 'square', 0.12), 100);
};

// Kombo sesi
export const playCombo = () => {
  playTone(660, 0.1, 'sine', 0.2);
  setTimeout(() => playTone(880, 0.1, 'sine', 0.2), 60);
  setTimeout(() => playTone(1100, 0.15, 'sine', 0.25), 120);
};

// Rozet kazanma
export const playBadgeUnlock = () => {
  playTone(440, 0.12, 'sine', 0.2);
  setTimeout(() => playTone(554, 0.12, 'sine', 0.2), 100);
  setTimeout(() => playTone(659, 0.12, 'sine', 0.2), 200);
  setTimeout(() => playTone(880, 0.3, 'triangle', 0.3), 300);
};

// Çark çevirme
export const playSpin = () => {
  for (let i = 0; i < 8; i++) {
    setTimeout(() => playTone(800 + (i * 50), 0.05, 'sine', 0.1), i * 60);
  }
};

// Bakiye kazanma
export const playBalanceUp = () => {
  playTone(600, 0.1, 'sine', 0.15);
  setTimeout(() => playTone(900, 0.15, 'sine', 0.2), 80);
};

// Süre azaldığında (Tick) - Süreye göre tansiyon artar
export const playTick = (timeLeft = 10) => {
  const freq = Math.min(1500, 800 + ((15 - timeLeft) * 40));
  playTone(freq, 0.05, 'triangle', 0.25);
};

// Süre bittiğinde
export const playTimeUp = () => {
  // Modern, yumuşak bir hata tonu
  playTone(200, 0.15, 'sine', 0.6);
  setTimeout(() => playTone(150, 0.3, 'sine', 0.6), 180);
};

// Game Over (Canların hepsi bittiğinde)
export const playGameOver = () => {
  playTone(300, 0.2, 'sine', 0.3);
  setTimeout(() => playTone(280, 0.2, 'sine', 0.3), 200);
  setTimeout(() => playTone(250, 0.2, 'sine', 0.3), 400);
  setTimeout(() => playTone(200, 0.5, 'sine', 0.3), 600);
};

// Web Speech API ile İstasyon Anonsu
export const playStationAnnouncement = (stationName, lang = 'tr') => {
  if (!('speechSynthesis' in window)) return;
  
  // Önceki anonsları iptal et
  window.speechSynthesis.cancel();
  
  const text = lang === 'en' 
    ? `Next station is ${stationName}.` 
    : `Bir sonraki istasyon... ${stationName}.`;
    
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Uygun dili seçmeye çalış
  utterance.lang = lang === 'en' ? 'en-US' : 'tr-TR';
  utterance.rate = 0.9;
  utterance.pitch = 1.1; // Biraz anons tonu vermek için
  utterance.volume = 0.8;
  
  // Metro çanı (ding-dong) çal, ardından anonsu oku
  playTone(600, 0.3, 'sine', 0.2);
  setTimeout(() => playTone(500, 0.4, 'sine', 0.2), 400);
  
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 1000);
};
