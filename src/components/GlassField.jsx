import { useId } from "react";
import useInView from "../hooks/useInView";
import { rnd } from "../lib/facets";
import { MARK, RING_R, RING_X, RING_Y } from "../lib/mark";

/* One logo, laid across the whole hero at size, and a field of glass lying
   on top of it. Every shard clips the same image, so no shard carries a logo
   of its own — the mark only exists in what the pieces hold between them.

   The clip travels with the shard: a transform on the group moves the
   clip-path with the content, so each fragment keeps its own slice of the
   image as it is thrown. */
const HERO_W = 1440;
const HERO_H = 810;
const CENTRE_X = 720;
const CENTRE_Y = 405;

/* The mark is scaled until its ring reaches the left and right edges, where
   the glass is. The band follows the frame and the ring is a circle, so they
   only meet at the sides — the visible arcs are the two the frame crops. */
const RING_ON_SCREEN = 720;
const MARK_SCALE = RING_ON_SCREEN / RING_R;
const MARK_TRANSFORM = `translate(${(CENTRE_X - MARK_SCALE * RING_X).toFixed(2)} ${(CENTRE_Y - MARK_SCALE * RING_Y).toFixed(2)}) scale(${MARK_SCALE.toFixed(4)})`;

/* Shards hug the frame rather than ringing the centre. Sampling an angle at
   random clumps them — eighty pieces over a full turn leaves holes big enough
   to see, which is what made the field look patchy. Walking the perimeter in
   even steps instead guarantees the band closes all the way round, and the
   depth curve keeps most of them near the edge. */
/* Density comes from count, not size. Bigger shards crowd the band inward
   until the pieces meet in the middle and the hero fills in; more of them at
   the same size thickens the border and leaves the centre alone. */
const COUNT = 200;
const FLOATERS = 7; // a few chips adrift in the empty middle
const OVERHANG = 70; // the border sits outside the frame, so shards get cut
/* Capped tight. Rejection pushes pieces inward — when a shallow spot is
   taken the next attempt draws a new depth — so a deep band lets the retries
   wander into the middle and the ramp flattens out. */
const BAND = 240; // how far in the deepest shard can sit
const DEPTH_BIAS = 2.4; // >1 crowds them towards the edge
const GAP = 5; // clear air kept between neighbouring pieces
const MAX_TRIES = 16; // attempts to fit one shard before giving up on it

const EDGE_X0 = -OVERHANG;
const EDGE_Y0 = -OVERHANG;
const EDGE_X1 = HERO_W + OVERHANG;
const EDGE_Y1 = HERO_H + OVERHANG;

/* A point at t around the frame, with the inward normal. */
function onPerimeter(t) {
  const w = EDGE_X1 - EDGE_X0;
  const h = EDGE_Y1 - EDGE_Y0;
  let d = t * (2 * (w + h));
  if (d < w) return { x: EDGE_X0 + d, y: EDGE_Y0, nx: 0, ny: 1 };
  d -= w;
  if (d < h) return { x: EDGE_X1, y: EDGE_Y0 + d, nx: -1, ny: 0 };
  d -= h;
  if (d < w) return { x: EDGE_X1 - d, y: EDGE_Y1, nx: 0, ny: -1 };
  d -= w;
  return { x: EDGE_X0, y: EDGE_Y1 - d, nx: 1, ny: 0 };
}

/* Convex hull so the overlap test below is valid — separating axes only
   decide it for convex shapes, and jittering a vertex inward can leave the
   outline dented. */
function hull(pts) {
  const p = [...pts].sort((a, b) => a.x - b.x || a.y - b.y);
  if (p.length < 3) return p;
  const cross = (o, a, b) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const half = (list) => {
    const out = [];
    for (const q of list) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], q) <= 0)
        out.pop();
      out.push(q);
    }
    return out;
  };
  const lower = half(p);
  const upper = half([...p].reverse());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

function axesOf(poly) {
  return poly.map((a, i) => {
    const b = poly[(i + 1) % poly.length];
    const ex = b.x - a.x;
    const ey = b.y - a.y;
    const len = Math.hypot(ex, ey) || 1;
    return { x: -ey / len, y: ex / len };
  });
}

/* Separating-axis test with a gap: if any axis leaves GAP of clear air
   between the two outlines they are apart, and one such axis is enough. */
function apart(a, b, gap) {
  for (const ax of [...axesOf(a), ...axesOf(b)]) {
    let aMin = Infinity;
    let aMax = -Infinity;
    let bMin = Infinity;
    let bMax = -Infinity;
    for (const p of a) {
      const d = p.x * ax.x + p.y * ax.y;
      if (d < aMin) aMin = d;
      if (d > aMax) aMax = d;
    }
    for (const p of b) {
      const d = p.x * ax.x + p.y * ax.y;
      if (d < bMin) bMin = d;
      if (d > bMax) bMax = d;
    }
    if (aMax + gap < bMin || bMax + gap < aMin) return true;
  }
  return false;
}

