// Turnike: Sözcük Seferi — sesler.
// İki ayrı kanal: ses efektleri (Web Audio ile üretilir, `soundEnabled`) ve müzik
// (public/audio/music-cozy.mp3 döngüsü, `musicEnabled` + `musicVolume`). Her biri Ayarlar'dan
// ayrı ayrı kapatılabilir. Efekt fonksiyonları ayarı kendileri kontrol eder.
// Müzik: "Cozy Puzzle In-Game 1" — MintoDog, CC0 (opengameart.org/content/cozy-puzzle-in-game-1).
import { Capacitor } from '@capacitor/core';
import { useGameStore } from '../store/gameStore';

let audioCtx = null;
let noiseBuffer = null;
let activeTimeouts = [];

const sfxOn = () => useGameStore.getState().soundEnabled !== false;

const getAudioContext = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
};

const safeTimeout = (fn, delay) => {
  const id = setTimeout(() => { fn(); activeTimeouts = activeTimeouts.filter(t => t !== id); }, delay);
  activeTimeouts.push(id);
  return id;
};

export const cancelAllSounds = () => {
  activeTimeouts.forEach(clearTimeout);
  activeTimeouts = [];
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
};

// Yumuşak başlangıçlı ton (tık sesi çıkmasın diye kısa attack)
const playTone = (frequency, duration, type = 'sine', volume = 0.3, { attack = 0.008, glideTo = null } = {}) => {
  if (!sfxOn()) return;
  try {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, t);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + duration);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  } catch { /* ses yoksa sessizce geç */ }
};

