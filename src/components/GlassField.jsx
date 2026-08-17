import useInView from "../hooks/useInView";

/* A sheet with a hole punched through the middle, drawn as the fracture
   alone: no fills, no bevels, no reflection — just the lines the break left.
   Every piece shares its sides with its neighbours and is pulled in by half a
   crack, so the space between two of them is the crack.

   Nothing is random. The fracture is built from three written tables: how far
   apart the cracks run, how far the hole reaches, and where each wedge breaks
   again on its way out. */
const HERO_W = 1440;
const HERO_H = 810;
const CENTRE_X = 720;
const CENTRE_Y = 405;

const HOLE_RX = 430;
const HOLE_RY = 250;

const CRACK = 9; // the gap left between two pieces
const STROKE = 1.5; // one width for every outline
const STROKE_OPACITY = 0.5;

/* Degrees between one crack and the next. The four repeat twelve times, which
   is exactly 360 — the ring has to close or the last wedge folds back over
   the first and swallows the hole. */
const STEPS = [7, 8, 6, 9];

/* How far the hole reaches along each ray, as a multiple of the base ellipse.
   Seven values against a four-step cycle so the jaggedness never lines up. */
const HOLE_REACH = [0.86, 1.18, 0.92, 1.26, 0.83, 1.09, 0.97];

/* Where each wedge breaks again between the hole and the frame. Wedges that
   reach a corner are the longest on screen, so every one is broken at least
   once — left whole they read as one big plate covering the corner. */
const BREAKS = [
  [0.36, 0.7],
  [0.5],
  [0.3, 0.62],
  [0.44],
  [0.55],
  [0.33, 0.66],
  [0.47],
];

const rad = (deg) => (deg * Math.PI) / 180;

function buildRays() {
  const out = [];
  let a = -90;
  for (let i = 0; i < STEPS.length * 12; i++) {
    out.push({
      a,
      r: HOLE_REACH[i % HOLE_REACH.length],
      breaks: BREAKS[i % BREAKS.length],
    });
    a += STEPS[i % STEPS.length];
  }
  return out;
}

const RAYS = buildRays();

function holePoint(ray) {
  return {
    x: CENTRE_X + Math.cos(rad(ray.a)) * HOLE_RX * ray.r,
    y: CENTRE_Y + Math.sin(rad(ray.a)) * HOLE_RY * ray.r,
  };
}

/* Where a ray from the centre leaves the frame. */
function framePoint(deg) {
  const dx = Math.cos(rad(deg));
  const dy = Math.sin(rad(deg));
  const tx = dx > 0 ? CENTRE_X / dx : dx < 0 ? -CENTRE_X / dx : Infinity;
  const ty =
    dy > 0 ? (HERO_H - CENTRE_Y) / dy : dy < 0 ? -CENTRE_Y / dy : Infinity;
  const t = Math.min(Math.abs(tx), Math.abs(ty));
  return { x: CENTRE_X + dx * t, y: CENTRE_Y + dy * t };
}

/* Position on the frame as 0–4, clockwise from the middle of the right edge,
   so the corners land on whole numbers. */
function perimeterAt(p) {
  if (p.x >= HERO_W - 0.5) return p.y / HERO_H;
  if (p.y >= HERO_H - 0.5) return 1 + (HERO_W - p.x) / HERO_W;
  if (p.x <= 0.5) return 2 + (HERO_H - p.y) / HERO_H;
  return 3 + p.x / HERO_W;
}

const CORNERS = [
  { x: HERO_W, y: HERO_H },
  { x: 0, y: HERO_H },
  { x: 0, y: 0 },
  { x: HERO_W, y: 0 },
];

/* The corners a wedge folds around between one ray and the next; without them
   its outer edge cuts the corner off. */
function cornersBetween(from, to) {
  const out = [];
  let end = to;
  if (end < from) end += 4;
  for (let c = Math.ceil(from); c < end; c++) out.push(CORNERS[c % 4]);
  return out;
}

const lerp = (a, b, t) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

function centroid(pts) {
  return {
    x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
    y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
  };
}

function area(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a) / 2;
}

/* Pull every edge in by half a crack, so the gap between two neighbours ends
   up one crack wide. Vertices travel along the bisector, which keeps sharp
   corners sharp instead of rounding them off. */
