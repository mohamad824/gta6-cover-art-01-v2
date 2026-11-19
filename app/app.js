// app.js — VICE CITY NIGHTS editor: loads photos, paints the live preview
// with drawCover, and wires every control (layout, grade flip, caption,
// panel crop, Poster Ink, PNG export). No 3D anywhere: photos only.
import { storyLayout, LAYOUT_NAMES } from "./story-layout.js";
import { gradeFilterFor, gradeWashFor, posterInkFilter, drawPosterInkDots } from "./grade-flip.js";
import { coverDraw, panelAt, clampPan } from "./panel-crop.js";
import { drawCoverBackground, drawTitleBlock, drawFooterStrip, drawStarburst, drawEstBadge } from "./caption-lettering.js";
import { exportCoverPNG, downloadBlob } from "./png-export.js";

const SAMPLES = [
  { id: "hero-bike-duo", file: "hero-bike-duo.jpg", label: "Hero chase" },
  { id: "hero-synthwave-car", file: "hero-synthwave-car.jpg", label: "Synthwave car" },
  { id: "boulevard", file: "boulevard.jpg", label: "Girl at sunset" },
  { id: "night-market", file: "night-market.jpg", label: "Night market" },
  { id: "neon-street", file: "neon-street.jpg", label: "Neon street" },
  { id: "harbour-sunset", file: "harbour-sunset.jpg", label: "Harbour dawn" },
  { id: "palm-beach", file: "palm-beach.jpg", label: "Palm beach" },
  { id: "orange-boulevard", file: "orange-boulevard.jpg", label: "Orange streak" },
  { id: "pier", file: "pier.jpg", label: "The pier" },
];

const PANEL_LABELS = {
  hero: "HERO CHASE", beat1: "BEAT 1 — THE GIRL", beat2: "BEAT 2 — NIGHT MARKET",
  beat3: "BEAT 3 — NEON STREET", right: "GETAWAY CAR", bottom1: "HARBOUR DAWN",
  bottom2: "PALM BEACH", extra1: "ORANGE STREAK", extra2: "THE PIER",
};

const DEFAULT_PHOTO = {
  hero: "hero-bike-duo", beat1: "boulevard", beat2: "night-market", beat3: "neon-street",
  right: "hero-synthwave-car", bottom1: "harbour-sunset", bottom2: "palm-beach",
  extra1: "orange-boulevard", extra2: "pier",
};

// Default pan per panel: beat1's photo is a portrait, so shift the crop up
// to keep the woman's face (not her torso) in the wide centre panel.
const DEFAULT_PAN = { hero: { ox: 0.10, oy: 0 }, beat1: { ox: 0, oy: 0.35 } };

function freshPanels() {
  const out = {};
  for (const key of Object.keys(DEFAULT_PHOTO)) {
    const pan = DEFAULT_PAN[key] || { ox: 0, oy: 0 };
    out[key] = { src: DEFAULT_PHOTO[key], zoom: 1, ox: pan.ox, oy: pan.oy, grade: "auto" };
  }
  return out;
}

const state = {
  layout: "story",
  grade: "day",
  title: "BRINEHAVEN",
  script: "Tide City Nights",
  tagline: "THE TIDE DECIDES THE ROADS",
  footer: "CASE 07 — THE GULLWING JOB · HARBOUR WARDENS ON THE TAIL · BRINE FM 91.4",
  stars: 4.5,
  badge: "TIDE RUNS 2026",
  poster: false,
  posterAmt: 0.5,
  selected: "hero",
  panels: freshPanels(),
};

const images = new Map();
const canvas = document.getElementById("cover-canvas");
const ctx = canvas.getContext("2d");

