import { useEffect, useState } from "react";
import Brush from "./Brush";
import DotField from "./DotField";
import Reveal from "./Reveal";
import Wordmark from "./Wordmark";
import useInView from "../hooks/useInView";
import { BEAT, HERO } from "../lib/timing";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "SERVICE", href: "#service" },
  { label: "Contact", href: "#contact" },
];

/* The hero runs as a chain, each phase waiting on the one before it:

     mark    the M is painted while the wordmark gathers out of its facets —
             one phase, one cue, not two animations sharing a screen
     nav     the links arrive once the mark has settled
     invert  ink and paper trade places
     dots    the lattice comes up under the pointer

   Lengths live in lib/timing.js and are asked of the components that own
   them, so retiming the wordmark moves everything after it.

   The hero holds the full viewport so nothing below it shows on first paint.
   The wordmark keeps its own 1440:159 ratio and sits on the bottom edge
   rather than at a percentage of the hero height — tying it to the height
   would stretch the letterforms as the viewport gets taller.

   Everything around it is expressed as a percentage of width, which is what
   padding percentages resolve against, so the whole group scales as one no
   matter how tall the screen is. The brush offsets are the Figma values
   (left 30.5% / top 73.9% / w 15.1% / h 25.8% of a 1440x810 frame)
   re-based onto the wordmark box: pb-[2.19%] below the mark, and a brush that
   overhangs it by -13.25% on top at 131.4% of its height. */

export default function Hero() {
  const [ref, inView] = useInView({ threshold: 0, rootMargin: "0px" });
  const [inverted, setInverted] = useState(false);
  const [dots, setDots] = useState(false);

  useEffect(() => {
    if (!inView) {
      setInverted(false);
      setDots(false);
      return undefined;
    }
    const a = setTimeout(() => setInverted(true), HERO.invert);
    const b = setTimeout(() => setDots(true), HERO.dots);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [inView]);

  return (
    <section
      ref={ref}
      className={`hero relative w-full min-h-dvh flex flex-col overflow-hidden${
        inverted ? " is-inverted" : ""
      }`}
    >
      <DotField on={dots} />

      <nav className="relative shrink-0 flex items-center justify-center gap-[clamp(20px,3.6vw,56px)] whitespace-nowrap pt-5 sm:pt-6">
        {NAV_LINKS.map((link, i) => (
          <Reveal key={link.label} delay={HERO.nav + i * BEAT}>
            <a
              href={link.href}
              className="text-[var(--hero-ink)] text-[clamp(14px,1.5vw,20px)] font-light transition-colors duration-500 ease-out hover:text-[#4a80f8]"
            >
              {link.label}
            </a>
          </Reveal>
        ))}
      </nav>

      <div className="relative mt-auto w-full pb-[2.19%]">
        <div className="relative w-full aspect-[1440/159]">
          <Wordmark delay={HERO.mark} />
          <Brush
            delay={HERO.mark}
            className="absolute left-[30.5%] top-[-13.25%] w-[15.1%] h-[131.4%]"
          />
        </div>
      </div>
    </section>
  );
}
