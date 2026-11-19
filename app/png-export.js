// png-export.js — one-click PNG export in the three common post sizes.
// The export is the app's own drawing, re-rendered at the chosen size
// by the same drawCover function that paints the live preview.
export const EXPORT_SIZES = {
  landscape: { w: 1920, h: 1080, label: "1920 × 1080" },
  square: { w: 1080, h: 1080, label: "1080 × 1080" },
  portrait: { w: 1080, h: 1350, label: "1080 × 1350" },
};

export function exportCoverPNG(drawCover, state, sizeName) {
  const size = EXPORT_SIZES[sizeName];
  if (!size) return Promise.reject(new Error("unknown export size " + sizeName));
  const canvas = document.createElement("canvas");
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext("2d");
  drawCover(ctx, size.w, size.h, state);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("PNG export failed"));
      else resolve({ blob, size, canvas });
    }, "image/png");
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return url;
}
