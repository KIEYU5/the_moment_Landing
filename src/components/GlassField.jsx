import { useId } from "react";
import useInView from "../hooks/useInView";
import { MARK, RING_R, RING_X, RING_Y } from "../lib/mark";

/* A sheet of glass with a hole punched through the middle of it.

   Earlier versions scattered separate splinters around the frame, which is
   why it read as confetti: real breakage leaves the plate intact and the
   pieces still touching, and it is the hairline between two pieces that says
   glass. So the border is tiled edge to edge — every piece shares its sides
   with its neighbours — and the only empty space is the crack itself and the
   hole in the centre.

   Nothing here is random. The fracture is a written list of rays: an angle
   out from the centre, how far the hole reaches along it, and whether that
   wedge is broken again part way out. */
const HERO_W = 1440;
const HERO_H = 810;
const CENTRE_X = 720;
const CENTRE_Y = 405;

const HOLE_RX = 430;
const HOLE_RY = 250;
const CRACK = 3; // width of the gap left between two pieces

/* angle in degrees · hole reach along it · where it breaks again (0 = whole)

   The angles must run exactly once around. Listing them from -90 to 347 is
   437 degrees: the last wedge then folds backwards over the first and swallows
   the hole, which is not obvious from the numbers but very obvious on screen. */
const RAYS = [
  { a: -90, r: 0.86, split: 0.42 },
  { a: -79, r: 1.12, split: 0 },
  { a: -68, r: 0.94, split: 0.55 },
  { a: -56, r: 1.24, split: 0 },
  { a: -45, r: 0.9, split: 0.38 },
  { a: -34, r: 1.06, split: 0 },
  { a: -22, r: 0.83, split: 0.5 },
  { a: -11, r: 1.18, split: 0 },
  { a: 0, r: 0.97, split: 0.44 },
  { a: 12, r: 1.28, split: 0 },
  { a: 23, r: 0.88, split: 0.36 },
  { a: 34, r: 1.09, split: 0 },
  { a: 46, r: 0.92, split: 0.52 },
  { a: 57, r: 1.21, split: 0 },
  { a: 68, r: 0.85, split: 0.4 },
  { a: 80, r: 1.14, split: 0 },
  { a: 91, r: 0.96, split: 0.47 },
  { a: 102, r: 1.26, split: 0 },
  { a: 114, r: 0.89, split: 0.34 },
  { a: 125, r: 1.04, split: 0 },
  { a: 136, r: 0.93, split: 0.56 },
  { a: 148, r: 1.19, split: 0 },
  { a: 159, r: 0.84, split: 0.43 },
  { a: 170, r: 1.11, split: 0 },
  { a: 182, r: 0.98, split: 0.5 },
  { a: 193, r: 1.23, split: 0 },
  { a: 204, r: 0.87, split: 0.37 },
  { a: 216, r: 1.16, split: 0 },
  { a: 227, r: 0.95, split: 0.53 },
  { a: 238, r: 1.07, split: 0 },
  { a: 250, r: 0.91, split: 0.41 },
  { a: 261, r: 1.25, split: 0 },
];

const rad = (deg) => (deg * Math.PI) / 180;

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
  const ty = dy > 0 ? (HERO_H - CENTRE_Y) / dy : dy < 0 ? -CENTRE_Y / dy : Infinity;
  const t = Math.min(Math.abs(tx), Math.abs(ty));
  return { x: CENTRE_X + dx * t, y: CENTRE_Y + dy * t };
}

/* Position of a point on the frame as 0–4, running clockwise from the middle
   of the right edge, so corners fall on the whole numbers. */
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

/* The frame corners a wedge has to fold around on its way from one ray to
   the next; without them the outer edge cuts the corner off. */
function cornersBetween(from, to) {
  const out = [];
  let end = to;
  if (end < from) end += 4;
  for (let c = Math.ceil(from); c < end; c++) out.push(CORNERS[c % 4]);
  return out;
}

const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

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
   up one crack wide. Vertices move along the bisector, which keeps sharp
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
      // how far along the bisector to reach a perpendicular distance of d
      const cos = Math.max(0.3, n1.x * bx + n1.y * by);
      return { x: p.x + (bx * d) / cos, y: p.y + (by * d) / cos };
    });

  const a = shift(1);
  return area(a) < area(pts) ? a : shift(-1);
}

