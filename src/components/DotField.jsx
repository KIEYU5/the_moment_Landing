import { useEffect, useRef } from "react";

/* A fixed lattice of dots with turbulence running through it.

   The lattice is drawn on a canvas rather than as a repeating background,
   because a background image paints every dot at one size — the field could
   only brighten and dim as a whole. Positions and spacing stay fixed; what
   changes per frame is each dot's radius, alpha and colour.

   Three things drive a dot:

     turbulence  domain-warped ridged noise, which is what gives the field
                 its fine irregular grain. Crossed sine waves cannot do this
                 — they interfere on a lattice you can read, and the result
                 reads as a pattern rather than as movement.
     pointer     dots inside the core are forced to full size regardless of
                 what the turbulence is doing there, and cross from neutral
                 grey to the brand blue.
     rings       that forced core is a wave source: it sheds a ring on an
                 interval, which then travels out and thins on its own.

   So the field churns on its own, and the pointer both carves a hole in it
   and leaves a wake. */

const SPACING = 24;

/* A crest dot has to be a real share of its cell or the grain does not read
   however wide its range is: at 3.2px into a 30px cell the field measured
   full contrast and still looked flat, because 6px of ink in a 30px cell is
   6px of ink either way. The floor stays above zero so a dot at the bottom
   of the swell shrinks rather than disappearing. */
const R_MIN = 0.7;
const R_MAX = 4.2;
const A_MIN = 0.1;
const A_MAX = 0.78;

const BASE = [154, 161, 170];
const BRAND = [74, 128, 248];

/* ---------- turbulence ---------- */

