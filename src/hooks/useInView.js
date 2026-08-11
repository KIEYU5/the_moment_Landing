import { useEffect, useRef, useState } from "react";

/* threshold stays at 0 on purpose: an element taller than the viewport can
   never reach a fractional threshold, so the reveal would never fire. The
   negative bottom margin is what holds the reveal back until the element has
   actually risen into the page. */
export default function useInView({
  threshold = 0,
  rootMargin = "0px 0px -12% 0px",
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
        if (!entry.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView];
}
