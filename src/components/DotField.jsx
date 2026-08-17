import { useEffect, useRef } from "react";

/* A fixed lattice of dots that only shows where the pointer is.

   The dots are a repeating background, so their positions and spacing are
   set once and never move — nothing is laid out per dot and there is no
   per-dot work on pointer move. What follows the cursor is a mask: opaque at
   the pointer and fading to nothing by its outer edge, which is what makes
   the near ones read as lit and the far ones fall away.

   That leaves two custom properties to update per frame instead of hundreds
   of elements. */
export default function DotField({ on = false, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!on) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    let frame = 0;
    let x = 0;
    let y = 0;

    const move = (e) => {
      const box = el.getBoundingClientRect();
      x = e.clientX - box.left;
      y = e.clientY - box.top;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        el.style.setProperty("--mx", `${x}px`);
        el.style.setProperty("--my", `${y}px`);
      });
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [on]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`dot-field${on ? " is-on" : ""} ${className}`}
    />
  );
}
