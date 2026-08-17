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

/* The mark is scaled so its ring lands in the crowded outer band. That is
   what makes the shards add up to something: the ring is where the glass is
   thickest, so the circle is what emerges. */
const RING_ON_SCREEN = 470;
const MARK_SCALE = RING_ON_SCREEN / RING_R;
const MARK_TRANSFORM = `translate(${(CENTRE_X - MARK_SCALE * RING_X).toFixed(2)} ${(CENTRE_Y - MARK_SCALE * RING_Y).toFixed(2)}) scale(${MARK_SCALE.toFixed(4)})`;

/* Near-circular so the band tracks the ring, which is circular too. */
const SPREAD = 580;
const COUNT = 84;
const CORE = 7; // shards held back for the M at the centre
const HOLE = 0.5;
const BIAS = 0.28;

function buildShards() {
  return Array.from({ length: COUNT }, (_, k) => {
    const onCore = k < CORE;
    const angle = rnd(k * 3.7 + 1) * Math.PI * 2;
    /* Everything but a handful sits outside HOLE and is pushed hard towards
       the rim; the few held back cover the M so the centre is not a void. */
    const reach = onCore
      ? 0.04 + rnd(k * 5.3 + 2) * 0.16
      : HOLE + (1 - HOLE) * Math.pow(rnd(k * 5.3 + 2), BIAS);

    const cx = CENTRE_X + Math.cos(angle) * SPREAD * reach;
    const cy = CENTRE_Y + Math.sin(angle) * SPREAD * reach;
    const size = onCore
      ? 34 + rnd(k * 7.9 + 3) * 30
      : (62 + rnd(k * 7.9 + 3) * 104) * (1.12 - reach * 0.3);

    /* Wedges, not even triangles: one vertex thrown well out along the line
       from the centre and two kept close behind it. Even triangles read as
       confetti — a splinter carries the direction it flew. */
    const outward = Math.atan2(cy - CENTRE_Y, cx - CENTRE_X);
    const tip = outward + (rnd(k * 11.3 + 4) - 0.5) * 1.6;
    const flare = 0.38 + rnd(k * 53.1 + 15) * 0.6;
    const points = [
      { a: tip, r: size * (1.05 + rnd(k * 31 + 1) * 1.0) },
      { a: tip + Math.PI - flare, r: size * (0.26 + rnd(k * 37 + 2) * 0.38) },
      { a: tip + Math.PI + flare, r: size * (0.26 + rnd(k * 41 + 3) * 0.38) },
    ].map((v) => ({
      x: cx + Math.cos(v.a) * v.r,
      y: cy + Math.sin(v.a) * v.r,
    }));

    const pull = 0.35 + rnd(k * 19.3 + 7) * 0.4;

    return {
      points: points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
      cx,
      cy,
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
          clipPath={`url(#${markId}-c${i})`}
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
          {/* A faint pane so the fragment reads as glass where the mark does
              not reach it. */}
          <polygon points={shard.points} fill="#4a80f8" opacity="0.05" />

          {/* Flat underlay first: the file's gradient is transparent at
              exactly the ring's radius, and the ring is the part the field is
              built around. */}
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
      ))}
    </svg>
  );
}
