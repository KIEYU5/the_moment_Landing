import { bleedVertex, buildFacetGrid, rnd } from "./facets";

/* Geometry only — kept out of the component so the timing module can ask
   how long the wordmark takes without a component file exporting things
   that are not components. */
/* "THE MOMENT" minus the M — the M is the blue brush stroke drawn by the
   Union logo, which sits in the gap between "THE" and "OMENT". Paths are
   inlined rather than loaded as an <img> so the wordmark can be cut up. */
export const LETTERS = [
  "M0 28.6371V2.1371H126.788V28.6371H79.3229V156.863H47.4655V28.6371H0Z",
  "M146.673 156.863V2.1371H178.744V66.25H245.88V2.1371H278.165V156.863H245.88V92.75H178.744V156.863H146.673Z",
  "M304.249 156.863V2.1371H408.16V28.6371H336.321V66.25H402.815V92.75H336.321V130.363H408.374V156.863H304.249Z",
  "M818.673 79.5C818.673 129.935 787.243 159 746.405 159C705.14 159 673.924 129.722 673.924 79.5C673.924 29.0645 705.14 0 746.405 0C787.243 0 818.673 29.0645 818.673 79.5ZM785.96 79.5C785.96 46.375 770.352 28.4234 746.405 28.4234C722.459 28.4234 706.637 46.375 706.637 79.5C706.637 112.625 722.459 130.577 746.405 130.577C770.352 130.577 785.96 112.625 785.96 79.5Z",
  "M841.764 2.1371H881.532L924.508 107.069H926.218L969.194 2.1371H1008.96V156.863H977.746V55.5645H976.463L936.053 156.222H914.673L874.263 55.1371H872.98V156.863H841.764V2.1371Z",
  "M1035.05 156.863V2.1371H1138.96V28.6371H1067.12V66.25H1133.61V92.75H1067.12V130.363H1139.17V156.863H1035.05Z",
  "M1293.11 2.1371V156.863H1265.32L1197.33 58.5564H1196.04V156.863H1163.97V2.1371H1192.2L1259.76 100.444H1261.26V2.1371H1293.11Z",
  "M1313.21 28.6371V2.1371H1440V28.6371H1392.53V156.863H1360.68V28.6371H1313.21Z",
];

/* Horizontal extent of each glyph above, so a facet can draw only the letters
   that can reach it. All eight span the full band height, so x is enough. */
const LETTER_X = [
  [0, 126.8],
  [146.7, 278.2],
  [304.2, 408.4],
  [673.9, 818.7],
  [841.8, 1009.0],
  [1035.1, 1139.2],
  [1164.0, 1293.1],
  [1313.2, 1440],
];

/* The band is diced into triangles and every triangle shows the whole
   wordmark through its own clip, each one displaced and turned a little.
   Read together they are one object seen across the faces of a cut stone:
   the letterforms break across the facet seams, then slide into register.

   The band runs past the glyphs top and bottom so no facet edge lands on
   the cap line, and the grid corners stay unjittered so the triangles tile
   the rectangle exactly — a gap here would punch a hole in a letter. */
const VIEW_W = 1440;
const BAND_TOP = -20;
const BAND_H = 199;
const COLS = 12;
const ROWS = 3;

/* The M is the facet everything else resolves outward from. */
const M_CENTRE = 541;
const SPREAD = 780;

/* Motion envelope. Every facet draws its own values from this range, timing
   included — a shared duration makes 72 shards arrive as one flat wave. The
   skew is what sells refraction: a shard that is merely moved reads as a
   sliding tile, one that is also sheared reads as an image bent by glass. */
const PUSH_MIN = 36;
const PUSH_RANGE = 104;
const LIFT = 96;
const TURN = 34;
const SKEW = 16;
const SCALE_MIN = 0.78;
const SCALE_RANGE = 0.44;
const DUR_MIN = 900;
const DUR_RANGE = 420;
const CULL_PAD = 30;

/* Which slice of the wordmark ends up framed by a facet at the start of the
   move. The shard is displaced, turned, sheared and scaled about its own
   centroid, so the content on show is the clip run back through the inverse
   of that — anything cruder either drops fragments mid-flight or gives up the
   culling by padding for the worst case. */
function sourceSpan(tri, cx, cy, tx, ty, rot, skew, scale) {
  const r = (rot * Math.PI) / 180;
  const k = Math.tan((skew * Math.PI) / 180);
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  const a = scale * cos;
  const b = scale * (cos * k - sin);
  const c = scale * sin;
  const d = scale * (sin * k + cos);
  const det = a * d - b * c;

  let lo = Infinity;
  let hi = -Infinity;
  for (const p of tri) {
    const px = p.x - cx - tx;
    const py = p.y - cy - ty;
    const qx = cx + (d * px - b * py) / det;
    lo = Math.min(lo, qx);
    hi = Math.max(hi, qx);
  }
  return [lo, hi];
}

function buildFacets() {
  /* The shared grid works in the unit square; scale it onto the band. */
  const scaled = buildFacetGrid({ cols: COLS, rows: ROWS }).map((facet) => ({
    points: facet.points.map((p) => ({
      x: p.x * VIEW_W,
      y: BAND_TOP + p.y * BAND_H,
    })),
  }));

  return scaled.map(({ points: tri }, k) => {
    const cx = (tri[0].x + tri[1].x + tri[2].x) / 3;
    const cy = (tri[0].y + tri[1].y + tri[2].y) / 3;
    const r1 = rnd(k * 7.3 + 1);
    const r2 = rnd(k * 3.1 + 5);
    const r3 = rnd(k * 11.7 + 2);
    const r4 = rnd(k * 5.5 + 9);
    const r5 = rnd(k * 17.9 + 4);
    const r6 = rnd(k * 23.3 + 6);
    const away = cx < M_CENTRE ? -1 : 1;

    const tx = away * (PUSH_MIN + r1 * PUSH_RANGE);
    const ty = (r2 - 0.5) * LIFT;
    const rot = (r3 - 0.5) * TURN;
    const skew = (r5 - 0.5) * SKEW;
    const scale = SCALE_MIN + r4 * SCALE_RANGE;

    /* Union of what the facet frames at the start of the move and at rest;
       the shard travels between the two, and CULL_PAD absorbs the swing. */
    const [sLo, sHi] = sourceSpan(tri, cx, cy, tx, ty, rot, skew, scale);
    const lo = Math.min(sLo, Math.min(...tri.map((p) => p.x))) - CULL_PAD;
    const hi = Math.max(sHi, Math.max(...tri.map((p) => p.x))) + CULL_PAD;

    return {
      points: tri
        .map((p) => bleedVertex(p, cx, cy, 0.9))
        .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(" "),
      glyphs: LETTER_X.flatMap(([a, b], gi) =>
        b >= lo && a <= hi ? [gi] : [],
      ),
      cx,
      cy,
      tx,
      ty,
      rot,
      skew,
      scale,
      duration: DUR_MIN + r6 * DUR_RANGE,
      delay:
        (Math.abs(cx - M_CENTRE) / (VIEW_W - M_CENTRE)) * SPREAD + r1 * 120,
    };
  });
}

export const FACETS = buildFacets();

/* How long the whole wordmark takes, so callers can queue behind it instead
   of guessing. Guessing is how the navigation ended up arriving 400ms before
   the last facets had landed. */
export const WORDMARK_RUNS = Math.max(
  ...FACETS.map((f) => f.delay + f.duration),
);
