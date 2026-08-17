import { useId } from "react";
import unionLogo from "../assets/union-logo.svg";
import useInView from "../hooks/useInView";
import { STROKES } from "../lib/brush";

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
                    /* Timing applies while painting on only. Dropping it on
                       the way out makes the rearm instant, so scrolling back
                       never catches the strokes un-painting themselves. */
                    transitionDelay: inView
                      ? `${delay + stroke.delay}ms`
                      : "0ms",
                    transitionDuration: inView
                      ? `${stroke.duration}ms`
                      : "0ms",
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
