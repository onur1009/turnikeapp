// ============================================================
// VOLATİLİTE TESPİTİ ve DDA Motoru
// ============================================================

const EPS = 0.01;

function mean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }
function variance(arr, mu) { return arr.reduce((s, x) => s + (x - mu) ** 2, 0) / arr.length; }

function trendSlope(signals) {
  const n = signals.length;
  const iBar = (n + 1) / 2;
  const mu = mean(signals);
  let num = 0, den = 0;
  signals.forEach((s, idx) => {
    const i = idx + 1;
    num += (i - iBar) * (s - mu);
    den += (i - iBar) ** 2;
  });
  return den === 0 ? 0 : num / den;
}

function runsTestZ(signals) {
  const med = [...signals].sort((a, b) => a - b)[Math.floor(signals.length / 2)];
  const signs = signals.map((s) => (s >= med ? 1 : -1));
  let runs = 1;
  for (let i = 1; i < signs.length; i++) if (signs[i] !== signs[i - 1]) runs++;
  const n1 = signs.filter((s) => s === 1).length;
  const n2 = signs.filter((s) => s === -1).length;
  const n = n1 + n2;
  if (n1 === 0 || n2 === 0 || n < 2) return 0;
  const expectedR = (2 * n1 * n2) / n + 1;
  const varR = (2 * n1 * n2 * (2 * n1 * n2 - n)) / (n * n * (n - 1));
  if (varR <= 0) return 0;
  return (runs - expectedR) / Math.sqrt(varR);
}

export function computeRawSignal(level) {
  const remainingTimeRatio = level.success
    ? Math.max(0, (level.timeLimit - level.timeSpent) / level.timeLimit)
    : 0;

  if (level.success) {
    const attemptPenalty = Math.max(0, 1 - (level.attempts - 1) * 0.2);
    return Math.min(1, 0.5 + remainingTimeRatio * 0.5) * attemptPenalty;
  }
  return Math.max(0, 0.3 - level.attempts * 0.05);
}

export function updateEwmvAndZScore(newSignal, emaPrev, ewmvPrev, alpha) {
  const diff = newSignal - emaPrev;
  const ema = emaPrev + alpha * diff;
  const ewmv = (1 - alpha) * (ewmvPrev + alpha * diff * diff);
  const zScore = diff / Math.sqrt(ewmv + EPS);
  return { ema, ewmv, zScore };
}

export function getAlpha(totalLevelsPlayed) {
  if (totalLevelsPlayed < 10) return 0.5;
  if (totalLevelsPlayed < 30) return 0.35;
  return 0.2;
}

export function detectVolatility(recentSignals, zScore) {
  if (recentSignals.length < 5) return "insufficient_data";

  const mu = mean(recentSignals);
  const sigma2 = variance(recentSignals, mu);
  const sigma = Math.sqrt(sigma2);
  const cv = mu > 0.05 ? sigma / mu : 0;          // Değişim katsayısı
  const beta = trendSlope(recentSignals);          // sürdürülen trend
  const zRuns = runsTestZ(recentSignals);          // salınım sıklığı

  // 1) Tekil ani sıçrama (bu seviyede, EMA'ya göre)
  if (zScore > 2.0) return "sharp_up";
  if (zScore < -2.0) return "sharp_down";

  // 2) Sürdürülen güçlü trend
  if (beta > 0.08) return "sharp_up";
  if (beta < -0.08) return "sharp_down";

  // 3) Yüksek değişkenlik + beklenenden fazla iniş-çıkış
  if (cv > 0.3 && zRuns > 1.0) return "borderline";

  // 4) Ortalama belirsiz bölgede, trend de yok
  if (mu >= 0.4 && mu <= 0.6 && Math.abs(beta) < 0.05) return "borderline";

  return "stable";
}

export function applyDDA(baseParams, performanceScore, volatility = "stable") {
  const result = { ...baseParams, timeAdjustSeconds: 0, extraHintAvailable: false };
  const allowHarden = volatility !== "borderline";

  if (performanceScore > 0.8 && allowHarden) {
    result.targetWords = baseParams.targetWords + 1;
    result.timeAdjustSeconds = -2;
  } else if (performanceScore < 0.3) {
    result.minRoot = Math.max(3, baseParams.minRoot - 1);
    result.timeAdjustSeconds = +5;
    result.extraHintAvailable = true;
  }
  return result;
}