// drawCover — the one function that paints the whole cover, preview and export alike.
export function drawCover(c, W, H, S, opts = {}) {
  const layout = storyLayout(S.layout);
  drawCoverBackground(c, W, H, S.grade);
  const gap = Math.max(3, W * 0.006);
  for (const p of layout.panels) {
    const slot = S.panels[p.key];
    if (!slot) continue;
    const img = images.get(slot.src);
    const x = p.x * W, y = p.y * H, w = p.w * W, h = p.h * H;
    c.save();
    if (p.rot) {
      c.translate(x + w / 2, y + h / 2);
      c.rotate(p.rot);
      c.translate(-(x + w / 2), -(y + h / 2));
    }
    if (p.frame === "polaroid") {
      c.shadowColor = "rgba(0,0,0,0.5)";
      c.shadowBlur = W * 0.012;
      c.shadowOffsetY = W * 0.004;
      c.fillStyle = "#fdf8ef";
      c.fillRect(x - gap, y - gap, w + gap * 2, h + gap * 4);
      c.shadowColor = "transparent";
      c.shadowBlur = 0;
      c.shadowOffsetY = 0;
      c.fillStyle = "#fdf8ef";
      c.font = `600 ${Math.round(h * 0.09)}px Oswald, sans-serif`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = "#2b0a44";
      c.fillText(PANEL_LABELS[p.key] || p.key, x + w / 2, y + h + gap * 2);
    }
    const photoH = p.frame === "polaroid" ? h * 0.86 : h;
    c.beginPath();
    c.rect(x, y, w, photoH);
    c.clip();
    if (img) {
      c.filter = S.poster ? posterInkFilter(S.posterAmt) : gradeFilterFor(slot.grade, S.grade);
      coverDraw(c, img, x, y, w, photoH, slot.zoom, slot.ox, slot.oy);
      c.filter = "none";
      const wash = gradeWashFor(slot.grade, S.grade);
      if (wash) {
        c.globalCompositeOperation = wash.blend;
        c.fillStyle = wash.color;
        c.fillRect(x, y, w, photoH);
        c.globalCompositeOperation = "source-over";
      }
      if (S.poster) drawPosterInkDots(c, x, y, w, photoH, S.posterAmt);
    } else {
      c.fillStyle = "#3a1a5e";
      c.fillRect(x, y, w, photoH);
    }
    c.restore();
    // Panel frame edge.
    c.save();
    if (p.rot) {
      c.translate(x + w / 2, y + h / 2);
      c.rotate(p.rot);
      c.translate(-(x + w / 2), -(y + h / 2));
    }
    c.lineWidth = Math.max(2, W * 0.003);
    c.strokeStyle = "#160425";
    c.strokeRect(x, y, w, photoH);
    c.restore();
    // Selected-panel highlight, preview only — never in an export.
    if (opts.preview && S.selected === p.key) {
      c.save();
      c.lineWidth = Math.max(3, W * 0.005);
      c.strokeStyle = "#ffb400";
      c.setLineDash([W * 0.012, W * 0.006]);
      c.strokeRect(x - 2, y - 2, w + 4, photoH + 4);
      c.setLineDash([]);
      c.fillStyle = "#ffb400";
      c.fillRect(x, y - H * 0.028, Math.max(90, W * 0.11), H * 0.028);
      c.fillStyle = "#160425";
      c.font = `700 ${Math.round(H * 0.02)}px Oswald, sans-serif`;
      c.textAlign = "left";
      c.textBaseline = "middle";
      c.fillText(PANEL_LABELS[p.key] || p.key, x + 6, y - H * 0.014);
      c.restore();
    }
  }
  drawTitleBlock(c, layout.title, S, W, H);
  const badgeR = W * 0.042;
  const badgeWords = (S.badge || "TIDE RUNS 2026").split(" ");
  drawStarburst(c, layout.badge.x * W + badgeR + W * 0.006, layout.badge.y * H + badgeR + H * 0.008, badgeR,
    badgeWords.slice(0, 2).join(" "), badgeWords.slice(2).join(" ") || "2026");
  drawEstBadge(c, W - W * 0.088 - W * 0.008, H * 0.012, W);
  drawFooterStrip(c, layout.footer, S.footer, W, H);
}

function renderPreview() {
  drawCover(ctx, canvas.width, canvas.height, state, { preview: true });
}

function loadImage(id, src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { images.set(id, img); resolve(img); };
    img.onerror = () => reject(new Error("could not load " + src));
    img.src = src;
  });
}

async function loadAllSamples() {
  await Promise.all(SAMPLES.map((s) => loadImage(s.id, "samples/" + s.file).catch(() => null)));
}

// ---- UI: sample strip -------------------------------------------------------
const samplesBar = document.getElementById("samples-bar");
function buildSamplesBar() {
  samplesBar.innerHTML = "";
  for (const s of SAMPLES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sample-thumb";
    b.dataset.src = s.id;
    b.innerHTML = "";
    const im = document.createElement("img");
    im.src = "samples/" + s.file;
    im.alt = s.label;
    const sp = document.createElement("span");
    sp.textContent = s.label;
    b.append(im, sp);
    b.addEventListener("click", () => {
      state.panels[state.selected].src = s.id;
      syncPanelControls();
      renderPreview();
    });
    samplesBar.appendChild(b);
  }
}

