import Brush from "./Brush";
import Reveal from "./Reveal";
import Wordmark from "./Wordmark";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "SERVICE", href: "#service" },
  { label: "Contact", href: "#contact" },
];

/* Intro timeline, in ms. The blue M is painted stroke by stroke — the stone
   is cut — and the wordmark then resolves out of its own facets, starting at
   the M and working outward. Wordmark spreads its facet delays internally. */
const NAV_STEP = 60;
const BRUSH_DELAY = 300;
const WORDMARK_DELAY = 1150;

/* The hero holds the full viewport so nothing below it shows on first paint.
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
      <nav className="shrink-0 flex items-center justify-center gap-[clamp(16px,3.3vw,48px)] whitespace-nowrap pt-5 sm:pt-6">
        {NAV_LINKS.map((link, i) => (
          <Reveal key={link.label} delay={i * NAV_STEP}>
            <a
              href={link.href}
              className="text-[#292b2f] text-[clamp(10px,1.1vw,16px)] font-light transition-colors duration-300 hover:text-[#4a80f8]"
            >
              {link.label}
            </a>
          </Reveal>
        ))}
      </nav>

      <div className="mt-auto w-full pb-[2.19%]">
        <div className="relative w-full aspect-[1440/159]">
          <Wordmark delay={WORDMARK_DELAY} />
          <Brush
            delay={BRUSH_DELAY}
            className="absolute left-[30.5%] top-[-13.25%] w-[15.1%] h-[131.4%]"
          />
        </div>
      </div>
    </section>
  );
}
