import { useEffect, useState } from "react";
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
   matter how tall the screen is; pb-[2.19%] is the Figma gap below the mark
   re-based onto the wordmark box.

   The whole opening plays once. Everything else on the page rearms when it
   leaves the screen, but this is the page introducing itself — replaying it
   on the way back up would read as the site restarting, and the inversion
   would have to un-invert to do it. So the hero, its navigation and the
   background all take `once` and the observer stops watching after the
   first pass. */

/* How far the inverted field runs on below the mark, as a share of the
   screen. The section is a viewport plus this: the mark still sits on the
   first screen's bottom edge, and the dark carries past it into the scroll
   rather than stopping dead on the letterforms. */
const TAIL = "10dvh";

export default function Hero() {
  const [ref, inView] = useInView({ threshold: 0, rootMargin: "0px", once: true });
  const [inverted, setInverted] = useState(false);
  const [dots, setDots] = useState(false);

  useEffect(() => {
    if (!inView) return undefined;
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
      style={{ minHeight: `calc(100dvh + ${TAIL})` }}
      className={`hero relative w-full flex flex-col overflow-hidden${
        inverted ? " is-inverted" : ""
      }`}
    >
      <DotField on={dots} />

      <nav className="relative shrink-0 flex items-center justify-center gap-[clamp(20px,3.6vw,56px)] whitespace-nowrap pt-5 sm:pt-6">
        {NAV_LINKS.map((link, i) => (
          <Reveal key={link.label} once delay={HERO.nav + i * BEAT}>
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
          <Wordmark once delay={HERO.mark} />
        </div>
      </div>

      {/* The tail. mt-auto above puts the free space over the mark, so this
          sits under it and holds the mark on the first screen's edge. */}
      <div aria-hidden className="shrink-0" style={{ height: TAIL }} />
    </section>
  );
}
