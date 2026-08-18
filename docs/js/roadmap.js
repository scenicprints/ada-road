// ═══════════════════════════════════════════════════════════════════════
//  EL PARQUE — the roadmap
//
//  This screen is for feeling, not for doing. She can look around it and
//  read a step, but nothing is ticked off here; that lives on Hoy and on
//  El camino.
//
//  Canvas rather than SVG because it needs depth-sorted objects, moving
//  water, drifting weather and a few hundred things on screen at once.
//
//  Two rules learned the hard way and worth keeping:
//    · everything in the park lives in WORLD coordinates (u,v) and is
//      drawn inside the camera transform. Butterflies were once drawn in
//      screen space and slid across the park whenever you panned.
//    · anything that stands on the ground is sorted by (u+v) before it is
//      drawn, or it overlaps the wrong things.
// ═══════════════════════════════════════════════════════════════════════

const TW = 64, TH = 32;                       // tile size on screen
const iso = (u, v, z = 0) => ({ x: (u - v) * TW / 2, y: (u + v) * TH / 2 - z });
const GU = 30, GV = 30;                       // a square lawn is a tall diamond
const mix = (a, b, t) => {
  const p = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const A = p(a), B = p(b);
  return `rgb(${A.map((x, i) => Math.round(x + (B[i] - x) * t)).join(',')})`;
};

