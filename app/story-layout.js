// story-layout.js — the five cover layouts. Every geometry is a fraction of the
// cover width/height, so the same layout draws at 1920x1080, 1080x1080 or 1080x1350.
// Each layout returns photo panels, a title zone and a footer strip.
export const LAYOUT_NAMES = {
  story: "Story · 5-panel",
  "hero-stack": "Hero + Stack",
  grid: "3 × 3 Grid",
  polaroid: "Polaroid Tilt",
  slices: "Slices",
};

function panel(key, x, y, w, h, rot = 0, frame = "edge") {
  return { key, x, y, w, h, rot, frame };
}

export function storyLayout(name) {
  if (name === "story") {
    return {
      panels: [
        panel("hero", 0.008, 0.014, 0.441, 0.611),
        panel("beat1", 0.455, 0.014, 0.188, 0.196),
        panel("beat2", 0.455, 0.221, 0.188, 0.196),
        panel("beat3", 0.455, 0.428, 0.188, 0.197),
        panel("right", 0.649, 0.014, 0.343, 0.611),
        panel("bottom1", 0.008, 0.636, 0.216, 0.197),
        panel("bottom2", 0.230, 0.636, 0.216, 0.197),
      ],
      title: { x: 0.452, y: 0.636, w: 0.540, h: 0.197, overlay: false },
      footer: { x: 0.008, y: 0.847, w: 0.984, h: 0.139 },
      badge: { x: 0.008, y: 0.014 },
    };
  }
  if (name === "hero-stack") {
    return {
      panels: [
        panel("hero", 0.008, 0.014, 0.585, 0.819),
        panel("beat1", 0.601, 0.014, 0.391, 0.264),
        panel("beat2", 0.601, 0.289, 0.391, 0.264),
        panel("beat3", 0.601, 0.564, 0.391, 0.269),
      ],
      title: { x: 0.008, y: 0.655, w: 0.585, h: 0.178, overlay: true },
      footer: { x: 0.008, y: 0.847, w: 0.984, h: 0.139 },
      badge: { x: 0.008, y: 0.014 },
    };
  }
  if (name === "grid") {
    const cells = [];
    const keys = ["hero", "beat1", "beat2", "beat3", "right", "bottom1", "bottom2", "extra1", "extra2"];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        cells.push(panel(keys[r * 3 + c], 0.008 + c * 0.331, 0.014 + r * 0.208, 0.322, 0.197));
      }
    }
    return {
      panels: cells,
      title: { x: 0.008, y: 0.648, w: 0.984, h: 0.185, overlay: true },
      footer: { x: 0.008, y: 0.847, w: 0.984, h: 0.139 },
      badge: { x: 0.008, y: 0.014 },
    };
  }
  if (name === "polaroid") {
    return {
      panels: [
        panel("hero", 0.035, 0.035, 0.540, 0.560, -0.035, "polaroid"),
        panel("beat1", 0.620, 0.040, 0.335, 0.270, 0.05, "polaroid"),
        panel("beat2", 0.650, 0.360, 0.300, 0.250, -0.05, "polaroid"),
        panel("bottom1", 0.060, 0.620, 0.250, 0.190, 0.03, "polaroid"),
        panel("bottom2", 0.330, 0.640, 0.250, 0.190, -0.03, "polaroid"),
      ],
      title: { x: 0.600, y: 0.640, w: 0.385, h: 0.193, overlay: false },
      footer: { x: 0.008, y: 0.847, w: 0.984, h: 0.139 },
      badge: { x: 0.600, y: 0.030 },
    };
  }
  // slices — five full-height vertical slices, title band across the bottom.
  return {
    panels: [
      panel("hero", 0.008, 0.014, 0.280, 0.819),
      panel("beat1", 0.294, 0.014, 0.160, 0.819),
      panel("beat2", 0.460, 0.014, 0.190, 0.819),
      panel("right", 0.656, 0.014, 0.160, 0.819),
      panel("bottom1", 0.822, 0.014, 0.170, 0.819),
    ],
    title: { x: 0.008, y: 0.640, w: 0.984, h: 0.193, overlay: true },
    footer: { x: 0.008, y: 0.847, w: 0.984, h: 0.139 },
    badge: { x: 0.008, y: 0.014 },
  };
}