// Filtrelenmiş beyaz gürültü: tren uğultusu, kapı, rüzgâr
const playNoise = (duration, { from = 400, to = 2400, volume = 0.25, q = 0.8, type = 'bandpass' } = {}) => {
  if (!sfxOn()) return;
  try {
    const ctx = getAudioContext();
    if (!noiseBuffer) {
      noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuffer.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(from, t);
    filter.frequency.exponentialRampToValueAtTime(to, t + duration * 0.6);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + duration * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(t);
    src.stop(t + duration + 0.05);
  } catch { /* */ }
};

const chord = (freqs, duration, type = 'triangle', volume = 0.12) => freqs.forEach(f => playTone(f, duration, type, volume));

// ---------- Oyun içi ----------
// Çarkta harf seçimi: her yeni harf bir öncekinden yüksek (seçim zinciri duyulsun)
const LETTER_STEPS = [523, 587, 659, 698, 784, 880, 988, 1047];
export const playLetterSelect = (index = 0) => playTone(LETTER_STEPS[Math.min(index, LETTER_STEPS.length - 1)], 0.09, 'sine', 0.14);

export const playCorrect = () => {
  playTone(784, 0.12, 'sine', 0.22);
  safeTimeout(() => playTone(1047, 0.22, 'sine', 0.2), 70);
  safeTimeout(() => playTone(1319, 0.28, 'triangle', 0.1), 140);
};

export const playWrong = () => {
  playTone(220, 0.22, 'square', 0.08, { glideTo: 150 });
  safeTimeout(() => playTone(165, 0.2, 'square', 0.07), 120);
};

export const playLevelComplete = () => {
  [523, 659, 784, 1047].forEach((f, i) => safeTimeout(() => playTone(f, 0.18, 'triangle', 0.2), i * 110));
  safeTimeout(() => chord([523, 659, 784, 1047], 0.6, 'sine', 0.09), 460);
};

// Turnike geçişi / ipucu: kart okutma "bip-bip"
export const playTurnike = () => {
  playTone(1320, 0.07, 'square', 0.1);
  safeTimeout(() => playTone(1760, 0.09, 'square', 0.09), 90);
};

export const playCombo = () => {
  [660, 880, 1100, 1320].forEach((f, i) => safeTimeout(() => playTone(f, 0.1, 'sine', 0.18), i * 55));
};

export const playBadgeUnlock = () => {
  [440, 554, 659].forEach((f, i) => safeTimeout(() => playTone(f, 0.12, 'sine', 0.18), i * 100));
  safeTimeout(() => chord([659, 880, 1109], 0.5, 'triangle', 0.1), 300);
};

export const playBalanceUp = () => {
  playTone(988, 0.08, 'sine', 0.16);
  safeTimeout(() => playTone(1319, 0.18, 'sine', 0.16), 70);
};

export const playShuffle = () => {
  playNoise(0.25, { from: 1200, to: 4000, volume: 0.12, q: 1.5 });
  [0, 50, 100].forEach((d, i) => safeTimeout(() => playTone(700 + i * 120, 0.05, 'triangle', 0.08), d));
};

// Süre azalıyor: son 10 sn tik, son 3 sn çift ve tiz tik (gerilim artar)
export const playTick = (timeLeft = 10) => {
  if (timeLeft <= 3) {
    playTone(1500, 0.06, 'square', 0.12);
    safeTimeout(() => playTone(1500, 0.06, 'square', 0.1), 140);
  } else {
    playTone(Math.min(1300, 760 + (10 - timeLeft) * 60), 0.05, 'triangle', 0.2);
  }
};

// Ekspres süresi bitti: kapı kapanma uyarısı (metro "düt-düt-düt")
export const playTimeUp = () => {
  [0, 260, 520].forEach(d => safeTimeout(() => playTone(880, 0.16, 'square', 0.09), d));
};

// 3 hata: tren kapıları kapanır ve peronu terk eder
export const playTrainDepart = () => {
  [0, 300, 600].forEach(d => safeTimeout(() => playTone(784, 0.18, 'square', 0.08), d));
  safeTimeout(() => playNoise(0.35, { from: 300, to: 900, volume: 0.25, q: 0.7 }), 950);   // kapılar
  safeTimeout(() => playNoise(2.2, { from: 120, to: 1800, volume: 0.32, q: 0.5 }), 1350);  // kalkış uğultusu
  safeTimeout(() => playTone(196, 1.6, 'sawtooth', 0.04, { glideTo: 330 }), 1350);         // motor
};
export const playGameOver = playTrainDepart;

// ---------- Tanıtım ----------
export const playTrainWhoosh = () => {
  playNoise(1.2, { from: 200, to: 3000, volume: 0.35, q: 0.6 });
  playTone(330, 1.0, 'sawtooth', 0.035, { glideTo: 165 });
};
export const playGateClick = () => {
  playNoise(0.08, { from: 2500, to: 4000, volume: 0.3, q: 4 });
  safeTimeout(() => playTone(1320, 0.12, 'square', 0.08), 60);
};
export const playTileDrop = (i = 0) => playTone(392 * Math.pow(2, i / 7), 0.12, 'triangle', 0.16);
export const playIntroChord = () => chord([523, 659, 784], 0.9, 'sine', 0.1);

// ---------- Çark ----------
export const playSpinTick = () => playTone(1900, 0.025, 'square', 0.06);
export const playSpin = () => {
  // Dilim sınırı geçtikçe tık: başta hızlı, sonda yavaş (çarkın 4,4 sn'lik yavaşlamasına uyar)
  let t = 0, gap = 45;
  while (t < 4300) { safeTimeout(playSpinTick, t); t += gap; gap *= 1.075; }
};
export const playPrize = (jackpot = false) => {
  [784, 988, 1175, 1568].forEach((f, i) => safeTimeout(() => playTone(f, 0.14, 'triangle', 0.18), i * 90));
  safeTimeout(() => chord(jackpot ? [784, 988, 1175, 1568] : [784, 988, 1175], 0.8, 'sine', 0.09), 380);
};

// ---------- Düello ----------
export const playCountdown = (n) => playTone(n > 0 ? 660 : 1320, n > 0 ? 0.14 : 0.35, 'square', 0.1);
export const playVsSlam = () => {
  playNoise(0.3, { from: 80, to: 400, volume: 0.4, q: 0.5, type: 'lowpass' });
  playTone(110, 0.4, 'sine', 0.3, { glideTo: 55 });
};
export const playWin = () => {
  [523, 659, 784, 1047, 1319].forEach((f, i) => safeTimeout(() => playTone(f, 0.16, 'triangle', 0.18), i * 100));
  safeTimeout(() => chord([523, 784, 1047, 1319], 1.0, 'sine', 0.09), 520);
};
export const playLose = () => {
  [392, 349, 311, 262].forEach((f, i) => safeTimeout(() => playTone(f, 0.28, 'triangle', 0.13), i * 220));
};

// ---------- Durak anonsu ----------
// Android uygulamasında telefonun Türkçe ses motoru (TextToSpeech eklentisi), web'de tarayıcı sesi.
// Not: eklenti nesnesi bir Promise'ten döndürülmez (Capacitor thenable sorunu, bkz. adService).
let tts = null;
const speakNative = async (text, lang) => {
  try {
    if (!tts) tts = (await import('@capacitor-community/text-to-speech')).TextToSpeech;
    await tts.speak({ text, lang: lang === 'en' ? 'en-US' : 'tr-TR', rate: 0.95, pitch: 1.0, volume: 1.0, category: 'ambient' });
  } catch { /* ses motoru yoksa yalnızca tabela kalır */ }
};
const speakWeb = (text, lang) => {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === 'en' ? 'en-US' : 'tr-TR';
  u.rate = 0.92;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
};

export const playStationAnnouncement = (stationName, lang = 'tr', { lineChange = false } = {}) => {
  if (!sfxOn()) return;
  // Metro "ding-dong", ardından anons; müzik bu sırada kısılır
  playTone(659, 0.5, 'sine', 0.18);
  safeTimeout(() => playTone(523, 0.7, 'sine', 0.18), 450);
  duckMusic(4500);
  const text = lang === 'en'
    ? `Next station: ${stationName}.`
    : `${lineChange ? 'Aktarma istasyonu. ' : ''}Sıradaki durak, ${stationName}.`;
  safeTimeout(() => (Capacitor.isNativePlatform() ? speakNative(text, lang) : speakWeb(text, lang)), 1100);
};

// ---------- Müzik ----------
const MUSIC_SRC = '/audio/music-cozy.mp3';
let music = null;
let duckTimer = null;
let ducked = false;

const targetVolume = () => {
  const s = useGameStore.getState();
  return (s.musicVolume ?? 0.5) * (ducked ? 0.35 : 1);
};

const ensureMusic = () => {
  if (!music) {
    music = new Audio(MUSIC_SRC);
    music.loop = true;
    music.preload = 'auto';
  }
  return music;
};

export const syncMusic = () => {
  const s = useGameStore.getState();
  if (!s.musicEnabled || document.visibilityState === 'hidden') { if (music) music.pause(); return; }
  const m = ensureMusic();
  m.volume = Math.max(0, Math.min(1, targetVolume()));
  if (m.paused) m.play().catch(() => { /* tarayıcı ilk dokunuşu bekliyor */ });
};

function duckMusic(ms) {
  if (!music) return;
  ducked = true;
  music.volume = targetVolume();
  clearTimeout(duckTimer);
  duckTimer = setTimeout(() => { ducked = false; if (music) music.volume = targetVolume(); }, ms);
}

// Uygulama açılışında bir kez: ilk dokunuşta müziği başlat, ayar/arka plan değişince eşitle
let musicStarted = false;
export const initMusic = () => {
  if (musicStarted) return;
  musicStarted = true;
  const kick = () => { getAudioContext(); syncMusic(); };
  window.addEventListener('pointerdown', kick, { passive: true });
  document.addEventListener('visibilitychange', syncMusic);
  useGameStore.subscribe((s, prev) => {
    if (s.musicEnabled !== prev.musicEnabled || s.musicVolume !== prev.musicVolume) syncMusic();
  });
};
