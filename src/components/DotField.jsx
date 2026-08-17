import { useEffect, useRef } from "react";

/* A fixed lattice of dots with a swell running through it.

   This was a repeating background image with a mask following the pointer,
   which is cheap but paints every dot at one size — the whole field could
   only brighten and dim together. A wave means each dot has to answer for
   itself, so the lattice is drawn on a canvas instead: positions and spacing
   are still fixed, and what changes per frame is each dot's radius, alpha
   and colour.

   Three sine waves are summed per dot: two diagonal bands travelling in
   opposite directions and a ripple spreading out from a point low on the
   left. Two would beat against each other on a visible cycle; the third,
   on an unrelated period and a different geometry, is what stops the field
   from reading as a repeating pattern.

   Colour is the pointer's job. At rest a dot is a neutral grey, and it
   crosses to the brand blue as the pointer closes on it — so the wave is
   what you watch when the cursor is still, and the pointer is what you
   watch when it moves, rather than both competing for the same signal. */

const SPACING = 30;
const TAU = Math.PI * 2;

/* Swell. The floor is deliberately above zero: a dot at the bottom of the
   wave shrinks rather than disappearing, so the lattice stays present. */
const R_MIN = 0.7;
const R_MAX = 3.2;
const A_MIN = 0.1;
const A_MAX = 0.72;

/* Wavelength in px and period in seconds, written out rather than folded
   into a divisor — the divisor form hides the factor of TAU, and getting it
   wrong buys a wave whose period is wider than the screen, so the entire
   field swells and falls in unison instead of carrying a crest across it.
   The second wave runs backwards (negative period) against the first, and
   the periods are mutually prime-ish so the pair never resolves into a
   repeat you can catch. */
const WAVES = [
  { dx: 0.48, dy: 0.88, lambda: 460, period: 9, amp: 0.5 },
  { dx: 0.92, dy: -0.39, lambda: 700, period: -13, amp: 0.28 },
];
const RIPPLE = { lambda: 520, period: 11, amp: 0.34 };
const TOTAL = WAVES.reduce((s, w) => s + w.amp, RIPPLE.amp);

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

   The bias pushes roughly a third of the field under zero and holds it
   there: without it the swell only ever ranges between small and large and
   the lattice reads as a uniform grid shimmering, where what makes a wave
   legible is the quiet water around it. */
function swell(x, y, t, rx, ry) {
  let s = 0;
  for (const w of WAVES) {
    s += w.amp * Math.sin(TAU * ((x * w.dx + y * w.dy) / w.lambda - t / w.period));
  }
  s +=
    RIPPLE.amp *
    Math.sin(TAU * (Math.hypot(x - rx, y - ry) / RIPPLE.lambda - t / RIPPLE.period));
  const n = Math.min(1, Math.max(0, (s / TOTAL + 0.25) / 0.95));
  return n * n * (3 - 2 * n);
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
      const rx = w * 0.36;
      const ry = h * 0.74;
      const cols = Math.ceil(w / SPACING);
      const rows = Math.ceil(h / SPACING);
      const half = (w - (cols - 1) * SPACING) / 2;

      for (let row = 0; row <= rows; row++) {
        const y = row * SPACING;
        for (let col = 0; col <= cols; col++) {
          const x = half + col * SPACING;
          const s = swell(x, y, t, rx, ry);

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
