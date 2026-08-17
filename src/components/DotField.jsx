import { useEffect, useRef } from "react";

/* A fixed lattice of dots with turbulence running through it.

   The lattice is drawn on a canvas rather than as a repeating background,
   because a background image paints every dot at one size — the field could
   only brighten and dim as a whole. Positions and spacing stay fixed; what
   changes per frame is each dot's radius, alpha and colour.

   Two things drive a dot:

     turbulence  domain-warped ridged noise, which is what gives the field
                 its fine irregular grain. Crossed sine waves cannot do this
                 — they interfere on a lattice you can read, and the result
                 reads as a pattern rather than as movement.
     stroke      the pointer paints: moving lays stamps along the path it
                 took, each opening the dots around it to full size and the
                 brand blue, then closing them again.

   Nothing is anchored to where the pointer is, only to where it has been,
   which is what lets the field go quiet on its own: a still hand lays no
   stamps, the last ones run out, and the turbulence is all that is left.

   `bare` drops the lattice and keeps the pointer: no turbulence, and a dot
   is drawn only where the stroke actually reaches it. That is the form the
   rest of the page takes — the churning field belongs to the hero, but the
   stroke should follow the pointer down the whole page. It is also most of
   the cost, so a bare field skips its frame entirely while nothing is
   live. */

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
/* The turbulence takes nearly the whole swell. The stroke overrides size
   outright rather than adding to it, so it needs no headroom reserved. */
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

/* ---------- the stroke ---------- */

/* The pointer paints. Moving lays down a run of stamps along the path it
   actually took, each of which opens the dots around it and then closes
   them again — so what you see is a brush stroke drawn through the field,
   trailing off behind the cursor.

   Nothing here is anchored to where the pointer is, only to where it has
   been. A disc centred on the cursor keeps animating while the hand is
   still; a trail of stamps runs out on its own, and a still pointer lays no
   new ones, so the field goes quiet by itself.

   Stamps are laid every TRAIL_STEP px of travel rather than per event, so
   the stroke has the same density whether the hand is fast or slow. */
const TRAIL_STEP = 7;
const TRAIL_RADIUS = 92;
const TRAIL_LIFE = 0.5;
/* Open quickly, close slowly. Without the attack a dot is simply at full
   size the instant the stamp lands, which reads as switching on rather than
   as being painted over. */
const TRAIL_ATTACK = 0.09;
const R_TRAIL = 6.8;
const A_TRAIL = 0.92;

function bristle(age) {
  if (age < 0 || age >= TRAIL_LIFE) return 0;
  if (age < TRAIL_ATTACK) return age / TRAIL_ATTACK;
  const k = (age - TRAIL_ATTACK) / (TRAIL_LIFE - TRAIL_ATTACK);
  return (1 - k) * (1 - k);
}

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

