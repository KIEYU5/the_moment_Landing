import { useId } from "react";
import useInView from "../hooks/useInView";
import { rnd } from "../lib/facets";
import { MARK } from "./Logo";

/* Splinters of glass lying across the hero, each one catching the logo.
   Every shard is a triangle clipping its own copy of the mark, placed so an
   arc of the ring cuts across it — the same object seen in pieces rather
   than a pattern repeated.

   The clip travels with the shard: a transform on the group moves the
   clip-path with the content, so a shard is one object that can be thrown
   outward rather than a fixed window with something sliding behind it. */
const HERO_W = 1440;
const HERO_H = 810;
const COUNT = 30;
const CENTRE_X = 720;
const CENTRE_Y = 405;

/* r = u^BIAS with BIAS below 0.5 pushes samples outward — at 0.5 the density
   would be even across the area, and lower packs them towards the rim,
   leaving the middle open for the wordmark.

   The ellipse has to stay inside the frame or the whole point is lost: most
   shards sit near its rim, and a rim wider than the hero puts the dense band
   off-canvas. The hero is also drawn with `slice`, which crops the sides
   further, so this is kept well within 1440x810. */
const SPREAD_X = 640;
const SPREAD_Y = 390;
const BIAS = 0.32;

/* Ring centre and radius inside the mark's own 98x98 space. */
const RING_X = 48.3591;
const RING_Y = 46.8377;
const RING_R = 25.29;

function buildShards() {
  return Array.from({ length: COUNT }, (_, k) => {
    const angle = rnd(k * 3.7 + 1) * Math.PI * 2;
    const reach = Math.pow(rnd(k * 5.3 + 2), BIAS);
    const cx = CENTRE_X + Math.cos(angle) * SPREAD_X * reach;
    const cy = CENTRE_Y + Math.sin(angle) * SPREAD_Y * reach;

    /* Finer towards the rim, so the denser edge reads as debris rather than
       as a ring of large plates. */
    const size = (30 + rnd(k * 7.9 + 3) * 66) * (1.15 - reach * 0.45);

    const spin = rnd(k * 11.3 + 4) * Math.PI * 2;
    const points = [0, 1, 2].map((i) => {
      const a =
        spin + (i * 2 * Math.PI) / 3 + (rnd(k * 31 + i * 3 + 1) - 0.5) * 1.2;
      const rad = size * (0.55 + rnd(k * 37 + i * 5 + 2) * 0.7);
      return { x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad };
    });

    /* Scale the mark up and drop its ring centre one radius away from the
       shard, so the arc passes straight through what the shard shows. */
    const scale = 2.6 + rnd(k * 13.7 + 5) * 6.4;
    const bearing = rnd(k * 17.1 + 6) * Math.PI * 2;
    const ringX = cx + Math.cos(bearing) * RING_R * scale;
    const ringY = cy + Math.sin(bearing) * RING_R * scale;

    const pull = 0.35 + rnd(k * 19.3 + 7) * 0.4;

    return {
      points: points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
      cx,
      cy,
      reflect: `translate(${(ringX - scale * RING_X).toFixed(2)} ${(ringY - scale * RING_Y).toFixed(2)}) scale(${scale.toFixed(3)}) rotate(${(rnd(k * 23.9 + 8) * 360).toFixed(1)} ${RING_X} ${RING_Y})`,
      flat: 0.1 + rnd(k * 29.5 + 9) * 0.2,
      tint: 0.45 + rnd(k * 47.3 + 14) * 0.4,
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
        <path id={markId} d={MARK} />

        {/* The logo file's own gradient, kept as authored. */}
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
          {/* A faint pane so the fragment reads as glass even where no arc
              crosses it. */}
          <polygon points={shard.points} fill="#4a80f8" opacity="0.045" />

          {/* Flat underlay first: the file's gradient is transparent at
              exactly the ring's radius, so on its own the circle — the part
              of the mark these shards are cut to catch — would not show. */}
          <use
            href={`#${markId}`}
            transform={shard.reflect}
            fill="#4a80f8"
            opacity={shard.flat.toFixed(3)}
          />
          <use
            href={`#${markId}`}
            transform={shard.reflect}
            fill={`url(#${tintId})`}
            opacity={shard.tint.toFixed(3)}
          />
        </g>
      ))}
    </svg>
  );
}
