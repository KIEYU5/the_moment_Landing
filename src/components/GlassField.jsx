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
const COUNT = 150;
const FLOATERS = 7; // a few chips adrift in the empty middle
const OVERHANG = 70; // the border sits outside the frame, so shards get cut
const BAND = 340; // how far in the deepest shard can sit
const DEPTH_BIAS = 2.4; // >1 crowds them towards the edge

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

function buildShards() {
  return Array.from({ length: COUNT + FLOATERS }, (_, k) => {
    const adrift = k >= COUNT;

    /* One even step per shard, jittered by less than a step so the spacing
       varies without ever tearing a hole in the band. */
    const t = (k + 0.5 + (rnd(k * 3.7 + 1) - 0.5) * 0.85) / COUNT;
    const edge = onPerimeter(((t % 1) + 1) % 1);
    const depth = BAND * Math.pow(rnd(k * 5.3 + 2), DEPTH_BIAS);

    const cx = adrift
      ? 380 + rnd(k * 83.1 + 21) * (HERO_W - 760)
      : edge.x + edge.nx * depth;
    const cy = adrift
      ? 250 + rnd(k * 89.7 + 22) * (HERO_H - 500)
      : edge.y + edge.ny * depth;

    /* Kept in check on purpose: the long axis runs up to 1.7x this and a
       vertex can sit 1.2x further again, so a shard reaches about three
       times its size from its own centre. Larger and the band stops being a
       band — the pieces meet in the middle and the hero fills in. */
    const size = adrift
      ? 15 + rnd(k * 7.9 + 3) * 24
      : 44 + rnd(k * 7.9 + 3) * 106;

    /* Three to five corners, stretched along one axis and knocked off the
       ellipse per vertex: slivers, wedges and chipped plates rather than one
       triangle repeated. Angles are generated in order so the outline never
       crosses itself. */
    const corners = 3 + Math.floor(rnd(k * 59.3 + 16) * 3);
    const long = size * (0.8 + rnd(k * 61.7 + 17) * 0.9);
    const short = size * (0.16 + rnd(k * 67.1 + 18) * 0.38);
    const axis = rnd(k * 11.3 + 4) * Math.PI * 2;
    const cosA = Math.cos(axis);
    const sinA = Math.sin(axis);

    const points = Array.from({ length: corners }, (_, i) => {
      const a =
        ((i + 0.5 + (rnd(k * 71 + i * 7 + 3) - 0.5) * 0.9) / corners) *
        Math.PI *
        2;
      const bite = 0.55 + rnd(k * 73 + i * 11 + 5) * 0.65;
      const px = Math.cos(a) * long * bite;
      const py = Math.sin(a) * short * bite;
      return {
        x: cx + px * cosA - py * sinA,
        y: cy + px * sinA + py * cosA,
      };
    });

    const pull = 0.35 + rnd(k * 19.3 + 7) * 0.4;

    /* The same outline pulled in towards the centroid. Drawn as a second
       hairline it reads as the bevel on a thick piece of glass, which is
       most of what separates a shard from a translucent blob. */
    const inset = points.map((p) => ({
      x: cx + (p.x - cx) * 0.76,
      y: cy + (p.y - cy) * 0.76,
    }));

    return {
      points: points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
      inset: inset.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
      cx,
      cy,
      edge: 0.28 + rnd(k * 79.1 + 19) * 0.4,
      rim: 1 + rnd(k * 97.3 + 23) * 1.4,
      flat: 0.12 + rnd(k * 29.5 + 9) * 0.2,
      tint: 0.5 + rnd(k * 47.3 + 14) * 0.4,
      tx: -(cx - CENTRE_X) * pull,
      ty: -(cy - CENTRE_Y) * pull,
      rot: (rnd(k * 31.7 + 10) - 0.5) * 70,
      scale: 0.35 + rnd(k * 37.1 + 11) * 0.35,
      duration: 900 + rnd(k * 41.3 + 12) * 700,
      delay: rnd(k * 43.9 + 13) * 420,
    };
  });
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