function candidate(k, attempt, adrift) {
  const s = (n) => rnd(k * 101.7 + attempt * 7.3 + n);

  const t = (k + 0.5 + (rnd(k * 3.7 + 1) - 0.5) * 0.85) / COUNT;
  const edge = onPerimeter(((t % 1) + 1) % 1);
  const depth = BAND * Math.pow(s(2), DEPTH_BIAS);

  const cx = adrift ? 380 + s(21) * (HERO_W - 760) : edge.x + edge.nx * depth;
  const cy = adrift ? 250 + s(22) * (HERO_H - 500) : edge.y + edge.ny * depth;

  /* Each retry looks for a smaller piece, so late arrivals settle into the
     gaps left over instead of failing outright. */
  const shrink = Math.pow(0.93, attempt);
  const size = (adrift ? 15 + s(3) * 24 : 44 + s(3) * 106) * shrink;

  /* Three to five corners, stretched along one axis and knocked off the
     ellipse per vertex: slivers, wedges and chipped plates rather than one
     triangle repeated. Angles are generated in order so the outline never
     crosses itself. */
  const corners = 3 + Math.floor(s(16) * 3);
  const long = size * (0.8 + s(17) * 0.9);
  const short = size * (0.16 + s(18) * 0.38);
  const axis = s(4) * Math.PI * 2;
  const cosA = Math.cos(axis);
  const sinA = Math.sin(axis);

  const points = Array.from({ length: corners }, (_, i) => {
    const a = ((i + 0.5 + (s(71 + i * 7) - 0.5) * 0.9) / corners) * Math.PI * 2;
    const bite = 0.55 + s(73 + i * 11) * 0.65;
    const px = Math.cos(a) * long * bite;
    const py = Math.sin(a) * short * bite;
    return { x: cx + px * cosA - py * sinA, y: cy + px * sinA + py * cosA };
  });

  const shape = hull(points);
  const reach = Math.max(...shape.map((p) => Math.hypot(p.x - cx, p.y - cy)));
  const pull = 0.35 + s(7) * 0.4;

  return {
    shape,
    cx,
    cy,
    reach,
    edge: 0.28 + s(19) * 0.4,
    rim: 1 + s(23) * 1.4,
    flat: 0.12 + s(9) * 0.2,
    tint: 0.5 + s(14) * 0.4,
    tx: -(cx - CENTRE_X) * pull,
    ty: -(cy - CENTRE_Y) * pull,
    rot: (s(10) - 0.5) * 70,
    scale: 0.35 + s(11) * 0.35,
    duration: 900 + s(12) * 700,
    delay: s(13) * 420,
  };
}

function buildShards() {
  const placed = [];

  for (let k = 0; k < COUNT + FLOATERS; k++) {
    for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
      const c = candidate(k, attempt, k >= COUNT);
      /* Bounding circles first — most pairs are nowhere near each other and
         the separating-axis test is far too expensive to run on all of them. */
      const clash = placed.some(
        (p) =>
          Math.hypot(p.cx - c.cx, p.cy - c.cy) < p.reach + c.reach + GAP &&
          !apart(p.shape, c.shape, GAP),
      );
      if (!clash) {
        placed.push(c);
        break;
      }
    }
  }

  const fmt = (pts) =>
    pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return placed.map((s) => ({
    ...s,
    points: fmt(s.shape),
    /* The same outline pulled in towards the centroid. Drawn as a second
       hairline it reads as the bevel on a thick piece of glass, which is
       most of what separates a shard from a translucent blob. */
    inset: fmt(
      s.shape.map((p) => ({
        x: s.cx + (p.x - s.cx) * 0.76,
        y: s.cy + (p.y - s.cy) * 0.76,
      })),
    ),
  }));
}

const SHARDS = buildShards();

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

        {/* The logo file's own gradient, kept as authored and scaled with it. */}
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

        {SHARDS.map((shard, i) => (
          <clipPath key={i} id={`${markId}-c${i}`}>
            <polygon points={shard.points} />
          </clipPath>
        ))}
      </defs>

      {SHARDS.map((shard, i) => (
        <g
          key={i}
          className={`glass-fleck${inView ? " is-in" : ""}`}
          style={{
            transformOrigin: `${shard.cx.toFixed(1)}px ${shard.cy.toFixed(1)}px`,
            transitionDelay: inView
              ? `${(delay + shard.delay).toFixed(0)}ms`
              : "0ms",
            "--kx": `${shard.tx.toFixed(1)}px`,
            "--ky": `${shard.ty.toFixed(1)}px`,
            "--kr": `${shard.rot.toFixed(1)}deg`,
            "--ks": shard.scale.toFixed(3),
            "--kd": inView ? `${shard.duration.toFixed(0)}ms` : "0ms",
          }}
        >
          {/* Body: the pane, then the slice of the logo this piece holds.
              Only this part is clipped — the outlines below are drawn on the
              shard's own edge and would be halved by their own clip. */}
          <g clipPath={`url(#${markId}-c${i})`}>
            <polygon points={shard.points} fill="#4a80f8" opacity="0.05" />
            {/* Flat underlay first: the file's gradient is transparent at
                exactly the ring's radius, and the ring is the part the field
                is built around. */}
            <use
              href={`#${markId}`}
              fill="#4a80f8"
              opacity={shard.flat.toFixed(3)}
            />
            <use
              href={`#${markId}`}
              fill={`url(#${tintId})`}
              opacity={shard.tint.toFixed(3)}
            />
          </g>

          {/* Cut edge, then the bevel behind it. */}
          <polygon
            points={shard.points}
            fill="none"
            stroke="#4a80f8"
            strokeOpacity={shard.edge.toFixed(3)}
            strokeWidth={shard.rim.toFixed(2)}
            strokeLinejoin="round"
          />
          <polygon
            points={shard.inset}
            fill="none"
            stroke="#4a80f8"
            strokeOpacity={(shard.edge * 0.45).toFixed(3)}
            strokeWidth={(shard.rim * 0.7).toFixed(2)}
            strokeLinejoin="round"
          />
        </g>
      ))}
    </svg>
  );
}
