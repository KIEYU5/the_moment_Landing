import Faceted from "./Faceted";
import Reveal from "./Reveal";
import { GROUP, beat } from "../lib/timing";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "Instagram", href: "#" },
];

const LEGAL_LINKS = [{ label: "Privacy Policy", href: "#" }];

/* Ink on the blue field — hovering to the brand colour would be invisible
   here, since the brand colour is the background. */
const linkClass =
  "font-bold text-white text-label transition-colors duration-500 ease-out hover:text-[#292b2f]";

/* Split into two colour fields rather than one flat band: the identity sits
   in ink, the navigation in the brand blue, and the seam between them runs
   the height of the footer. */
export default function Footer() {
  return (
    <footer className="relative w-full flex flex-col lg:flex-row">
      <div className="flex-1 bg-[#292b2f] px-gutter py-section">
        <Faceted as="p" className="font-bold text-white text-title">
          THE MOMENT
        </Faceted>
        <Faceted
          as="p"
          density="coarse"
          delay={beat(1)}
          className="font-bold text-[#9aa0ab] text-subtitle mt-4"
        >
          A development partner innovating the moment.
        </Faceted>
        <Faceted
          as="p"
          density="wide"
          delay={beat(2)}
          className="font-normal text-[#767c87] text-caption mt-block"
        >
          © 2026 the_moment. All rights reserved.
        </Faceted>
      </div>

      <Reveal
        delay={GROUP}
        className="lg:w-[38%] bg-[#4a80f8] px-gutter py-section flex gap-block"
      >
        <div className="flex flex-col gap-stack">
          <Faceted
            as="p"
            density="wide"
            className="font-normal text-[#cfdcff] text-caption"
          >
            SOCIAL
          </Faceted>
          <div className="flex flex-col gap-stack">
            {SOCIAL_LINKS.map((link, i) => (
              <a
                key={i}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className={linkClass}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-stack">
          <Faceted
            as="p"
            density="wide"
            className="font-normal text-[#cfdcff] text-caption"
          >
            LEGAL
          </Faceted>
          <div className="flex flex-col gap-stack">
            {LEGAL_LINKS.map((link) => (
              <a key={link.label} href={link.href} className={linkClass}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