function hash(ix, iy) {
  let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function vnoise(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

/* Each octave drifts on its own heading, so the field churns in place
   instead of sliding across the screen as one sheet. The finest octave is
   about 73px at the scale below — no octave may go under twice the 30px
   lattice spacing, or the dots sample it as moire instead of grain. */
const OCT = [
  { f: 1, amp: 0.54, dx: 0.09, dy: -0.05 },
  { f: 2.03, amp: 0.29, dx: -0.07, dy: 0.11 },
  { f: 4.11, amp: 0.17, dx: 0.13, dy: 0.06 },
];
const NORM = OCT.reduce((s, o) => s + o.amp, 0);

function fbm(x, y, t, seed, ridged) {
  let sum = 0;
  for (const o of OCT) {
    let v = vnoise(x * o.f + t * o.dx + seed, y * o.f + t * o.dy + seed * 1.7);
    /* Ridged: folding the noise about its midpoint turns smooth hills into
       creases, which is the difference between a field that undulates and
       one that looks like something is flowing through it. */
    if (ridged) v = 1 - Math.abs(v * 2 - 1);
    sum += o.amp * v;
  }
  return sum / NORM;
}

const SCALE = 1 / 300;
/* Warping the sample point by another pair of noise fields is what curls the
   grain into filaments rather than blobs. */
const WARP = 2.3;
/* Ridged noise is not centred on 0.5 and its spread is narrower than plain
   fBm, so the midpoint and contrast are measured off the field rather than
   assumed — mean 0.649, sigma 0.160, and a gain that puts two sigma at the
   edges of the range. */
const TURB_MID = 0.66;
/* Two sigma at the edges of the range would be the faithful mapping, but it
   leaves the field sitting in its middle, where a dot is never much larger
   or smaller than its neighbour and the grain reads as uniform however fine
   it actually is. Pushing past that clips both tails, which is what puts
   dark water between the bright filaments — but only so far: at 1.95 more
   than half the field was pinned at the ceiling, which flattens every crest
   into one plateau and loses the shape inside it. */
const TURB_GAIN = 1.75;
/* The turbulence takes nearly the whole swell. Rings and the pointer are
   additive on top and clamp, so they do not need headroom reserved. */
const TURB_FLOOR = 0.02;
const TURB_SPAN = 0.92;

function turbulence(x, y, t) {
  const nx = x * SCALE;
  const ny = y * SCALE;
  const wx = fbm(nx, ny, t, 0, false) - 0.5;
  const wy = fbm(nx, ny, t, 11.3, false) - 0.5;
  const v = fbm(nx + WARP * wx, ny + WARP * wy, t, 3.7, true);
  return Math.min(1, Math.max(0, (v - TURB_MID) * TURB_GAIN + 0.5));
}

/* ---------- rings ---------- */

/* A ring is born at full strength at its origin, travels out at `speed` and
   thins as it goes. The falloff is squared: that decay is what makes it read
   as something spreading, rather than as a ring that happens to be moving.

   Two ambient origins keep the idle field from being turbulence alone.
   Positions are fractions of the field. */
const PULSES = [
  { x: 0.32, y: 0.74, period: 9.5, offset: 0, speed: 235, width: 105, amp: 0.62 },
  { x: 0.79, y: 0.24, period: 13, offset: 5.1, speed: 200, width: 125, amp: 0.5 },
];

/* And the pointer's own. Emitted on an interval rather than on movement, so
   resting the cursor still sends rings out instead of going quiet.

   Interval times speed is the gap between one ring and the next, and it has
   to clear the width or they overlap into a single smooth swell with no
   ripple in it at all. At 0.78s and 265px/s the gap is 207px against a ring
   that carries about 92px either side of its crest. */
const RING_EVERY = 0.78;
const RING_LIFE = 2.8;
const RING_SPEED = 265;
const RING_WIDTH = 46;
const RING_AMP = 0.95;

function ringAt(gap, width, fall, amp) {
  return amp * Math.exp(-(gap * gap) / (2 * width * width)) * fall * fall;
}

/* ---------- pointer ---------- */

/* REACH is the colour pool. CORE and CORE_EDGE are the size override: inside
   the core a dot is forced to full size whatever the turbulence says there,
   which is what makes the pointer read as pushing the field aside rather
   than as tinting it. */
const REACH = 300;
const CORE = 74;
const CORE_EDGE = 168;
const R_FORCE = 4.4;
const A_FORCE = 0.9;

const HALO_FROM = 0.34;
const HALO_ALPHA = 0.5;
const HALO_SIZE = 32;

/* The glow is one pre-rendered sprite rather than a canvas shadow per dot.
   Shadows are recomputed on every fill, and there can be a few hundred lit
   dots in frame. */
function makeHalo() {
  const size = HALO_SIZE * 2;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const g = sprite.getContext("2d");
  const grad = g.createRadialGradient(
    HALO_SIZE,
    HALO_SIZE,
    0,
    HALO_SIZE,
    HALO_SIZE,
    HALO_SIZE,
  );
  grad.addColorStop(0, `rgba(${BRAND[0]}, ${BRAND[1]}, ${BRAND[2]}, 0.9)`);
  grad.addColorStop(0.4, `rgba(${BRAND[0]}, ${BRAND[1]}, ${BRAND[2]}, 0.28)`);
  grad.addColorStop(1, `rgba(${BRAND[0]}, ${BRAND[1]}, ${BRAND[2]}, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return sprite;
}

export default function DotField({ on = false, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!on) return undefined;
    const canvas = ref.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    const halo = makeHalo();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let px = 0;
    let py = 0;
    /* Ramped rather than switched, so the pool arrives with the pointer
       instead of snapping on at the first move event. */
    let strength = 0;
    let wanted = 0;
    let dirty = true;
    let raf = 0;
    let rings = [];
    let lastRing = -Infinity;

    const size = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = box.width;
      h = box.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dirty = true;
    };

    const move = (e) => {
      const box = canvas.getBoundingClientRect();
      px = e.clientX - box.left;
      py = e.clientY - box.top;
      wanted = 1;
      dirty = true;
    };

    const leave = (e) => {
      if (!e.relatedTarget) wanted = 0;
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / SPACING);
      const rows = Math.ceil(h / SPACING);
      const half = (w - (cols - 1) * SPACING) / 2;

      for (let row = 0; row <= rows; row++) {
        const y = row * SPACING;
        for (let col = 0; col <= cols; col++) {
          const x = half + col * SPACING;

          let n = TURB_FLOOR + turbulence(x, y, t) * TURB_SPAN;

          for (const p of PULSES) {
            const age = (((t - p.offset) % p.period) + p.period) % p.period;
            const gap = Math.hypot(x - p.x * w, y - p.y * h) - age * p.speed;
            n += ringAt(gap, p.width, 1 - age / p.period, p.amp);
          }

          for (const r of rings) {
            const age = t - r.born;
            const gap = Math.hypot(x - r.x, y - r.y) - age * RING_SPEED;
            n += ringAt(gap, RING_WIDTH, 1 - age / RING_LIFE, RING_AMP * r.at);
          }

          const c = Math.min(1, Math.max(0, n));
          const s = c * c * (3 - 2 * c);

          let lit = 0;
          let force = 0;
          if (strength > 0.001) {
            const d = Math.hypot(px - x, py - y);
            if (d < REACH) {
              const f = 1 - d / REACH;
              lit = f * f * strength;
            }
            if (d < CORE_EDGE) {
              const f =
                d <= CORE ? 1 : 1 - (d - CORE) / (CORE_EDGE - CORE);
              force = f * f * (3 - 2 * f) * strength;
            }
          }

          /* Override, not addition: inside the core the dot is this size
             whatever the turbulence was doing there. */
          let r = R_MIN + s * (R_MAX - R_MIN);
          let a = A_MIN + s * (A_MAX - A_MIN);
          r = Math.max(r, R_FORCE * force);
          a = Math.max(a, A_FORCE * force);
          a += lit * 0.25;

          if (lit > HALO_FROM) {
            const g = (lit - HALO_FROM) / (1 - HALO_FROM);
            ctx.globalAlpha = g * g * HALO_ALPHA;
            const spread = r * 7;
            ctx.drawImage(halo, x - spread / 2, y - spread / 2, spread, spread);
          }

          ctx.globalAlpha = Math.min(1, a);
          ctx.fillStyle = `rgb(${Math.round(BASE[0] + (BRAND[0] - BASE[0]) * lit)}, ${Math.round(
            BASE[1] + (BRAND[1] - BASE[1]) * lit,
          )}, ${Math.round(BASE[2] + (BRAND[2] - BASE[2]) * lit)})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const start = performance.now();
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      strength += (wanted - strength) * 0.08;
      const t = (now - start) / 1000;

      /* Reduced motion keeps the pointer — that is the visitor's own
         movement — but holds the turbulence still, sheds no rings, and only
         repaints when the pointer has asked for it. */
      if (still) {
        if (!dirty && Math.abs(wanted - strength) < 0.002) return;
        dirty = false;
        draw(0);
        return;
      }

      if (strength > 0.05 && t - lastRing >= RING_EVERY) {
        rings.push({ x: px, y: py, born: t, at: strength });
        lastRing = t;
      }
      if (rings.length && t - rings[0].born > RING_LIFE) {
        rings = rings.filter((r) => t - r.born <= RING_LIFE);
      }

      draw(t);
    };

    size();
    raf = requestAnimationFrame(frame);

    const observer = new ResizeObserver(size);
    observer.observe(canvas);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerout", leave, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerout", leave);
    };
  }, [on]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`dot-field${on ? " is-on" : ""} ${className}`}
    />
  );
}
