import useInView from "../hooks/useInView";
import { bleedVertex, buildFacetGrid, rnd } from "../lib/facets";

/* The hero wordmark's treatment, generalised so anything on the page can be
   broken the same way. Each shard is a full-size copy of the content clipped
   to one triangle and displaced, so the content splits along the fracture
   lines and slides back into register.

   Percentages, not SVG clip paths: clip-path and translate both resolve
   against the element's own box, so one set of numbers works at any size and
   the effect can go on a heading, a card, anything block-level.

   It renders the content once per shard, so keep it to short runs of text. */
const BLEED = 0.006;

function makeShards({ cols, rows, seed }) {
  return buildFacetGrid({ cols, rows, seed }).map((facet, k) => {
    const r1 = rnd(k * 7.3 + seed + 1);
    const r2 = rnd(k * 3.1 + seed + 5);
    const r3 = rnd(k * 11.7 + seed + 2);
    const r4 = rnd(k * 5.5 + seed + 9);
    const r5 = rnd(k * 17.9 + seed + 4);
    const r6 = rnd(k * 23.3 + seed + 6);
    const away = facet.cx < 0.5 ? -1 : 1;
    const pct = (n) => `${(n * 100).toFixed(2)}%`;

    return {
      clip: `polygon(${facet.points
        .map((p) => bleedVertex(p, facet.cx, facet.cy, BLEED))
        .map((p) => `${pct(p.x)} ${pct(p.y)}`)
        .join(", ")})`,
      origin: `${pct(facet.cx)} ${pct(facet.cy)}`,
      tx: away * (3 + r1 * 11),
      ty: (r2 - 0.5) * 36,
      rot: (r3 - 0.5) * 22,
      skew: (r5 - 0.5) * 14,
      scale: 0.82 + r4 * 0.34,
      duration: 760 + r6 * 380,
      delay: facet.cx * 340 + r1 * 140,
    };
  });
}

/* Density is a cost dial as much as a look. The content is rendered once per
   shard, so a paragraph split twenty ways is twenty paragraphs — fine for a
   heading, wasteful for body copy. Displacement is in percentages of the
   element's own box, so the motion stays proportional at any text size. */
const GRIDS = {
  fine: makeShards({ cols: 5, rows: 2, seed: 3 }),
  coarse: makeShards({ cols: 3, rows: 2, seed: 11 }),
  wide: makeShards({ cols: 4, rows: 1, seed: 23 }),
};

export default function Faceted({
  as: Tag = "div",
  density = "fine",
  delay = 0,
  className = "",
  children,
  ...rest
}) {
  const shards = GRIDS[density] ?? GRIDS.fine;
  const [ref, inView] = useInView();

  return (
    <Tag ref={ref} className={`relative ${className}`} {...rest}>
      {/* Carries the layout and stays in the accessibility tree; the shards
          are decoration stacked on top of it. */}
      <span className="opacity-0">{children}</span>

      {shards.map((shard, i) => (
        <span
          key={i}
          aria-hidden
          className={`glass-shard select-none${inView ? " is-in" : ""}`}
          style={{
            clipPath: shard.clip,
            transformOrigin: shard.origin,
            transitionDelay: inView
              ? `${(delay + shard.delay).toFixed(0)}ms`
              : "0ms",
            "--gx": `${shard.tx.toFixed(2)}%`,
            "--gy": `${shard.ty.toFixed(2)}%`,
            "--gr": `${shard.rot.toFixed(2)}deg`,
            "--gk": `${shard.skew.toFixed(2)}deg`,
            "--gs": shard.scale.toFixed(3),
            "--gd": inView ? `${shard.duration.toFixed(0)}ms` : "0ms",
          }}
        >
          {children}
        </span>
      ))}
    </Tag>
  );
}
