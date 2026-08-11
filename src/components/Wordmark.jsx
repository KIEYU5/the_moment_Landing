import { useId } from "react";
import useInView from "../hooks/useInView";

/* "THE MOMENT" minus the M — the M is the blue brush stroke drawn by the
   Union logo, which sits in the gap between "THE" and "OMENT". Paths are
   inlined rather than loaded as an <img> so the wordmark can be cut up. */
const LETTERS = [
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
const SPREAD = 560;

function rnd(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function buildFacets() {
  const cw = VIEW_W / COLS;
  const ch = BAND_H / ROWS;

  const grid = [];
  for (let j = 0; j <= ROWS; j++) {
    grid[j] = [];
    for (let i = 0; i <= COLS; i++) {
      const onEdgeX = i === 0 || i === COLS;
      const onEdgeY = j === 0 || j === ROWS;
      grid[j][i] = {
        x: i * cw + (onEdgeX ? 0 : (rnd(i * 31 + j * 7) - 0.5) * cw * 0.55),
        y:
          BAND_TOP +
          j * ch +
          (onEdgeY ? 0 : (rnd(i * 13 + j * 71) - 0.5) * ch * 0.55),
      };
    }
  }

  const triangles = [];
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const a = grid[j][i];
      const b = grid[j][i + 1];
      const c = grid[j + 1][i + 1];
      const d = grid[j + 1][i];
      // alternate the split so the facets do not all lean the same way
      const pair =
        (i + j) % 2 === 0
          ? [
              [a, b, c],
              [a, c, d],
            ]
          : [
              [a, b, d],
              [b, c, d],
            ];
      triangles.push(...pair);
    }
  }

  /* Neighbouring clips share an edge, and two antialiased edges butted
     together leave a hairline of background showing. Push every vertex a
     little away from its centroid so the facets overlap instead; in the
     resolved state they carry identical content, so overlap is invisible. */
  const bleed = (p, cx, cy) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: p.x + (dx / len) * 0.9, y: p.y + (dy / len) * 0.9 };
  };

  return triangles.map((tri, k) => {
    const cx = (tri[0].x + tri[1].x + tri[2].x) / 3;
    const cy = (tri[0].y + tri[1].y + tri[2].y) / 3;
    const r1 = rnd(k * 7.3 + 1);
    const r2 = rnd(k * 3.1 + 5);
    const r3 = rnd(k * 11.7 + 2);
    const r4 = rnd(k * 5.5 + 9);
    const away = cx < M_CENTRE ? -1 : 1;
    const tx = away * (24 + r1 * 68);

    /* Which glyphs can show through this facet at any point in the move.
       The content slides from tx back to 0, so take the union of both ends
       and pad for the rotation and scale swing. */
    const x0 = Math.min(...tri.map((p) => p.x));
    const x1 = Math.max(...tri.map((p) => p.x));
    const lo = Math.min(x0 - tx, x0) - 45;
    const hi = Math.max(x1 - tx, x1) + 45;

    return {
      points: tri
        .map((p) => bleed(p, cx, cy))
        .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(" "),
      glyphs: LETTER_X.flatMap(([a, b], gi) =>
        b >= lo && a <= hi ? [gi] : [],
      ),
      cx,
      cy,
      tx,
      ty: (r2 - 0.5) * 52,
      rot: (r3 - 0.5) * 18,
      scale: 0.9 + r4 * 0.26,
      delay:
        (Math.abs(cx - M_CENTRE) / (VIEW_W - M_CENTRE)) * SPREAD + r1 * 70,
    };
  });
}

const FACETS = buildFacets();

export default function Wordmark({ delay = 0, className = "" }) {
  const [ref, inView] = useInView({ threshold: 0, rootMargin: "0px" });
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const glyphsId = `wordmark-glyphs-${uid}`;

  return (
    <svg
      ref={ref}
      role="img"
      aria-label="THE MOMENT"
      preserveAspectRatio="none"
      overflow="visible"
      viewBox="0 0 1440 159"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`block w-full h-full ${className}`}
    >
      <defs>
        {LETTERS.map((d, i) => (
          <path key={i} id={`${glyphsId}-g${i}`} d={d} fill="#292b2f" />
        ))}

        {FACETS.map((facet, i) => (
          <clipPath key={i} id={`${glyphsId}-f${i}`}>
            <polygon points={facet.points} />
          </clipPath>
        ))}
      </defs>

      {FACETS.map((facet, i) => (
        <g key={i} clipPath={`url(#${glyphsId}-f${i})`}>
          <g
            className={`facet${inView ? " is-in" : ""}`}
            style={{
              transformOrigin: `${facet.cx.toFixed(1)}px ${facet.cy.toFixed(1)}px`,
              transitionDelay: `${(delay + facet.delay).toFixed(0)}ms`,
              "--fx": `${facet.tx.toFixed(1)}px`,
              "--fy": `${facet.ty.toFixed(1)}px`,
              "--fr": `${facet.rot.toFixed(2)}deg`,
              "--fs": facet.scale.toFixed(3),
            }}
          >
            {facet.glyphs.map((gi) => (
              <use key={gi} href={`#${glyphsId}-g${gi}`} />
            ))}
          </g>
        </g>
      ))}
    </svg>
  );
}