function buildPhotoSelect() {
  const sel = document.getElementById("panel-photo");
  sel.innerHTML = "";
  for (const s of SAMPLES) {
    const o = document.createElement("option");
    o.value = s.id;
    o.textContent = s.label;
    sel.appendChild(o);
  }
}

// ---- UI: sync ---------------------------------------------------------------
const $ = (id) => document.getElementById(id);
function syncPanelControls() {
  const slot = state.panels[state.selected];
  $("selected-name").textContent = PANEL_LABELS[state.selected] || state.selected;
  $("panel-photo").value = slot.src;
  $("panel-grade").value = slot.grade;
  $("panel-zoom").value = slot.zoom;
  $("zoom-val").textContent = slot.zoom.toFixed(2) + "×";
  document.querySelectorAll(".sample-thumb").forEach((t) => {
    t.classList.toggle("active", t.dataset.src === slot.src);
  });
}

function syncCaptionControls() {
  $("cap-title").value = state.title;
  $("cap-script").value = state.script;
  $("cap-tagline").value = state.tagline;
  $("cap-footer").value = state.footer;
  $("cap-stars").value = state.stars;
  $("stars-val").textContent = state.stars.toFixed(1) + " ★";
  $("cap-badge").value = state.badge;
}

// ---- UI: events ---------------------------------------------------------------
document.querySelectorAll(".layout-btn").forEach((b) => {
  b.addEventListener("click", () => {
    state.layout = b.dataset.layout;
    document.querySelectorAll(".layout-btn").forEach((x) => x.classList.toggle("active", x === b));
    renderPreview();
  });
});

function setGrade(g) {
  state.grade = g;
  $("grade-day").classList.toggle("active", g === "day");
  $("grade-night").classList.toggle("active", g === "night");
  renderPreview();
}
$("grade-day").addEventListener("click", () => setGrade("day"));
$("grade-night").addEventListener("click", () => setGrade("night"));

$("panel-photo").addEventListener("change", (e) => {
  state.panels[state.selected].src = e.target.value;
  renderPreview();
});
$("panel-grade").addEventListener("change", (e) => {
  state.panels[state.selected].grade = e.target.value;
  renderPreview();
});
$("panel-zoom").addEventListener("input", (e) => {
  state.panels[state.selected].zoom = parseFloat(e.target.value);
  $("zoom-val").textContent = state.panels[state.selected].zoom.toFixed(2) + "×";
  renderPreview();
});
$("poster-ink").addEventListener("change", (e) => { state.poster = e.target.checked; renderPreview(); });
$("poster-amt").addEventListener("input", (e) => { state.posterAmt = parseFloat(e.target.value); renderPreview(); });
$("fill-all").addEventListener("click", () => {
  const src = state.panels[state.selected].src;
  for (const k of Object.keys(state.panels)) state.panels[k].src = src;
  renderPreview();
});
$("reset-panel").addEventListener("click", () => {
  const slot = state.panels[state.selected];
  slot.zoom = 1; slot.ox = 0; slot.oy = 0;
  syncPanelControls();
  renderPreview();
});

$("cap-title").addEventListener("input", (e) => { state.title = e.target.value; renderPreview(); });
$("cap-script").addEventListener("input", (e) => { state.script = e.target.value; renderPreview(); });
$("cap-tagline").addEventListener("input", (e) => { state.tagline = e.target.value; renderPreview(); });
$("cap-footer").addEventListener("input", (e) => { state.footer = e.target.value; renderPreview(); });
$("cap-stars").addEventListener("input", (e) => {
  state.stars = parseFloat(e.target.value);
  $("stars-val").textContent = state.stars.toFixed(1) + " ★";
  renderPreview();
});
$("cap-badge").addEventListener("input", (e) => { state.badge = e.target.value; renderPreview(); });