function inset(pts, d) {
  const n = pts.length;
  const shift = (sign) =>
    pts.map((p, i) => {
      const prev = pts[(i - 1 + n) % n];
      const next = pts[(i + 1) % n];
      const e1 = { x: p.x - prev.x, y: p.y - prev.y };
      const e2 = { x: next.x - p.x, y: next.y - p.y };
      const l1 = Math.hypot(e1.x, e1.y) || 1;
      const l2 = Math.hypot(e2.x, e2.y) || 1;
      const n1 = { x: (-e1.y / l1) * sign, y: (e1.x / l1) * sign };
      const n2 = { x: (-e2.y / l2) * sign, y: (e2.x / l2) * sign };
      let bx = n1.x + n2.x;
      let by = n1.y + n2.y;
      const bl = Math.hypot(bx, by);
      if (bl < 1e-6) return { ...p };
      bx /= bl;
      by /= bl;
      const cos = Math.max(0.3, n1.x * bx + n1.y * by);
      return { x: p.x + (bx * d) / cos, y: p.y + (by * d) / cos };
    });

  const a = shift(1);
  return area(a) < area(pts) ? a : shift(-1);
}

function buildPieces() {
  const raw = [];

  RAYS.forEach((ray, i) => {
    const next = RAYS[(i + 1) % RAYS.length];
    const h0 = holePoint(ray);
    const h1 = holePoint(next);
    const f0 = framePoint(ray.a);
    const f1 = framePoint(next.a);
    const bridge = cornersBetween(perimeterAt(f0), perimeterAt(f1));

    /* Break the wedge into rings between the hole and the frame. Only the
       outermost one carries the frame corners. */
    const cuts = [0, ...ray.breaks, 1];
    for (let s = 0; s < cuts.length - 1; s++) {
      const a0 = lerp(h0, f0, cuts[s]);
      const a1 = lerp(h1, f1, cuts[s]);
      const outermost = s === cuts.length - 2;
      const b1 = outermost ? f1 : lerp(h1, f1, cuts[s + 1]);
      const b0 = outermost ? f0 : lerp(h0, f0, cuts[s + 1]);
      raw.push(
        outermost
          ? [a0, a1, b1, ...bridge.slice().reverse(), b0]
          : [a0, a1, b1, b0],
      );
    }
  });

  return raw.map((pts, k) => {
    const c = centroid(pts);
    const cut = inset(pts, CRACK / 2);
    const pull = 0.3 + ((k * 7) % 5) * 0.07;

    return {
      points: cut.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
      cx: c.x,
      cy: c.y,
      tx: -(c.x - CENTRE_X) * pull,
      ty: -(c.y - CENTRE_Y) * pull,
      rot: (((k * 19) % 9) - 4) * 5,
      scale: 0.55 + ((k * 23) % 6) * 0.05,
      duration: 900 + ((k * 29) % 8) * 90,
      delay: ((k * 31) % 11) * 46,
    };
  });
}

const PIECES = buildPieces();

export default function GlassField({ delay = 0, className = "" }) {
  const [ref, inView] = useInView({ threshold: 0, rootMargin: "0px" });

  return (
    <svg
      ref={ref}
      aria-hidden
      viewBox={`0 0 ${HERO_W} ${HERO_H}`}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none ${className}`}
    >
      {PIECES.map((piece, i) => (
        <polygon
          key={i}
          points={piece.points}
          fill="none"
          stroke="#4a80f8"
          strokeOpacity={STROKE_OPACITY}
          strokeWidth={STROKE}
          strokeLinejoin="round"
          className={`glass-fleck${inView ? " is-in" : ""}`}
          style={{
            transformOrigin: `${piece.cx.toFixed(1)}px ${piece.cy.toFixed(1)}px`,
            transitionDelay: inView
              ? `${(delay + piece.delay).toFixed(0)}ms`
              : "0ms",
            "--kx": `${piece.tx.toFixed(1)}px`,
            "--ky": `${piece.ty.toFixed(1)}px`,
            "--kr": `${piece.rot.toFixed(1)}deg`,
            "--ks": piece.scale.toFixed(3),
            "--kd": inView ? `${piece.duration.toFixed(0)}ms` : "0ms",
          }}
        />
      ))}
    </svg>
  );
}