export default function DotField({ on = false, bare = false, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!on) return undefined;
    const canvas = ref.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    const halo = makeHalo();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const start = performance.now();
    const clock = () => (performance.now() - start) / 1000;

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let stride = 0;
    let half = 0;
    /* How much stroke is on each lattice point this frame. Splatting the
       stamps into a grid the size of the lattice and reading one cell per
       dot costs a fraction of testing every dot against every stamp — a
       quick drag can have seventy stamps alive at once against eighteen
       hundred dots. */
    let paint = new Float32Array(0);
    let blank = false;
    let dirty = true;
    /* Now that fields run the length of the page, one drawing off screen is
       a whole frame budget spent on nothing — the hero's turbulence alone
       was costing 3.9ms a frame from three sections away. */
    let onScreen = true;
    let raf = 0;
    let trail = [];
    /* Where the last stamp landed, so the next one is placed by distance
       travelled rather than by event. */
    let lastX = 0;
    let lastY = 0;
    let seeded = false;

    const size = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = box.width;
      h = box.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / SPACING);
      rows = Math.ceil(h / SPACING);
      stride = cols + 1;
      half = (w - (cols - 1) * SPACING) / 2;
      paint = new Float32Array(stride * (rows + 1));
      dirty = true;
    };

    const move = (e) => {
      if (!onScreen) return;
      const box = canvas.getBoundingClientRect();
      const nx = e.clientX - box.left;
      const ny = e.clientY - box.top;

      if (!seeded) {
        lastX = nx;
        lastY = ny;
        seeded = true;
        return;
      }

      const step = Math.hypot(nx - lastX, ny - lastY);

      /* Stamp along the segment, not at the event. Pointer events arrive far
         apart during a fast flick, and stamping only where they land leaves
         a dotted line of separate blobs instead of a stroke. */
      if (step >= TRAIL_STEP && !still) {
        const steps = Math.min(32, Math.round(step / TRAIL_STEP));
        const born = clock();
        for (let i = 1; i <= steps; i++) {
          const k = i / steps;
          trail.push({
            x: lastX + (nx - lastX) * k,
            y: lastY + (ny - lastY) * k,
            born,
          });
        }
        lastX = nx;
        lastY = ny;
      }
      dirty = true;
    };

    /* Lay the live stamps onto the lattice grid. Each takes the strongest
       rather than the sum, so overlapping stamps along one stroke give an
       even band instead of a bright seam wherever the hand slowed down. */
    const layStroke = (t) => {
      paint.fill(0);
      for (const s of trail) {
        const env = bristle(t - s.born);
        if (env <= 0) continue;
        const c0 = Math.max(0, Math.floor((s.x - TRAIL_RADIUS - half) / SPACING));
        const c1 = Math.min(cols, Math.ceil((s.x + TRAIL_RADIUS - half) / SPACING));
        const r0 = Math.max(0, Math.floor((s.y - TRAIL_RADIUS) / SPACING));
        const r1 = Math.min(rows, Math.ceil((s.y + TRAIL_RADIUS) / SPACING));
        for (let row = r0; row <= r1; row++) {
          const dy = row * SPACING - s.y;
          for (let col = c0; col <= c1; col++) {
            const dx = half + col * SPACING - s.x;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d >= TRAIL_RADIUS) continue;
            const f = 1 - d / TRAIL_RADIUS;
            const e = f * f * (3 - 2 * f) * env;
            const i = row * stride + col;
            if (e > paint[i]) paint[i] = e;
          }
        }
      }
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      layStroke(t);

      for (let row = 0; row <= rows; row++) {
        const y = row * SPACING;
        for (let col = 0; col <= cols; col++) {
          const x = half + col * SPACING;

          /* The stroke is the only thing that carries the brand colour;
             everything else in the field stays the neutral grey. */
          const lit = paint[row * stride + col];

          if (bare && lit < 0.012) continue;

          let r = R_TRAIL * lit;
          let a = A_TRAIL * lit;

          if (!bare) {
            const n = TURB_FLOOR + turbulence(x, y, t) * TURB_SPAN;
            const c = Math.min(1, Math.max(0, n));
            const s = c * c * (3 - 2 * c);
            /* Override, not addition: under the stroke a dot is this size
               whatever the turbulence was doing there. */
            r = Math.max(r, R_MIN + s * (R_MAX - R_MIN));
            a = Math.max(a, A_MIN + s * (A_MAX - A_MIN));
          }

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

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!onScreen) return;
      const t = (now - start) / 1000;

      /* Reduced motion holds the turbulence still and lays no stroke, so the
         field is a static lattice and only repaints when it has been
         resized. */
      if (still) {
        if (!dirty) return;
        dirty = false;
        draw(0);
        return;
      }

      if (trail.length && t - trail[0].born > TRAIL_LIFE) {
        trail = trail.filter((s) => t - s.born <= TRAIL_LIFE);
      }

      /* A bare field has nothing of its own to animate, so with no stroke on
         it there is no frame to draw — one clear on the way down, then it
         costs nothing until the pointer comes back. */
      if (bare && !trail.length) {
        if (!blank) {
          ctx.clearRect(0, 0, w, h);
          blank = true;
        }
        return;
      }
      blank = false;

      draw(t);
    };

    size();
    raf = requestAnimationFrame(frame);

    const observer = new ResizeObserver(size);
    observer.observe(canvas);
    /* The margin keeps a field awake just before it arrives, so a stroke
       started off the edge is already on it rather than beginning at the
       fold. */
    const visible = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { rootMargin: "160px" },
    );
    visible.observe(canvas);
    window.addEventListener("pointermove", move, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      visible.disconnect();
      window.removeEventListener("pointermove", move);
    };
  }, [on, bare]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`dot-field${on ? " is-on" : ""} ${className}`}
    />
  );
}
