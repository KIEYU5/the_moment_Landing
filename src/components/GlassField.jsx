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
const COUNT = 18;
const CENTRE_X = 720;
const CENTRE_Y = 405;

/* Ring centre inside the mark's own 98x98 space. */
const RING_X = 48.3591;
const RING_Y = 46.8377;
const RING_R = 25.29;

function buildShards() {
  return Array.from({ length: COUNT }, (_, k) => {
    const cx = 70 + rnd(k * 3.7 + 1) * (HERO_W - 140);
    const cy = 50 + rnd(k * 5.3 + 2) * (HERO_H - 150);
    const size = 34 + rnd(k * 7.9 + 3) * 74;

    const spin = rnd(k * 11.3 + 4) * Math.PI * 2;
    const points = [0, 1, 2].map((i) => {
      const ang =
        spin + (i * 2 * Math.PI) / 3 + (rnd(k * 31 + i * 3 + 1) - 0.5) * 1.2;
      const rad = size * (0.55 + rnd(k * 37 + i * 5 + 2) * 0.7);
      return {
        x: cx + Math.cos(ang) * rad,
        y: cy + Math.sin(ang) * rad,
      };
    });

    /* Scale the mark up and drop its ring centre one radius away from the
       shard, so the arc passes straight through what the shard shows. */
    const scale = 2.6 + rnd(k * 13.7 + 5) * 6.4;
    const reach = RING_R * scale;
    const bearing = rnd(k * 17.1 + 6) * Math.PI * 2;
    const ringX = cx + Math.cos(bearing) * reach;
    const ringY = cy + Math.sin(bearing) * reach;

    /* Thrown outward from the middle of the hero: the hidden state sits back
       along that line, smaller and turned. */
    const dx = cx - CENTRE_X;
    const dy = cy - CENTRE_Y;
    const pull = 0.35 + rnd(k * 19.3 + 7) * 0.4;

    return {
      points: points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
      cx,
      cy,
      reflect: `translate(${(ringX - scale * RING_X).toFixed(2)} ${(ringY - scale * RING_Y).toFixed(2)}) scale(${scale.toFixed(3)}) rotate(${(rnd(k * 23.9 + 8) * 360).toFixed(1)} ${RING_X} ${RING_Y})`,
      opacity: 0.1 + rnd(k * 29.5 + 9) * 0.26,
      tx: -dx * pull,
      ty: -dy * pull,
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
              crosses it, then the reflection itself. */}
          <polygon points={shard.points} fill="#4a80f8" opacity="0.045" />
          <use
            href={`#${markId}`}
            transform={shard.reflect}
            fill="#4a80f8"
            opacity={shard.opacity.toFixed(3)}
          />
        </g>
      ))}
    </svg>
  );
}
