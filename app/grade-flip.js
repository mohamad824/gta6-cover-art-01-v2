// grade-flip.js — the one-click DAY golden-hour / NIGHT neon grade flip,
// plus the per-panel grade choice and the optional Poster Ink halftone.

// DAY: warm, bright, photographic — lifts the cover toward rank-1 brightness.
// NIGHT: cooler shadows, hot magenta/cyan neon saturation.
export const GRADE_FILTERS = {
  day: "brightness(1.04) saturate(1.30) contrast(1.06) sepia(0.24) hue-rotate(-8deg)",
  night: "brightness(0.94) saturate(1.42) contrast(1.14) hue-rotate(12deg)",
  none: "none",
};

// A translucent colour wash laid over a panel after its photo, per grade.
export const GRADE_WASH = {
  day: { color: "rgba(255,170,60,0.10)", blend: "overlay" },
  night: { color: "rgba(255,0,140,0.14)", blend: "overlay" },
  none: null,
};

export function gradeFilterFor(panelGrade, globalGrade) {
  const g = panelGrade === "auto" ? globalGrade : panelGrade;
  return GRADE_FILTERS[g] || "none";
}

export function gradeWashFor(panelGrade, globalGrade) {
  const g = panelGrade === "auto" ? globalGrade : panelGrade;
  return GRADE_WASH[g] || null;
}

// Poster Ink: heavy contrast + saturation, then a halftone dot screen is
// drawn over the panel by drawPosterInkDots. OFF by default.
export function posterInkFilter(amount) {
  const c = 1 + 0.55 * amount;
  const s = 1 + 0.9 * amount;
  return `contrast(${c.toFixed(2)}) saturate(${s.toFixed(2)}) brightness(1.04)`;
}

export function drawPosterInkDots(ctx, x, y, w, h, amount) {
  if (amount <= 0) return;
  const step = Math.max(5, Math.round(w / 90));
  ctx.save();
  ctx.globalAlpha = 0.16 * amount;
  ctx.fillStyle = "#1a0533";
  for (let yy = y + step / 2; yy < y + h; yy += step) {
    for (let xx = x + step / 2; xx < x + w; xx += step) {
      const r = step * 0.16;
      ctx.beginPath();
      ctx.arc(xx, yy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
