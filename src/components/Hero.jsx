import Brush from "./Brush";
import Reveal from "./Reveal";
import Wordmark from "./Wordmark";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "SERVICE", href: "#service" },
  { label: "Contact", href: "#contact" },
];

/* Intro timeline: nav drops in, "THE" rises, the blue M is painted stroke by
   stroke, and "OMENT" lands as the last brush stroke sweeps down. */
const NAV_STEP = 60;
const BRUSH_DELAY = 520;
const LETTER_DELAYS = [260, 320, 380, 1240, 1300, 1360, 1420, 1480];

export default function Hero() {
  return (
    <section className="relative w-full max-w-[1440px] mx-auto aspect-[1440/810] overflow-hidden bg-white">
      <nav className="absolute top-[2.5%] left-1/2 -translate-x-1/2 flex items-center gap-[clamp(16px,3.3vw,48px)] whitespace-nowrap">
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

      <div className="absolute left-0 top-[76.5%] w-full h-[19.6%]">
        <Wordmark delays={LETTER_DELAYS} />
      </div>

      <Brush
        delay={BRUSH_DELAY}
        className="absolute left-[30.5%] top-[73.9%] w-[15.1%] h-[25.8%]"
      />
    </section>
  );
}
