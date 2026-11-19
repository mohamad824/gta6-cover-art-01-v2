// caption-lettering.js — the giant gradient title, neon script subtitle,
// tagline band, starburst badge, star rating and case-file footer strip.
// All lettering is drawn with the shipped Oswald / Pacifico fonts.

export function drawCoverBackground(ctx, W, H, grade) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  if (grade === "night") {
    g.addColorStop(0, "#1c0533");
    g.addColorStop(0.5, "#3d0a4e");
    g.addColorStop(1, "#12031f");
  } else {
    g.addColorStop(0, "#4a1460");
    g.addColorStop(0.45, "#6a2278");
    g.addColorStop(1, "#2c0d44");
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Warm sunset spill from the top, the one visible light source.
  const glow = ctx.createRadialGradient(W * 0.5, -H * 0.1, 0, W * 0.5, -H * 0.1, W * 0.75);
  glow.addColorStop(0, grade === "night" ? "rgba(255,46,136,0.35)" : "rgba(255,190,80,0.45)");
  glow.addColorStop(1, "rgba(255,46,136,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  // Faint halftone dots over the bare background only — panels stay photographic.
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = "#ffd23e";
  const step = Math.max(10, W / 110);
  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, step * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function starPath(ctx, cx, cy, rOuter, rInner, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function drawStarburst(ctx, cx, cy, r, line1, line2) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.12);
  starPath(ctx, 0, 0, r, r * 0.78, 12);
  ctx.fillStyle = "#ffd23e";
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.strokeStyle = "#1a0533";
  ctx.stroke();
  ctx.fillStyle = "#1a0533";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 ${Math.round(r * 0.30)}px Oswald, sans-serif`;
  ctx.fillText(line1, 0, -r * 0.16);
  ctx.fillText(line2, 0, r * 0.20);
  ctx.restore();
}

export function drawEstBadge(ctx, x, y, W) {
  const w = W * 0.088;
  const h = Math.max(22, W * 0.026);
  ctx.save();
  ctx.fillStyle = "#ff2e88";
  ctx.strokeStyle = "#ffd9f2";
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 ${Math.round(h * 0.52)}px Oswald, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("EST. 2026", x + w / 2, y + h / 2 + 1);
  ctx.restore();
}

export function drawStars(ctx, x, y, size, value) {
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const cx = x + i * size * 1.25;
    const filled = Math.max(0, Math.min(1, value - i));
    starPath(ctx, cx, y, size * 0.55, size * 0.24, 5);
    ctx.fillStyle = "#3a1a5e";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffd23e";
    ctx.stroke();
    if (filled > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx - size * 0.55, y - size * 0.55, size * 1.1 * filled, size * 1.1);
      ctx.clip();
      starPath(ctx, cx, y, size * 0.55, size * 0.24, 5);
      ctx.fillStyle = "#ffd23e";
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

export function drawTitleBlock(ctx, zone, S, W, H) {
  const x = zone.x * W, y = zone.y * H, w = zone.w * W, h = zone.h * H;
  ctx.save();
  if (zone.overlay) {
    const scrim = ctx.createLinearGradient(0, y, 0, y + h);
    scrim.addColorStop(0, "rgba(20,4,36,0)");
    scrim.addColorStop(0.35, "rgba(20,4,36,0.72)");
    scrim.addColorStop(1, "rgba(20,4,36,0.92)");
    ctx.fillStyle = scrim;
    ctx.fillRect(x, y, w, h);
  } else {
    const bg = ctx.createLinearGradient(x, y, x + w, y + h);
    bg.addColorStop(0, "#7d2f92");
    bg.addColorStop(1, "#4e1560");
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);
  }
  const pad = w * 0.02;
  // Stars, top-right of the title zone.
  drawStars(ctx, x + w - pad - 5 * h * 0.16 * 1.25, y + h * 0.14, h * 0.16, S.stars);
  // Giant gradient title with a dark outline and drop shadow.
  const title = (S.title || "BRINEHAVEN").toUpperCase();
  let fs = h * 0.52;
  ctx.font = `800 ${Math.round(fs)}px Oswald, sans-serif`;
  const maxW = w - pad * 2;
  while (fs > 20 && ctx.measureText(title).width > maxW) {
    fs -= 2;
    ctx.font = `800 ${Math.round(fs)}px Oswald, sans-serif`;
  }
  const ty = y + h * 0.46;
  const grad = ctx.createLinearGradient(x, ty - fs, x, ty + fs * 0.2);
  grad.addColorStop(0, "#ffe95e");
  grad.addColorStop(0.55, "#ff9a3d");
  grad.addColorStop(1, "#ff2e88");
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(3, fs * 0.09);
  ctx.strokeStyle = "#160425";
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = fs * 0.12;
  ctx.shadowOffsetY = fs * 0.05;
  ctx.strokeText(title, x + pad, ty);
  ctx.fillStyle = grad;
  ctx.fillText(title, x + pad, ty);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  // White neon script overlapping the title's lower right.
  const script = S.script || "";
  if (script) {
    let sfs = h * 0.36;
    ctx.font = `${Math.round(sfs)}px Pacifico, cursive`;
    while (sfs > 12 && ctx.measureText(script).width > w * 0.92) {
      sfs -= 2;
      ctx.font = `${Math.round(sfs)}px Pacifico, cursive`;
    }
    ctx.save();
    ctx.translate(x + w - pad, y + h * 0.62);
    ctx.rotate(-0.05);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#ff2e88";
    ctx.shadowBlur = sfs * 0.35;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(script, 0, 0);
    ctx.restore();
  }
  // Black tagline band with yellow condensed caps.
  const bh = h * 0.22;
  const by = y + h - bh - h * 0.03;
  ctx.fillStyle = "#12031f";
  ctx.fillRect(x + pad, by, w - pad * 2, bh);
  ctx.strokeStyle = "#ffd23e";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + pad, by, w - pad * 2, bh);
  ctx.fillStyle = "#ffd23e";
  let tfs = bh * 0.52;
  ctx.font = `700 ${Math.round(tfs)}px Oswald, sans-serif`;
  const tag = (S.tagline || "").toUpperCase();
  while (tfs > 10 && ctx.measureText(tag).width > w - pad * 4) {
    tfs -= 1;
    ctx.font = `700 ${Math.round(tfs)}px Oswald, sans-serif`;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(tag, x + w / 2, by + bh / 2 + 1);
  ctx.restore();
}

export function drawFooterStrip(ctx, rect, text, W, H) {
  const x = rect.x * W, y = rect.y * H, w = rect.w * W, h = rect.h * H;
  ctx.save();
  ctx.fillStyle = "#12031f";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#ffb400";
  ctx.fillRect(x, y, w, Math.max(2, h * 0.05));
  ctx.fillStyle = "#f5e9c8";
  let fs = h * 0.30;
  ctx.font = `600 ${Math.round(fs)}px Oswald, sans-serif`;
  while (fs > 10 && ctx.measureText(text).width > w * 0.94) {
    fs -= 1;
    ctx.font = `600 ${Math.round(fs)}px Oswald, sans-serif`;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + w / 2, y + h * 0.55);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
