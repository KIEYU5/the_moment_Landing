import { useId } from "react";
import unionLogo from "../assets/union-logo.svg";
import useInView from "../hooks/useInView";

/* The blue M of "THE MOMENT" is a painted brush mark. Rather than wiping it
   in with a rectangle, the artwork is masked by three thick strokes traced
   along the centre of each gesture — left leg with its tail, the inner V,
   then the right leg — and each is drawn on with stroke-dashoffset so the
   mark appears the way it was painted.

   Coordinates follow the artwork's own 217.825 x 209.331 viewBox. Widths are
   set per stroke so the mask always covers the bristle spread at its widest
   without bleeding into the neighbouring gesture.

   Caps are butt, not round. A round cap puts a half disc of half the stroke
   width ahead of the tip, which reads as a blob leading the brush and reaches
   far enough sideways to pop the artwork's loose spatter flecks into view on
   their own. A flat cap is also simply what the edge of a brush looks like.
   The trailing L segments push each path past the artwork so the flat cap
   still clears the tail once the stroke is fully drawn. */
const STROKES = [
  {
    d: "M106 0 C 106 30 100 55 76 88 C 55 117 28 155 0 185 L -18 204",
    width: 46,
    delay: 0,
    duration: 380,
  },
  {
    d: "M91 61 Q 103 95 115 124 Q 130 95 166 49",
    width: 58,
    delay: 320,
    duration: 400,
  },
  {
    d: "M186 0 C 184 25 172 45 173 76 C 174 110 180 145 206 206 L 216 230",
    width: 62,
    delay: 640,
    duration: 400,
  },
];

export default function Brush({ delay = 0, className = "" }) {
  const [ref, inView] = useInView({ threshold: 0, rootMargin: "0px" });
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const maskId = `brush-mask-${uid}`;
  const blurId = `brush-blur-${uid}`;

  /* The caller sizes and positions the wrapper; the svg only ever fills it.
     Keep those on separate elements -- put w-full next to an arbitrary width
     utility and Tailwind resolves the clash by stylesheet order, not by the
     order written here, so the svg can silently blow up to the full hero. */
  return (
    <div ref={ref} className={className}>
      <svg
        aria-hidden
        viewBox="0 0 217.825 209.331"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block w-full h-full"
      >
        <defs>
          <filter
            id={blurId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="1.2" />
          </filter>

          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x="-60"
            y="-60"
            width="340"
            height="330"
          >
            <g filter={`url(#${blurId})`}>
              {STROKES.map((stroke, i) => (
                <path
                  key={i}
                  d={stroke.d}
                  pathLength="1"
                  fill="none"
                  stroke="#fff"
                  strokeDasharray="1"
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                  className={`brush-stroke${inView ? " is-in" : ""}`}
                  style={{
                    strokeWidth: stroke.width,
                    transitionDelay: `${delay + stroke.delay}ms`,
                    transitionDuration: `${stroke.duration}ms`,
                  }}
                />
              ))}
            </g>
          </mask>
        </defs>

        <image
          href={unionLogo}
          x="0"
          y="0"
          width="217.825"
          height="209.331"
          preserveAspectRatio="none"
          mask={`url(#${maskId})`}
        />
      </svg>
    </div>
  );
}
