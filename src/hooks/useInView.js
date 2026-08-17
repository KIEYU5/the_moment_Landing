import { useEffect, useRef, useState } from "react";

/* threshold stays at 0 on purpose: an element taller than the viewport can
   never reach a fractional threshold, so the reveal would never fire. The
   negative bottom margin is what holds the reveal back until the element has
   actually risen into the page.

   `once` is for anything that reads as an opening rather than an entrance:
   it fires on the first intersection and then stops observing, so scrolling
   back up finds it already played instead of starting over. */
export default function useInView({
  threshold = 0,
  rootMargin = "0px 0px -12% 0px",
  once = false,
} = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
          return;
        }
        if (once) return;
        /* Rearm, but only once the element is properly off screen. The
           trigger line sits above the viewport's bottom edge, so resetting
           the moment it stops intersecting would flip the animation on and
           off while a scroll hovers around that line. The reset itself is
           instant — see the transition-duration overrides in index.css — so
           it is never seen running backwards. */
        const box = entry.boundingClientRect;
        if (box.bottom < 0 || box.top > window.innerHeight) setInView(false);
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}