function buildPieces() {
  const pieces = [];

  RAYS.forEach((ray, i) => {
    const next = RAYS[(i + 1) % RAYS.length];
    const h0 = holePoint(ray);
    const h1 = holePoint(next);
    const f0 = framePoint(ray.a);
    const f1 = framePoint(next.a);
    const bridge = cornersBetween(perimeterAt(f0), perimeterAt(f1));

    /* Outer edge runs f0 → corners → f1, so coming back it is reversed. */
    const outer = [f1, ...bridge.slice().reverse()];

    if (ray.split > 0) {
      const m0 = lerp(h0, f0, ray.split);
      const m1 = lerp(h1, f1, ray.split);
      pieces.push([h0, h1, m1, m0]);
      pieces.push([m0, m1, ...outer, f0]);
    } else {
      pieces.push([h0, h1, ...outer, f0]);
    }
  });

  return pieces.map((pts, k) => {
    const c = centroid(pts);
    const cut = inset(pts, CRACK / 2);
    const bevel = inset(cut, 7);
    /* Thrown straight out along the line it broke on, turned a little, with
       the swing set by index rather than chance. */
    const pull = 0.3 + ((k * 7) % 5) * 0.07;

    return {
      points: cut.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
      bevel: bevel.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
      cx: c.x,
      cy: c.y,
      face: 0.05 + ((k * 3) % 4) * 0.018,
      edge: 0.3 + ((k * 5) % 6) * 0.05,
      rim: 1 + ((k * 11) % 3) * 0.5,
      flat: 0.12 + ((k * 13) % 5) * 0.035,
      tint: 0.5 + ((k * 17) % 6) * 0.06,
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

const MARK_SCALE = 720 / RING_R;
const MARK_TRANSFORM = `translate(${(CENTRE_X - MARK_SCALE * RING_X).toFixed(2)} ${(CENTRE_Y - MARK_SCALE * RING_Y).toFixed(2)}) scale(${MARK_SCALE.toFixed(4)})`;

export default function GlassField({ delay = 0, className = "" }) {
  const [ref, inView] = useInView({ threshold: 0, rootMargin: "0px" });
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const markId = `glass-mark-${uid}`;
  const tintId = `glass-tint-${uid}`;

  return (
    <svg
      ref={ref}
      aria-hidden
      viewBox={`0 0 ${HERO_W} ${HERO_H}`}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none ${className}`}
    >
      <defs>
        <g id={markId} transform={MARK_TRANSFORM}>
          <path d={MARK} />
        </g>

        <radialGradient
          id={tintId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform={`translate(${RING_X} ${RING_Y}) rotate(90) scale(25.2875 25.2878)`}
        >
          <stop stopColor="#2438F8" />
          <stop offset="0.296875" stopColor="#6A76E9" />
          <stop offset="1" stopColor="#6A76E9" stopOpacity="0" />
        </radialGradient>

        {PIECES.map((piece, i) => (
          <clipPath key={i} id={`${markId}-c${i}`}>
            <polygon points={piece.points} />
          </clipPath>
        ))}
      </defs>

      {PIECES.map((piece, i) => (
        <g
          key={i}
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
        >
          <g clipPath={`url(#${markId}-c${i})`}>
            <polygon
              points={piece.points}
              fill="#4a80f8"
              opacity={piece.face.toFixed(3)}
            />
            <use
              href={`#${markId}`}
              fill="#4a80f8"
              opacity={piece.flat.toFixed(3)}
            />
            <use
              href={`#${markId}`}
              fill={`url(#${tintId})`}
              opacity={piece.tint.toFixed(3)}
            />
          </g>

          <polygon
            points={piece.points}
            fill="none"
            stroke="#4a80f8"
            strokeOpacity={piece.edge.toFixed(3)}
            strokeWidth={piece.rim.toFixed(2)}
            strokeLinejoin="round"
          />
          <polygon
            points={piece.bevel}
            fill="none"
            stroke="#4a80f8"
            strokeOpacity={(piece.edge * 0.35).toFixed(3)}
            strokeWidth={(piece.rim * 0.6).toFixed(2)}
            strokeLinejoin="round"
          />
        </g>
      ))}
    </svg>
  );
}
