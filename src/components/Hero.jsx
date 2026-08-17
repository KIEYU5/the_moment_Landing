import Brush from "./Brush";
import Reveal from "./Reveal";
import Wordmark from "./Wordmark";
import { BRUSH_RUNS } from "../lib/brush";
import { WORDMARK_RUNS } from "../lib/wordmark";
import { BEAT, HERO_MARK } from "../lib/timing";

/* Whichever of the two finishes last is when the mark is done. */
const NAV_DELAY = HERO_MARK + Math.max(BRUSH_RUNS, WORDMARK_RUNS);

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "SERVICE", href: "#service" },
  { label: "Contact", href: "#contact" },
];

/* The M and the wordmark are one event, not two: both start on HERO_MARK, so
   the letters gather out of their facets while the stroke is being painted
   through the gap they leave. They used to run on separate cues a second
   apart, which read as two unrelated animations sharing a screen.

   The navigation waits until that has finished and arrives last.

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
  return (
    <section className="relative w-full min-h-dvh flex flex-col overflow-hidden bg-white">
      <nav className="shrink-0 flex items-center justify-center gap-[clamp(20px,3.6vw,56px)] whitespace-nowrap pt-5 sm:pt-6">
        {NAV_LINKS.map((link, i) => (
          <Reveal key={link.label} delay={NAV_DELAY + i * BEAT}>
            <a
              href={link.href}
              className="text-[#292b2f] text-[clamp(14px,1.5vw,20px)] font-light transition-colors duration-500 ease-out hover:text-[#4a80f8]"
            >
              {link.label}
            </a>
          </Reveal>
        ))}
      </nav>

      <div className="mt-auto w-full pb-[2.19%]">
        <div className="relative w-full aspect-[1440/159]">
          <Wordmark delay={HERO_MARK} />
          <Brush
            delay={HERO_MARK}
            className="absolute left-[30.5%] top-[-13.25%] w-[15.1%] h-[131.4%]"
          />
        </div>
      </div>
    </section>
  );
}
