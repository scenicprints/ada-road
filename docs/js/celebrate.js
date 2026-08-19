// ═══════════════════════════════════════════════════════════════════════
//  THE CELEBRATION
//
//  Finishing a whole stage used to pass as quietly as ticking one box.
//  For an app whose entire job is motivation, that was the obvious miss.
//
//  White and blue confetti, and Ottis dances. It fires once per stage and
//  it never fires for a single step — otherwise it stops meaning anything.
// ═══════════════════════════════════════════════════════════════════════

const WHITE = ['#FFFFFF', '#F7F3EB', '#EFEAE0'];
const BLUE  = ['#2456C9', '#4C8DF0', '#7FB2F7', '#1B3E96'];

/** A burst from both lower corners, the way a party popper actually goes. */
export function confetti({ duration = 2600 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const DPR = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0;
  const size = () => {
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };
  size();

  // Two corner bursts AND a shower from above. The bursts alone were over
  // in about a second and a half — a blink next to the banner — so the
  // shower keeps the moment going for as long as the message is up.
  const bits = [];
  const piece = (x, y, vx, vy) => ({
    x, y, vx, vy,
    w: 6 + Math.random() * 7, h: 9 + Math.random() * 9,
    rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 12,
    c: (Math.random() < 0.5 ? WHITE : BLUE)[Math.floor(Math.random() * 3)],
    flip: Math.random() * 6.28, vf: 5 + Math.random() * 6,
    sway: Math.random() * 6.28,
  });
  const burst = (x, y, dir) => {
    for (let i = 0; i < 60; i++) {
      const a = (-Math.PI / 2) + dir * (0.15 + Math.random() * 0.75);
      const sp = 420 + Math.random() * 520;
      bits.push(piece(x, y, Math.cos(a) * sp, Math.sin(a) * sp));
    }
  };
  burst(-10, H + 10, 1);
  burst(W + 10, H + 10, -1);

  let rain = 0;                       // how long the shower keeps feeding
  const SHOWER_FOR = Math.min(1500, duration - 900);

  let raf = 0, last = performance.now(), t = 0, alive = true;
  function frame(now) {
    if (!alive) return;
    const dt = Math.min(0.04, (now - last) / 1000); last = now; t += dt;

    rain += dt * 1000;
    if (rain < SHOWER_FOR) {
      for (let i = 0; i < 3; i++) {
        bits.push(piece(Math.random() * W, -20, (Math.random() - 0.5) * 60, 60 + Math.random() * 120));
      }
    }

    ctx.clearRect(0, 0, W, H);
    const fade = t > duration / 1000 - 0.8 ? Math.max(0, (duration / 1000 - t) / 0.8) : 1;
    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i];
      b.vy += 620 * dt;                        // gentle gravity, so it flutters
      b.vx *= 0.988; b.vy = Math.min(b.vy, 420);   // terminal speed
      b.sway += dt * 3;
      b.x += (b.vx + Math.sin(b.sway) * 34) * dt;
      b.y += b.vy * dt;
      b.rot += b.vr * dt; b.flip += b.vf * dt;
      if (b.y > H + 40) { bits.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      // scaling X by cos gives the flutter of a real paper rectangle
      ctx.scale(Math.cos(b.flip), 1);
      ctx.globalAlpha = fade;
      ctx.fillStyle = b.c;
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.restore();
    }
    if (t * 1000 < duration) raf = requestAnimationFrame(frame);
    else { alive = false; canvas.remove(); }
  }
  raf = requestAnimationFrame(frame);

  return () => { alive = false; cancelAnimationFrame(raf); canvas.remove(); };
}

/**
 * The whole moment: confetti, Ottis dancing, and a line from him.
 * Returns a promise that settles when the banner has gone.
 */
export function celebrateStage(stageTitle, says) {
  const stop = confetti();

  const el = document.createElement('div');
  el.className = 'stage-done';
  el.innerHTML = `
    <div class="sd-inner">
      <b>Stage complete</b>
      <h2>${stageTitle}</h2>
      <p>${says}</p>
    </div>`;
  document.body.appendChild(el);

  return new Promise((resolve) => {
    setTimeout(() => {
      el.classList.add('going');
      setTimeout(() => { el.remove(); stop(); resolve(); }, 400);
    }, 2600);
  });
}
