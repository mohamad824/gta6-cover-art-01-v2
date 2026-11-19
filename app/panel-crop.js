// panel-crop.js — cover-fit drawing with per-panel pan and zoom.
// The photo always fills its panel (no letterbox); drag pans, scroll zooms.

export function coverDraw(ctx, img, x, y, w, h, zoom, ox, oy) {
  if (!img || !img.naturalWidth) return;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  // Clamp the pan so the photo always covers the panel, at any export
  // aspect: the slack differs between landscape, square and portrait.
  const maxDx = Math.max(0, (dw - w) / 2);
  const maxDy = Math.max(0, (dh - h) / 2);
  const dx = x + Math.max(-maxDx, Math.min(maxDx, (w - dw) / 2 + ox * w));
  const dy = y + Math.max(-maxDy, Math.min(maxDy, (h - dh) / 2 + oy * h));
  ctx.drawImage(img, dx, dy, dw, dh);
}

// Hit-test a point (in cover pixels) against a layout's panels.
export function panelAt(layout, px, py, W, H) {
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const p = layout.panels[i];
    const x = p.x * W, y = p.y * H, w = p.w * W, h = p.h * H;
    if (px >= x && px <= x + w && py >= y && py <= y + h) return p;
  }
  return null;
}

// Clamp a pan offset so the photo can never be dragged out of its panel.
export function clampPan(ox, oy, zoom) {
  const max = Math.max(0, (zoom - 1) * 0.5);
  return {
    ox: Math.max(-max, Math.min(max, ox)),
    oy: Math.max(-max, Math.min(max, oy)),
  };
}