export function mountRoadmap(host, api) {
  const { steps, currentIndex } = api;
  const CURRENT = Math.max(0, Math.min(steps.length - 1, currentIndex));

  /* ── the path ──────────────────────────────────────────────────── */
  const PATH = [];
  for (let i = 0; i <= 240; i++) {
    const t = i / 240;
    const along = 4 + t * (GU + GV - 8);
    const across = Math.sin(t * Math.PI * 3.0) * 4.6 + Math.sin(t * Math.PI * 7.1) * 1.2;
    PATH.push({ u: GU - (along + across) / 2, v: GV - (along - across) / 2 });
  }
  const cum = [0];
  for (let i = 1; i < PATH.length; i++) cum.push(cum[i - 1] + Math.hypot(PATH[i].u - PATH[i - 1].u, PATH[i].v - PATH[i - 1].v));
  const PLEN = cum[cum.length - 1];
  function pathAt(d) {
    d = Math.max(0, Math.min(PLEN, d));
    let i = 1; while (i < cum.length && cum[i] < d) i++;
    const a = PATH[i - 1], b = PATH[Math.min(i, PATH.length - 1)];
    const t = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
    return { u: a.u + (b.u - a.u) * t, v: a.v + (b.v - a.v) * t };
  }

  const NODES = steps.map((s, i) => {
    const d = 1.2 + (PLEN - 2.4) * (i / Math.max(1, steps.length - 1));
    const p = pathAt(d), q = pathAt(Math.min(PLEN, d + 0.4));
    let nu = -(q.v - p.v), nv = (q.u - p.u); const L = Math.hypot(nu, nv) || 1; nu /= L; nv /= L;
    const side = i % 2 ? 1 : -1;
    return { ...s, i, d, pu: p.u, pv: p.v, u: p.u + nu * 0.9 * side, v: p.v + nv * 0.9 * side };
  });

  /* ── furniture ─────────────────────────────────────────────────── */
  const rnd = (n) => { const x = Math.sin(n * 9301 + 49297) * 233280; return x - Math.floor(x); };
  const nearPath = (u, v) => { let m = 1e9; for (let i = 0; i < PATH.length; i += 4) m = Math.min(m, Math.hypot(PATH[i].u - u, PATH[i].v - v)); return m; };

  const MURAL_AT = 0.42;
  const MURAL = (() => { const c = pathAt(PLEN * MURAL_AT); return { u: c.u + 2.6, v: c.v - 1.4 }; })();
  const CEIBA = (() => { const p = pathAt(PLEN * 0.66); return { u: p.u + 3.6, v: p.v - 3.2 }; })();
  const MOTMOT = (() => { const p = pathAt(PLEN * 0.24); return { u: p.u - 3.4, v: p.v + 2.9 }; })();
  const PONDS = [{ u: 8, v: 19, r: 3.4 }, { u: 21, v: 9, r: 3.0 }];
  const DUCKS = [{ p: 0, a: 0.4, r: 1.6, sp: 0.13 }, { p: 0, a: 2.9, r: 2.1, sp: 0.11 }, { p: 1, a: 1.2, r: 1.4, sp: 0.15 }];

  const TREES = [], BENCHES = [], FLOWERS = [];
  for (let n = 0; n < 720; n++) {
    const u = 1.2 + rnd(n) * (GU - 2.4), v = 1.2 + rnd(n + 777) * (GV - 2.4);
    const dp = nearPath(u, v);
    if (dp < 2.1) continue;
    if (Math.hypot(u - PONDS[0].u, v - PONDS[0].v) < 3.8 || Math.hypot(u - PONDS[1].u, v - PONDS[1].v) < 3.4) continue;
    if (u + v > 55 || u + v < 6) continue;
    if (Math.hypot(u - CEIBA.u, v - CEIBA.v) < 3.6) continue;
    if (Math.hypot(u - MOTMOT.u, v - MOTMOT.v) < 3.2) continue;
    if (Math.hypot(u - MURAL.u, v - MURAL.v) < 5.2 || (Math.abs(u - MURAL.u) < 3.2 && v > MURAL.v - 3.6 && v < MURAL.v + 3.6)) continue;
    const k = rnd(n + 31);
    if (k < 0.55 && TREES.length < 86) TREES.push({ u, v, s: 0.85 + rnd(n + 5) * 0.5, ph: rnd(n + 9) * 6.28, pine: rnd(n + 13) < 0.3 });
    else if (k < 0.66 && dp < 3.2 && BENCHES.length < 8) BENCHES.push({ u, v, f: rnd(n + 2) < 0.5 ? 1 : -1 });
    else if (k < 0.90) FLOWERS.push({ u, v, c: ['#E7A2A9', '#F2CF6E', '#EDE9E0', '#D98A9C'][Math.floor(rnd(n + 21) * 4)] });
  }

  /* ── living things ─────────────────────────────────────────────── */
  const squirrels = [], morphos = [];
  let nextSquirrel = 4, nextMorpho = 3;
  let look = 0, lookTarget = 0;               // where Ottis's head is turned

  /* ── canvas + camera ───────────────────────────────────────────── */
  const canvas = document.createElement('canvas');
  canvas.className = 'park';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let DPR = 1, VW = 0, VH = 0;
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    VW = canvas.clientWidth; VH = canvas.clientHeight;
    canvas.width = VW * DPR; canvas.height = VH * DPR;
  }

  const cam = { x: 0, y: 0, s: 1 };
  const MIN = 0.22, MAX = 2.4;
  const bounds = (() => {
    const c = [iso(0, 0), iso(GU, 0), iso(0, GV), iso(GU, GV)];
    return { x0: Math.min(...c.map(p => p.x)) - 40, x1: Math.max(...c.map(p => p.x)) + 40,
             y0: Math.min(...c.map(p => p.y)) - 180, y1: Math.max(...c.map(p => p.y)) + 60 };
  })();
  function centreOn(wx, wy, s) {
    cam.s = Math.max(MIN, Math.min(MAX, s));
    cam.x = VW / 2 - wx * cam.s; cam.y = VH / 2 - wy * cam.s;
  }
  function focusOttis() { const p = iso(NODES[CURRENT].pu, NODES[CURRENT].pv); centreOn(p.x, p.y - 30, 1.35); }
  function whole() {
    const w = bounds.x1 - bounds.x0, h = bounds.y1 - bounds.y0;
    cam.s = Math.max(MIN, Math.min(MAX, Math.min(VW / (w * 0.98), (VH - 90) / (h * 0.98))));
    cam.x = VW / 2 - ((bounds.x0 + bounds.x1) / 2) * cam.s;
    cam.y = (VH - 90) / 2 - ((bounds.y0 + bounds.y1) / 2) * cam.s;
  }
  function zoomAt(cx, cy, f) {
    const n = Math.max(MIN, Math.min(MAX, cam.s * f)), k = n / cam.s;
    cam.x = cx - (cx - cam.x) * k; cam.y = cy - (cy - cam.y) * k; cam.s = n;
  }

  /* ── drawing ───────────────────────────────────────────────────── */
  const tile = (u, v, f) => {
    const a = iso(u, v), b = iso(u + 1, v), c = iso(u + 1, v + 1), d = iso(u, v + 1);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.closePath();
    ctx.fillStyle = f; ctx.fill();
  };
  const shade = (x, y, rx, ry, a = 0.16) => {
    ctx.fillStyle = `rgba(20,35,25,${a})`; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 6.283); ctx.fill();
  };

  function drawTree(t, T, wet) {
    const p = iso(t.u, t.v), s = t.s, sway = Math.sin(T * 0.9 + t.ph) * 2.2 * s * (1 + wet * 0.6);
    shade(p.x + 6 * s, p.y + 2, 16 * s, 7 * s, 0.14);
    ctx.fillStyle = '#6E4B2E'; ctx.fillRect(p.x - 3 * s, p.y - 26 * s, 6 * s, 26 * s);
    if (t.pine) {
      const g1 = mix('#2F7A4E', '#255F3E', wet * 0.4), g2 = mix('#3D9160', '#2E7049', wet * 0.4);
      for (let k = 0; k < 3; k++) {
        const yy = p.y - 24 * s - k * 16 * s, w = (30 - k * 7) * s;
        ctx.fillStyle = k % 2 ? g1 : g2;
        ctx.beginPath(); ctx.moveTo(p.x + sway * (k + 1) / 3, yy - 24 * s); ctx.lineTo(p.x - w, yy); ctx.lineTo(p.x + w, yy); ctx.closePath(); ctx.fill();
      }
    } else {
      ctx.fillStyle = mix('#5FA86B', '#4B8A57', wet * 0.45);
      ctx.beginPath(); ctx.ellipse(p.x + sway, p.y - 42 * s, 24 * s, 22 * s, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = mix('#7BC183', '#5E9E68', wet * 0.45);
      ctx.beginPath(); ctx.ellipse(p.x - 6 * s + sway, p.y - 48 * s, 13 * s, 12 * s, 0, 0, 6.283); ctx.fill();
    }
  }
  function drawBench(b) {
    const p = iso(b.u, b.v), f = b.f;
    shade(p.x, p.y + 3, 20, 6, 0.14);
    ctx.fillStyle = '#8B5A2B';
    ctx.beginPath(); ctx.moveTo(p.x - 20, p.y - 6); ctx.lineTo(p.x + 2, p.y - 17); ctx.lineTo(p.x + 22, p.y - 6); ctx.lineTo(p.x, p.y + 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#A66E36';
    ctx.beginPath(); ctx.moveTo(p.x - 20 * f, p.y - 6); ctx.lineTo(p.x + 2 * f, p.y - 17); ctx.lineTo(p.x + 2 * f, p.y - 27); ctx.lineTo(p.x - 20 * f, p.y - 16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4A3220'; ctx.fillRect(p.x - 14, p.y - 4, 3, 8); ctx.fillRect(p.x + 12, p.y - 4, 3, 8);
  }
  function drawLamp(s, lit, wet) {
    const p = iso(s.u, s.v);
    shade(p.x, p.y + 2, 9, 4, 0.16);
    ctx.fillStyle = '#4A4238'; ctx.fillRect(p.x - 2, p.y - 46, 4, 46);
    ctx.beginPath(); ctx.arc(p.x, p.y - 50, 6, 0, 6.283); ctx.fillStyle = lit ? '#FFD37A' : '#DCD3C0'; ctx.fill();
    if (lit) {
      const g = ctx.createRadialGradient(p.x, p.y - 50, 2, p.x, p.y - 50, 34 + wet * 10);
      g.addColorStop(0, `rgba(255,214,120,${0.55 + wet * 0.25})`); g.addColorStop(1, 'rgba(255,214,120,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y - 50, 44, 0, 6.283); ctx.fill();
    }
    const m = iso(s.pu, s.pv);
    ctx.beginPath(); ctx.arc(m.x, m.y - 1, s.i === CURRENT ? 7 : 5, 0, 6.283);
    ctx.fillStyle = lit ? '#E7A63C' : '#EFE7D6';
    ctx.strokeStyle = s.i === CURRENT ? '#C4671B' : 'rgba(60,45,30,.35)';
    ctx.lineWidth = s.i === CURRENT ? 3 : 1.5; ctx.fill(); ctx.stroke();
  }
  function drawDuck(d, T) {
    const pd = PONDS[d.p], a = d.a + T * d.sp;
    const p = iso(pd.u + Math.cos(a) * d.r * 0.55, pd.v + Math.sin(a) * d.r * 0.55);
    const bob = Math.sin(T * 2.3 + d.a) * 1.2;
    ctx.fillStyle = '#F4EBD8'; ctx.beginPath(); ctx.ellipse(p.x, p.y - 4 + bob, 7, 4.5, 0, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.arc(p.x + 5, p.y - 9 + bob, 3.2, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#E9A23B'; ctx.fillRect(p.x + 8, p.y - 9.5 + bob, 3.5, 1.6);
  }
  function drawSquirrel(q, T) {
    const p = iso(q.u, q.v), hop = Math.abs(Math.sin(T * 14)) * 4, dir = q.du >= 0 ? 1 : -1;
    ctx.save(); ctx.translate(p.x, p.y - hop); ctx.scale(dir, 1);
    shade(0, hop + 2, 7, 3, 0.15);
    ctx.fillStyle = '#8B5A2B';
    ctx.beginPath(); ctx.ellipse(0, -5, 6.5, 4, 0, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -8, 3.2, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#8B5A2B'; ctx.lineWidth = 3.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-6, -5); ctx.quadraticCurveTo(-13, -6, -11, -15); ctx.stroke();
    ctx.fillStyle = '#1A120C'; ctx.beginPath(); ctx.arc(7.2, -8.6, 0.9, 0, 6.283); ctx.fill();
    ctx.restore();
  }
  // Blue morpho. In WORLD space — drawn in screen space it slid across the
  // park whenever you panned, and was the size of a kite.
  function drawMorpho(m, T) {
    const g0 = iso(m.u, m.v);
    shade(g0.x, g0.y, 3.2, 1.6, 0.10);
    const p = iso(m.u, m.v, m.z);
    const flap = Math.abs(Math.sin(T * 9 + m.ph));
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(m.dv, m.du) * 0.12);
    const w = 6.2, h = 4.4 * (0.35 + 0.65 * flap);
    const g = ctx.createLinearGradient(-w, 0, w, 0);
    g.addColorStop(0, '#2456C9'); g.addColorStop(0.5, '#4C8DF0'); g.addColorStop(1, '#2456C9');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(-w * 0.55, -2, w * 0.55, h, -0.3, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.55, -2, w * 0.55, h, 0.3, 0, 6.283); ctx.fill();
    ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(20,18,17,.7)';
    ctx.beginPath(); ctx.ellipse(-w * 0.55, -2, w * 0.55, h, -0.3, 0, 6.283); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(w * 0.55, -2, w * 0.55, h, 0.3, 0, 6.283); ctx.stroke();
    ctx.fillStyle = '#1A1512'; ctx.fillRect(-0.5, -3, 1, 6);
    ctx.restore();
  }
  function drawCeiba(T, wet) {
    const p = iso(CEIBA.u, CEIBA.v), sway = Math.sin(T * 0.6) * 2;
    shade(p.x + 8, p.y + 3, 44, 14, 0.16);
    ctx.fillStyle = '#8C7A62';
    ctx.beginPath(); ctx.moveTo(p.x - 14, p.y); ctx.lineTo(p.x - 6, p.y - 60); ctx.lineTo(p.x + 6, p.y - 60); ctx.lineTo(p.x + 14, p.y); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(p.x - 26, p.y + 2); ctx.lineTo(p.x - 8, p.y - 18); ctx.lineTo(p.x - 6, p.y); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(p.x + 26, p.y + 2); ctx.lineTo(p.x + 8, p.y - 18); ctx.lineTo(p.x + 6, p.y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = mix('#5A9E5E', '#487F4B', wet * 0.45);
    ctx.beginPath(); ctx.ellipse(p.x + sway, p.y - 72, 58, 22, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = mix('#79B77B', '#5E9660', wet * 0.45);
    ctx.beginPath(); ctx.ellipse(p.x - 14 + sway, p.y - 80, 30, 16, 0, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.ellipse(p.x + 22 + sway, p.y - 78, 26, 14, 0, 0, 6.283); ctx.fill();
  }
  function drawMotmotTree(T, wet) {
    const p = iso(MOTMOT.u, MOTMOT.v), sway = Math.sin(T * 0.8 + 1.3) * 2;
    shade(p.x + 6, p.y + 2, 20, 8, 0.14);
    ctx.fillStyle = '#6E4B2E'; ctx.fillRect(p.x - 4, p.y - 54, 8, 54);
    ctx.fillStyle = mix('#5FA86B', '#4B8A57', wet * 0.45);
    ctx.beginPath(); ctx.ellipse(p.x + sway, p.y - 70, 31, 27, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = mix('#7BC183', '#5E9E68', wet * 0.45);
    ctx.beginPath(); ctx.ellipse(p.x - 9 + sway, p.y - 79, 17, 14, 0, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#6E4B2E'; ctx.lineWidth = 3.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(p.x + 4, p.y - 58); ctx.quadraticCurveTo(p.x + 18, p.y - 60, p.x + 30, p.y - 56); ctx.stroke();
  }
  // guardabarranco — Nicaragua's national bird, and the tail really does
  // swing like a pendulum
  function drawMotmot(T) {
    const p = iso(MOTMOT.u, MOTMOT.v);
    const bx = p.x + 26, by = p.y - 62, swing = Math.sin(T * 1.4) * 7;
    ctx.strokeStyle = '#2E6E5C'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(bx - 3, by + 4); ctx.quadraticCurveTo(bx - 8, by + 18, bx - 10 + swing, by + 26); ctx.stroke();
    ctx.fillStyle = '#2E6E5C'; ctx.beginPath(); ctx.ellipse(bx - 10 + swing, by + 28, 2.6, 4, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#4E9E64'; ctx.beginPath(); ctx.ellipse(bx, by, 6.5, 4.6, 0.2, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#C9843F'; ctx.beginPath(); ctx.ellipse(bx + 1, by + 2, 4.5, 3.4, 0.2, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#4CB0BE'; ctx.beginPath(); ctx.arc(bx + 5, by - 3.5, 3.4, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#1A120C'; ctx.beginPath(); ctx.moveTo(bx + 8, by - 3.5); ctx.lineTo(bx + 12, by - 2.6); ctx.lineTo(bx + 8, by - 1.8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#161413'; ctx.beginPath(); ctx.arc(bx + 5.6, by - 4.2, 0.8, 0, 6.283); ctx.fill();
  }
  // Estelí is la ciudad de los murales. Painted in the WALL'S frame, or the
  // picture skews off the face.
  function drawMural() {
    const a = iso(MURAL.u, MURAL.v - 2.6), b = iso(MURAL.u, MURAL.v + 2.6), H = 42;
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    ctx.fillStyle = '#D9C8AA';
    ctx.beginPath(); ctx.moveTo(a.x, a.y - H); ctx.lineTo(b.x, b.y - H); ctx.lineTo(b.x + 7, b.y - H - 3.5); ctx.lineTo(a.x + 7, a.y - H - 3.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#CDBB9C';
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + 7, b.y - 3.5); ctx.lineTo(b.x + 7, b.y - H - 3.5); ctx.lineTo(b.x, b.y - H); ctx.closePath(); ctx.fill();
    ctx.save();
    ctx.transform(dx / len, dy / len, 0, -1, a.x, a.y);
    ctx.beginPath(); ctx.rect(0, 0, len, H); ctx.clip();
    const W = len;
    ctx.fillStyle = '#F2C25B'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#E8862E'; ctx.beginPath(); ctx.arc(W * 0.72, H * 0.74, 6.5, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#8A3B10'; ctx.lineWidth = 1.6;
    for (let k = 0; k < 8; k++) { const an = k * 0.785; ctx.beginPath(); ctx.moveTo(W * 0.72 + Math.cos(an) * 8.5, H * 0.74 + Math.sin(an) * 8.5); ctx.lineTo(W * 0.72 + Math.cos(an) * 11.5, H * 0.74 + Math.sin(an) * 11.5); ctx.stroke(); }
    ctx.fillStyle = '#3F7A5D'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, H * 0.30); ctx.lineTo(W * 0.20, H * 0.62); ctx.lineTo(W * 0.42, H * 0.28); ctx.lineTo(W * 0.42, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2E6148'; ctx.beginPath(); ctx.moveTo(W * 0.30, 0); ctx.lineTo(W * 0.30, H * 0.22); ctx.lineTo(W * 0.55, H * 0.70); ctx.lineTo(W * 0.78, H * 0.30); ctx.lineTo(W * 0.78, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8B4A9E'; ctx.beginPath(); ctx.moveTo(W * 0.66, 0); ctx.lineTo(W * 0.66, H * 0.2); ctx.lineTo(W * 0.86, H * 0.52); ctx.lineTo(W, H * 0.24); ctx.lineTo(W, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#C9563C'; ctx.fillRect(0, 0, W, H * 0.16);
    ctx.fillStyle = '#FBF3E4';
    for (let k = 0; k < 5; k++) { const an = k * 1.2566; ctx.beginPath(); ctx.ellipse(W * 0.14 + Math.cos(an) * 4, H * 0.30 + Math.sin(an) * 4, 3.2, 1.8, an, 0, 6.283); ctx.fill(); }
    ctx.fillStyle = '#F2C25B'; ctx.beginPath(); ctx.arc(W * 0.14, H * 0.30, 1.7, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#5C2A12'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(W * 0.44, H * 0.22); ctx.quadraticCurveTo(W * 0.50, H * 0.46, W * 0.58, H * 0.24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.58, H * 0.24); ctx.quadraticCurveTo(W * 0.51, H * 0.12, W * 0.44, H * 0.22); ctx.stroke();
    ctx.strokeStyle = '#2B1A10'; ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.30); ctx.lineTo(W * 0.20, H * 0.62); ctx.lineTo(W * 0.42, H * 0.28);
    ctx.moveTo(W * 0.30, H * 0.22); ctx.lineTo(W * 0.55, H * 0.70); ctx.lineTo(W * 0.78, H * 0.30);
    ctx.moveTo(W * 0.66, H * 0.2); ctx.lineTo(W * 0.86, H * 0.52); ctx.lineTo(W, H * 0.24);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = 'rgba(60,45,30,.4)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(b.x, b.y - H); ctx.lineTo(a.x, a.y - H); ctx.closePath(); ctx.stroke();
  }
  function drawSchool() {
    const e = pathAt(PLEN), f = pathAt(PLEN - 1);
    const p = iso(e.u + (e.u - f.u) * 2.2, e.v + (e.v - f.v) * 2.2);
    shade(p.x, p.y + 4, 40, 12, 0.18);
    ctx.fillStyle = '#C4671B'; ctx.beginPath(); ctx.moveTo(p.x - 40, p.y - 10); ctx.lineTo(p.x, p.y - 30); ctx.lineTo(p.x, p.y - 72); ctx.lineTo(p.x - 40, p.y - 52); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#A5541A'; ctx.beginPath(); ctx.moveTo(p.x + 40, p.y - 10); ctx.lineTo(p.x, p.y - 30); ctx.lineTo(p.x, p.y - 72); ctx.lineTo(p.x + 40, p.y - 52); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7A3F13'; ctx.beginPath(); ctx.moveTo(p.x - 44, p.y - 52); ctx.lineTo(p.x, p.y - 74); ctx.lineTo(p.x + 44, p.y - 52); ctx.lineTo(p.x, p.y - 96); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#F8E7CE'; ctx.fillRect(p.x - 14, p.y - 38, 9, 16); ctx.fillRect(p.x - 30, p.y - 46, 7, 7);
    ctx.fillRect(p.x + 8, p.y - 40, 7, 7); ctx.fillRect(p.x + 22, p.y - 47, 7, 7);
    ctx.strokeStyle = '#5C3A16'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x, p.y - 96); ctx.lineTo(p.x, p.y - 118); ctx.stroke();
    ctx.fillStyle = '#2F8B71'; ctx.beginPath(); ctx.moveTo(p.x, p.y - 118); ctx.lineTo(p.x + 18, p.y - 112); ctx.lineTo(p.x, p.y - 106); ctx.closePath(); ctx.fill();
  }
  function drawHome() {
    const e = pathAt(0), f = pathAt(1);
    const p = iso(e.u + (e.u - f.u) * 2.0, e.v + (e.v - f.v) * 2.0);
    shade(p.x, p.y + 3, 22, 7, 0.16);
    ctx.fillStyle = '#D9A45C'; ctx.beginPath(); ctx.moveTo(p.x - 20, p.y - 6); ctx.lineTo(p.x, p.y - 16); ctx.lineTo(p.x, p.y - 38); ctx.lineTo(p.x - 20, p.y - 28); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#BE8A47'; ctx.beginPath(); ctx.moveTo(p.x + 20, p.y - 6); ctx.lineTo(p.x, p.y - 16); ctx.lineTo(p.x, p.y - 38); ctx.lineTo(p.x + 20, p.y - 28); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8B5A2B'; ctx.beginPath(); ctx.moveTo(p.x - 23, p.y - 28); ctx.lineTo(p.x, p.y - 40); ctx.lineTo(p.x + 23, p.y - 28); ctx.lineTo(p.x, p.y - 52); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#F8E7CE'; ctx.fillRect(p.x - 9, p.y - 22, 6, 9);
  }
  function drawOttis(x, y, T) {
    ctx.save(); ctx.translate(x, y + Math.sin(T * 6) * 0.5);
    shade(0, 4, 16, 6, 0.2);
    ctx.strokeStyle = '#2B2725'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    const wag = Math.sin(T * 7) * 0.5;
    ctx.beginPath(); ctx.moveTo(-14, -16); ctx.quadraticCurveTo(-24 + wag * 8, -30, -16 + wag * 10, -36); ctx.stroke();
    ctx.strokeStyle = '#F7F3EB'; ctx.lineWidth = 4.6;
    ctx.beginPath(); ctx.moveTo(-19 + wag * 9, -33); ctx.lineTo(-16 + wag * 10, -36); ctx.stroke();
    const g = ctx.createLinearGradient(0, -38, 0, 0); g.addColorStop(0, '#3B3532'); g.addColorStop(1, '#201C1A');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(-2, -18, 17, 13, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#F3EDE2'; ctx.fillRect(-11, -8, 4, 10); ctx.fillRect(3, -8, 4, 10);
    ctx.fillStyle = '#2B2725'; ctx.fillRect(-14, -10, 4, 8); ctx.fillRect(7, -10, 4, 8);
    ctx.fillStyle = '#F7F3EB'; ctx.beginPath(); ctx.ellipse(6, -14, 6, 9, 0.3, 0, 6.283); ctx.fill();
    // the head swivels to follow whatever he is watching
    ctx.save(); ctx.translate(12 + look * 13, -36 - Math.abs(look) * 2); ctx.rotate(look * 0.45); ctx.translate(-12, 36);
    const hg = ctx.createLinearGradient(0, -48, 0, -26); hg.addColorStop(0, '#403936'); hg.addColorStop(1, '#241F1D');
    ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(12, -36, 11, 10, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#332D2A';
    ctx.beginPath(); ctx.ellipse(4, -40, 4, 7, 0.4, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.ellipse(19, -41, 4, 7, -0.4, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#F7F3EB'; ctx.beginPath(); ctx.ellipse(12, -45, 2, 5, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#2B2725'; ctx.beginPath(); ctx.ellipse(16, -31, 7, 5, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#B4763E'; ctx.beginPath(); ctx.ellipse(8, -31, 3.5, 3, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#141211'; ctx.beginPath(); ctx.arc(21, -32, 2.6, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#7A4F2C'; ctx.beginPath(); ctx.arc(9, -38, 2.4, 0, 6.283); ctx.arc(16, -38, 2.4, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#1A120C'; ctx.beginPath(); ctx.arc(9.4, -38, 1.2, 0, 6.283); ctx.arc(16.4, -38, 1.2, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#C98B4B'; ctx.beginPath(); ctx.ellipse(9, -42.5, 2.4, 1.3, 0, 0, 6.283); ctx.ellipse(16, -42.5, 2.4, 1.3, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#EFEDE7'; ctx.beginPath(); ctx.moveTo(4, -28); ctx.lineTo(16, -26); ctx.lineTo(10, -19); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(43,40,38,.5)'; for (let i = 0; i < 3; i++) ctx.fillRect(6 + i * 3.2, -27 + i * 1.4, 1.6, 1.6);
    ctx.restore();
    ctx.restore();
  }

  /* ── weather ───────────────────────────────────────────────────── */
  const W = { t: 0, RAIN_AT: 62, RAIN_FOR: 26, CYCLE: 150, drops: [] };
  for (let i = 0; i < 260; i++) W.drops.push({ x: Math.random(), y: Math.random(), l: 0.5 + Math.random() });
  const CLOUDS = [];
  for (let i = 0; i < 9; i++) CLOUDS.push({ x: Math.random(), y: 0.05 + Math.random() * 0.35, w: 120 + Math.random() * 160, sp: 0.006 + Math.random() * 0.01, ph: Math.random() * 6.28 });
  function wetness(t) {
    const c = t % W.CYCLE, A = W.RAIN_AT, B = A + W.RAIN_FOR;
    if (c > A - 8 && c < A) return (c - (A - 8)) / 8;
    if (c >= A && c <= B) return 1;
    if (c > B && c < B + 10) return 1 - (c - B) / 10;
    return 0;
  }

  /* ── the frame ─────────────────────────────────────────────────── */
  let raf = 0, last = performance.now(), T = 0, alive = true;
  function frame(now) {
    if (!alive) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt; W.t += dt;
    const wet = wetness(W.t);

    nextSquirrel -= dt;
    if (nextSquirrel <= 0 && squirrels.length < 2) {
      const c = NODES[CURRENT], side = Math.random() < 0.5 ? 1 : -1;
      squirrels.push({ u: c.pu + side * 4.2 + (Math.random() * 1.4 - 0.7), v: c.pv - 1.6 + Math.random() * 3.2,
                       du: -side * (1.7 + Math.random() * 0.8), dv: (Math.random() - 0.5) * 0.6, t: 0, life: 5 + Math.random() * 1.5 });
      nextSquirrel = 7 + Math.random() * 8;
    }
    for (let i = squirrels.length - 1; i >= 0; i--) { const q = squirrels[i]; q.u += q.du * dt; q.v += q.dv * dt; q.t += dt; if (q.t > q.life) squirrels.splice(i, 1); }

    nextMorpho -= dt;
    if (nextMorpho <= 0 && morphos.length < 3) {
      const c = NODES[CURRENT], ang = Math.random() * 6.283, sp = 0.9 + Math.random() * 0.6;
      morphos.push({ u: c.pu + Math.cos(ang) * 10, v: c.pv + Math.sin(ang) * 10,
                     du: -Math.cos(ang) * sp, dv: -Math.sin(ang) * sp,
                     z: 24 + Math.random() * 20, ph: Math.random() * 6.28, t: 0 });
      nextMorpho = 6 + Math.random() * 9;
    }
    for (let i = morphos.length - 1; i >= 0; i--) {
      const m = morphos[i]; m.t += dt; m.u += m.du * dt; m.v += m.dv * dt;
      m.z += Math.sin(m.t * 2.1 + m.ph) * 11 * dt;
      if (m.t > 22) morphos.splice(i, 1);
    }
    {
      const c = NODES[CURRENT];
      lookTarget = squirrels.length
        ? Math.max(-1, Math.min(1, (iso(squirrels[0].u, squirrels[0].v).x - iso(c.pu, c.pv).x) / 55))
        : 0;
      look += (lookTarget - look) * Math.min(1, dt * 5.5);
    }

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const sky = ctx.createLinearGradient(0, 0, 0, VH);
    sky.addColorStop(0, mix('#CFE6F3', '#9FB0BB', wet)); sky.addColorStop(1, mix('#EAF2E4', '#C4CFC4', wet));
    ctx.fillStyle = sky; ctx.fillRect(0, 0, VW, VH);

    for (const c of CLOUDS) {
      c.x += c.sp * dt; if (c.x > 1.3) c.x = -0.3;
      const cx = c.x * VW, cy = c.y * VH * 0.5 + Math.sin(T * 0.3 + c.ph) * 4;
      ctx.fillStyle = wet > 0 ? mix('#FFFFFF', '#B8C0C6', wet * 0.8) : '#FFFFFF';
      ctx.globalAlpha = 0.55 + wet * 0.35;
      ctx.beginPath(); ctx.ellipse(cx, cy, c.w * 0.5, 22, 0, 0, 6.283);
      ctx.ellipse(cx - c.w * 0.22, cy + 6, c.w * 0.3, 16, 0, 0, 6.283);
      ctx.ellipse(cx + c.w * 0.24, cy + 5, c.w * 0.32, 17, 0, 0, 6.283); ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.save(); ctx.translate(cam.x, cam.y); ctx.scale(cam.s, cam.s);

    const gA = mix('#8FCB84', '#6FA46A', wet * 0.5), gB = mix('#86C27C', '#679C62', wet * 0.5);
    for (let u = 0; u < GU; u++) for (let v = 0; v < GV; v++) tile(u, v, (u + v) % 2 ? gA : gB);

    for (const pd of PONDS) {
      const p = iso(pd.u, pd.v);
      ctx.fillStyle = '#8FB07A'; ctx.beginPath(); ctx.ellipse(p.x, p.y, pd.r * TW / 2 * 1.06, pd.r * TH / 2 * 1.06, 0, 0, 6.283); ctx.fill();
      const wg = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, pd.r * TW / 2);
      wg.addColorStop(0, mix('#9ED4E8', '#7FA9BC', wet)); wg.addColorStop(1, mix('#6FB6D6', '#5A8FA8', wet));
      ctx.fillStyle = wg; ctx.beginPath(); ctx.ellipse(p.x, p.y, pd.r * TW / 2, pd.r * TH / 2, 0, 0, 6.283); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.2;
      const n = wet > 0.2 ? 7 : 3;
      for (let k = 0; k < n; k++) {
        const ph = (T * 0.5 + k * 0.37 + pd.u) % 1, rr = ph * pd.r * TW / 2 * 0.9;
        ctx.globalAlpha = (1 - ph) * 0.6;
        ctx.beginPath(); ctx.ellipse(p.x + Math.sin(k * 3.1) * pd.r * 10, p.y + Math.cos(k * 2.3) * pd.r * 5, rr, rr * 0.5, 0, 0, 6.283); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    const walkedD = NODES[CURRENT].d;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const pass of [0, 1]) {
      ctx.beginPath(); let started = false;
      for (let i = 0; i < PATH.length; i++) {
        if (pass === 1 && cum[i] > walkedD) break;
        const p = iso(PATH[i].u, PATH[i].v);
        if (!started) { ctx.moveTo(p.x, p.y); started = true; } else ctx.lineTo(p.x, p.y);
      }
      if (pass === 0) { ctx.strokeStyle = 'rgba(90,70,45,.28)'; ctx.lineWidth = 36; ctx.stroke(); }
      ctx.strokeStyle = pass === 0 ? mix('#E6D6B4', '#BFB194', wet * 0.6) : mix('#E9B86E', '#C79C5A', wet * 0.4);
      ctx.lineWidth = 30; ctx.stroke();
    }
    ctx.fillStyle = 'rgba(120,95,60,.28)';
    for (let i = 0; i < PATH.length; i += 6) { const p = iso(PATH[i].u, PATH[i].v); ctx.beginPath(); ctx.arc(p.x, p.y, 1.4, 0, 6.283); ctx.fill(); }
    for (const f of FLOWERS) { const p = iso(f.u, f.v); ctx.fillStyle = f.c; ctx.beginPath(); ctx.arc(p.x, p.y - 2, 2.2, 0, 6.283); ctx.fill(); }

    const objs = [];
    TREES.forEach(t => objs.push({ z: t.u + t.v, d: () => drawTree(t, T, wet) }));
    BENCHES.forEach(b => objs.push({ z: b.u + b.v, d: () => drawBench(b) }));
    NODES.forEach(s => objs.push({ z: s.u + s.v, d: () => drawLamp(s, s.i < CURRENT || wet > 0.5, wet) }));
    DUCKS.forEach(dk => objs.push({ z: PONDS[dk.p].u + PONDS[dk.p].v, d: () => drawDuck(dk, T) }));
    squirrels.forEach(q => objs.push({ z: q.u + q.v, d: () => drawSquirrel(q, T) }));
    morphos.forEach(m => objs.push({ z: m.u + m.v + 0.3, d: () => drawMorpho(m, T) }));
    objs.push({ z: CEIBA.u + CEIBA.v, d: () => drawCeiba(T, wet) });
    objs.push({ z: MOTMOT.u + MOTMOT.v, d: () => drawMotmotTree(T, wet) });
    objs.push({ z: MOTMOT.u + MOTMOT.v + 0.02, d: () => drawMotmot(T) });
    objs.push({ z: MURAL.u + MURAL.v + 0.4, d: drawMural });
    { const e = pathAt(PLEN), f = pathAt(PLEN - 1); objs.push({ z: (e.u + (e.u - f.u) * 2.2) + (e.v + (e.v - f.v) * 2.2), d: drawSchool }); }
    { const e = pathAt(0), f = pathAt(1); objs.push({ z: (e.u + (e.u - f.u) * 2.0) + (e.v + (e.v - f.v) * 2.0), d: drawHome }); }
    const op = iso(NODES[CURRENT].pu, NODES[CURRENT].pv);
    objs.push({ z: NODES[CURRENT].pu + NODES[CURRENT].pv + 0.01, d: () => drawOttis(op.x, op.y - 2, T) });
    objs.sort((a, b) => a.z - b.z).forEach(o => o.d());

    ctx.restore();

    if (wet > 0.05) {
      ctx.strokeStyle = `rgba(210,225,240,${0.35 * wet})`; ctx.lineWidth = 1.1; ctx.beginPath();
      for (const d of W.drops) {
        d.y += dt * (0.9 + d.l * 0.5); d.x -= dt * 0.08;
        if (d.y > 1.05) { d.y = -0.05; d.x = Math.random(); }
        const x = d.x * VW, y = d.y * VH; ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 9 * d.l);
      }
      ctx.stroke();
      ctx.fillStyle = `rgba(120,135,150,${0.10 * wet})`; ctx.fillRect(0, 0, VW, VH);
    }
    raf = requestAnimationFrame(frame);
  }

  /* ── input ─────────────────────────────────────────────────────── */
  const pts = new Map(); let pinch = null, downAt = null;
  const onWheel = (e) => { e.preventDefault(); const r = canvas.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.1 : 1 / 1.1); };
  const onDown = (e) => { canvas.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); downAt = { x: e.clientX, y: e.clientY, t: performance.now() }; canvas.classList.add('dragging'); };
  const onMove = (e) => {
    if (!pts.has(e.pointerId)) return;
    const prev = pts.get(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) { cam.x += e.clientX - prev.x; cam.y += e.clientY - prev.y; }
    else if (pts.size === 2) {
      const [p, q] = [...pts.values()], d = Math.hypot(p.x - q.x, p.y - q.y), r = canvas.getBoundingClientRect();
      if (pinch) zoomAt((p.x + q.x) / 2 - r.left, (p.y + q.y) / 2 - r.top, d / pinch);
      pinch = d;
    }
  };
  const onUp = (e) => {
    pts.delete(e.pointerId); if (pts.size < 2) pinch = null;
    if (!pts.size) canvas.classList.remove('dragging');
    if (e.type === 'pointerup' && downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 8 && performance.now() - downAt.t < 450) tapAt(e.clientX, e.clientY);
    downAt = null;
  };
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => canvas.addEventListener(t, onUp));

  function tapAt(cx, cy) {
    const r = canvas.getBoundingClientRect();
    const wx = (cx - r.left - cam.x) / cam.s, wy = (cy - r.top - cam.y) / cam.s;
    let best = null, bd = 1e9;
    for (const s of NODES) { const p = iso(s.pu, s.pv); const d = Math.hypot(p.x - wx, p.y - (wy + 22)); if (d < bd) { bd = d; best = s; } }
    api.onPick(best && bd * cam.s < 44 ? best : null);
  }

  const onResize = () => { resize(); focusOttis(); };
  addEventListener('resize', onResize);
  resize(); focusOttis();
  raf = requestAnimationFrame(frame);

  return {
    focus: focusOttis,
    whole,
    zoom: (f) => zoomAt(VW / 2, VH / 2, f),
    destroy() {
      alive = false; cancelAnimationFrame(raf);
      removeEventListener('resize', onResize);
      canvas.remove();
    },
  };
}