// ---- Upload + drag-and-drop ---------------------------------------------------
let uploadCount = 0;
function addUploadedPhoto(file) {
  const reader = new FileReader();
  reader.onload = () => {
    uploadCount += 1;
    const id = "upload-" + uploadCount;
    const img = new Image();
    img.onload = () => {
      images.set(id, img);
      SAMPLES.push({ id, file: "", label: file.name.slice(0, 18) || "Your photo" });
      const sel = document.getElementById("panel-photo");
      const o = document.createElement("option");
      o.value = id;
      o.textContent = "Your photo — " + file.name.slice(0, 18);
      sel.appendChild(o);
      state.panels[state.selected].src = id;
      syncPanelControls();
      renderPreview();
      $("export-status").textContent = "Loaded “" + file.name + "” into " + (PANEL_LABELS[state.selected] || "the panel") + ".";
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}
$("photo-upload").addEventListener("change", (e) => {
  for (const f of e.target.files) addUploadedPhoto(f);
  e.target.value = "";
});
const dropzone = document.getElementById("dropzone");
["dragenter", "dragover"].forEach((ev) => dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add("over"); }));
["dragleave", "drop"].forEach((ev) => dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.remove("over"); }));
dropzone.addEventListener("drop", (e) => {
  for (const f of e.dataTransfer.files) if (f.type.startsWith("image/")) addUploadedPhoto(f);
});
canvas.addEventListener("dragover", (e) => e.preventDefault());
canvas.addEventListener("drop", (e) => {
  e.preventDefault();
  for (const f of e.dataTransfer.files) if (f.type.startsWith("image/")) addUploadedPhoto(f);
});

// ---- Canvas: click to select, drag to pan, scroll to zoom --------------------
let dragging = null;
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * canvas.width,
    y: ((e.clientY - r.top) / r.height) * canvas.height,
  };
}
canvas.addEventListener("pointerdown", (e) => {
  const pt = canvasPoint(e);
  const layout = storyLayout(state.layout);
  const hit = panelAt(layout, pt.x, pt.y, canvas.width, canvas.height);
  if (!hit) return;
  state.selected = hit.key;
  syncPanelControls();
  dragging = { key: hit.key, x: pt.x, y: pt.y, ox: state.panels[hit.key].ox, oy: state.panels[hit.key].oy };
  canvas.setPointerCapture(e.pointerId);
  renderPreview();
});
canvas.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const pt = canvasPoint(e);
  const layout = storyLayout(state.layout);
  const p = layout.panels.find((q) => q.key === dragging.key);
  if (!p) return;
  const slot = state.panels[dragging.key];
  const clamped = clampPan(
    dragging.ox + (pt.x - dragging.x) / (p.w * canvas.width),
    dragging.oy + (pt.y - dragging.y) / (p.h * canvas.height),
    slot.zoom
  );
  slot.ox = clamped.ox;
  slot.oy = clamped.oy;
  renderPreview();
});
canvas.addEventListener("pointerup", () => { dragging = null; });
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const slot = state.panels[state.selected];
  slot.zoom = Math.max(1, Math.min(2.5, slot.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
  syncPanelControls();
  renderPreview();
}, { passive: false });

// ---- Export -------------------------------------------------------------------
async function doExport(sizeName, filename) {
  $("export-status").textContent = "Exporting " + sizeName + "…";
  try {
    const { blob, size } = await exportCoverPNG(drawCover, state, sizeName);
    downloadBlob(blob, filename);
    $("export-status").textContent = "Exported " + filename + " — " + size.w + " × " + size.h + " PNG (" + Math.round(blob.size / 1024) + " KiB).";
    return blob;
  } catch (err) {
    $("export-status").textContent = "Export failed: " + err.message;
    throw err;
  }
}
$("export-landscape").addEventListener("click", () => doExport("landscape", "vice-city-nights-1920x1080.png"));
$("export-square").addEventListener("click", () => doExport("square", "vice-city-nights-1080x1080.png"));
$("export-portrait").addEventListener("click", () => doExport("portrait", "vice-city-nights-1080x1350.png"));

// Automation hooks for testing: export returns a data URL, no download.
window.__exportCover = async (sizeName) => {
  const { blob } = await exportCoverPNG(drawCover, state, sizeName);
  return await new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.readAsDataURL(blob);
  });
};
window.__viceCityState = state;
window.__coverReady = false;

// ---- Boot -----------------------------------------------------------------------
buildSamplesBar();
buildPhotoSelect();
syncPanelControls();
syncCaptionControls();
loadAllSamples().then(async () => {
  try {
    await document.fonts.load("800 100px Oswald");
    await document.fonts.load("40px Pacifico");
    await document.fonts.ready;
  } catch (err) { /* system font fallback still renders */ }
  renderPreview();
  window.__coverReady = true;
});
renderPreview();
