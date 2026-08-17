import { useEffect, useRef } from "react";

/* A fixed lattice of dots with a swell running through it.

   This was a repeating background image with a mask following the pointer,
   which is cheap but paints every dot at one size — the whole field could
   only brighten and dim together. A wave means each dot has to answer for
   itself, so the lattice is drawn on a canvas instead: positions and spacing
   are still fixed, and what changes per frame is each dot's radius, alpha
   and colour.

   Two things are summed per dot. A slow drift of crossed diagonal waves
   keeps the field alive, and on top of it three origins each emit a ring
   that leaves at full strength and thins as it travels out. The rings are
   what carry the spreading; the drift is only the water they cross.

   Colour is the pointer's job. At rest a dot is a neutral grey, and it
   crosses to the brand blue as the pointer closes on it — so the wave is
   what you watch when the cursor is still, and the pointer is what you
   watch when it moves, rather than both competing for the same signal. */

const SPACING = 30;
const TAU = Math.PI * 2;

/* Swell. The floor is deliberately above zero: a dot at the bottom of the
   wave shrinks rather than disappearing, so the lattice stays present. */
const R_MIN = 0.75;
const R_MAX = 3.2;
const A_MIN = 0.14;
const A_MAX = 0.72;

/* The drift: fine texture under everything, so the field is never dead
   between fronts. Wavelength in px and period in seconds, written out rather
   than folded into a divisor — the divisor form hides the factor of TAU, and
   getting it wrong buys a wave whose period is wider than the screen, so the
   entire field swells and falls in unison instead of carrying a crest across
   it. The second runs backwards against the first, and the periods do not
   divide into each other, so the pair never resolves into a repeat.

   Deliberately scaled to reach mid-swell at most: this is the water, and
   the pulses below are the wave. */
const WAVES = [
  { dx: 0.48, dy: 0.88, lambda: 300, period: 13, amp: 0.34 },
  { dx: 0.92, dy: -0.39, lambda: 420, period: -17, amp: 0.22 },
];
const DRIFT = WAVES.reduce((s, w) => s + w.amp, 0);
/* Mid sets how much lattice is left between fronts and swing how much of it
   moves. Mid too low and the field empties out to nothing once a front has
   passed; swing too high and the drift starts competing with the fronts for
   the same reading. */
const DRIFT_MID = 0.26;
const DRIFT_SWING = 0.3;

/* The fronts. A standing ring pattern only ever reads as texture, so each
   origin instead emits a ring on its own period: born at the origin at full
   strength, travelling out at `speed`, thinning as it goes. Three of them on
   unrelated periods means something is always spreading somewhere without
   the three ever lining up. Positions are fractions of the field. */
const PULSES = [
  { x: 0.32, y: 0.74, period: 8.5, offset: 0, speed: 235, width: 105, amp: 1 },
  { x: 0.79, y: 0.24, period: 11, offset: 4.4, speed: 200, width: 125, amp: 0.8 },
  { x: 0.55, y: 0.46, period: 13.5, offset: 7.6, speed: 175, width: 145, amp: 0.62 },
];

const BASE = [154, 161, 170];
const BRAND = [74, 128, 248];

/* How close the pointer has to be for a dot to take the brand colour, and
   where inside that the halo starts. Below the threshold a lit dot is just
   a colour change; the glow belongs only to the ones the pointer is really
   on top of. */
const REACH = 300;
const HALO_FROM = 0.34;
const HALO_ALPHA = 0.5;
const HALO_SIZE = 32;

/* Radius and alpha both ride the swell, so the crests read as a band of
   larger, brighter dots the way a halftone wave does, rather than the whole
   field breathing in and out at one size.

   The drift is kept low and the result clamps at zero, so a good part of the
   field sits flat between fronts: what makes a wave legible is the quiet
   water around it, and a lattice that is swelling everywhere just shimmers. */
function swell(x, y, t, w, h) {
  let s = 0;
  for (const wave of WAVES) {
    const u = (x * wave.dx + y * wave.dy) / wave.lambda - t / wave.period;
    s += wave.amp * Math.sin(TAU * u);
  }
  let n = DRIFT_MID + (s / DRIFT) * DRIFT_SWING;

  for (const p of PULSES) {
    /* Age of the ring currently in flight from this origin. `fall` squared
       is what makes it a spreading wave rather than a repeating ring: the
       front is brightest as it leaves and gives out as it travels. */
    const age = (((t - p.offset) % p.period) + p.period) % p.period;
    const gap = Math.hypot(x - p.x * w, y - p.y * h) - age * p.speed;
    const fall = 1 - age / p.period;
    n += p.amp * Math.exp(-(gap * gap) / (2 * p.width * p.width)) * fall * fall;
  }

  const c = Math.min(1, Math.max(0, n));
  return c * c * (3 - 2 * c);
}

/* The glow is one pre-rendered sprite rather than a shadow per dot. Canvas
   shadows are recomputed on every fill, and there can be a few hundred lit
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
    /* Ramped rather than switched, so the pool of colour arrives with the
       pointer instead of snapping on at the first move event. */
    let strength = 0;
    let wanted = 0;
    let dirty = true;
    let raf = 0;

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
          const s = swell(x, y, t, w, h);

          let lit = 0;
          if (strength > 0.001) {
            const d = Math.hypot(px - x, py - y);
            if (d < REACH) {
              const f = 1 - d / REACH;
              lit = f * f * strength;
            }
          }

          /* A lit dot also grows a little. Colour alone reads as a stain on
             the lattice; the size change is what makes the pointer feel like
             it is lifting the dots rather than tinting them. */
          const r = (R_MIN + s * (R_MAX - R_MIN)) * (1 + lit * 0.45);
          const a = A_MIN + s * (A_MAX - A_MIN) + lit * 0.4;

          if (lit > HALO_FROM) {
            const g = (lit - HALO_FROM) / (1 - HALO_FROM);
            ctx.globalAlpha = g * g * HALO_ALPHA;
            const size_ = r * 7;
            ctx.drawImage(halo, x - size_ / 2, y - size_ / 2, size_, size_);
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
      /* Reduced motion keeps the pointer — that is the visitor's own
         movement — but holds the wave still, and only repaints when the
         pointer has actually asked for it. */
      if (still) {
        if (!dirty && Math.abs(wanted - strength) < 0.002) return;
        dirty = false;
        draw(0);
        return;
      }
      draw((now - start) / 1000);
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
