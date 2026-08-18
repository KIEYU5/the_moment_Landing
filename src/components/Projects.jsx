import { useState } from "react";
import egBanner from "../assets/EG_Banner.webp";
import hgBanner from "../assets/HG_Banner.webp";
import rgBanner from "../assets/RG_Banner.webp";
import DotField from "./DotField";
import Faceted from "./Faceted";
import Reveal from "./Reveal";
import RevealGroup from "./RevealGroup";
import { BEAT, GROUP, beat } from "../lib/timing";

/* Stacked full-width cards, one open at a time. The main project starts
   open; pointing at another opens it and closes the one before. */
const PROJECTS = [
  {
    label: "main project dg",
    explain: "EXPLAIN",
  },
  {
    label: "sub project hg",
    explain: "EXPLAIN",
    banner: hgBanner,
  },
  {
    label: "sub project rg",
    explain: "EXPLAIN",
    banner: rgBanner,
  },
  {
    label: "sub project eg",
    explain: "EXPLAIN",
    banner: egBanner,
  },
];

/* The banners are 3312x1440, so an open card is that ratio exactly and the
   artwork lands uncropped.

   They first arrived as SVG, but only as wrappers: six or seven PNG and
   JPEG payloads embedded per file, 32.1MB across the three, nothing in them
   vector. They are WebP now, resampled from 9936x4320 masters, and the same
   three come to 569KB.

   Height comes from container query units rather than from the viewport: the card is inset by the section gutters and the
   page may or may not have a scrollbar, so 100vw would be wrong by whatever
   those add up to, while 100cqw is the card's own width. Shut stays a fixed
   height, which is what lets the two interpolate.

   Written out rather than built from a ratio constant: Tailwind scans the
   source as text, so a class assembled by template literal is a class it
   never sees. 2.3 is 3312/1440 exactly. */
const OPEN_HEIGHT = "h-[calc(100cqw/2.3)]";
const SHUT_HEIGHT = "h-[150px] lg:h-[170px]";

const cardClass =
  "relative flex flex-col items-start gap-3 bg-[#d9d9d9] p-6 sm:p-8 w-full " +
  "overflow-hidden cursor-pointer outline-none " +
  "transition-[height] duration-700 ease-out " +
  "focus-visible:ring-2 focus-visible:ring-[#4a80f8] focus-visible:ring-offset-2";

export default function Projects() {
  const [open, setOpen] = useState(0);

  return (
    <section id="work" className="relative bg-white w-full overflow-hidden">
      <DotField bare on />
      <RevealGroup className="relative px-gutter py-section">
        <Faceted
          as="h2"
          className="font-bold text-[#292b2f] text-display mb-block"
        >
          Our <span className="text-[#4a80f8]">Project</span>
        </Faceted>

        {/* The container the cards measure their open height against. */}
        <div className="@container flex flex-col gap-5">
          {PROJECTS.map((p, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={p.label} delay={beat(i, GROUP)} className="w-full">
                <div
                  /* Focus opens it too, so the card is reachable by keyboard,
                     and the tap handler covers touch, where hover never
                     fires. */
                  tabIndex={0}
                  onMouseEnter={() => setOpen(i)}
                  onFocus={() => setOpen(i)}
                  onClick={() => setOpen(i)}
                  className={`${cardClass} ${isOpen ? OPEN_HEIGHT : SHUT_HEIGHT}`}
                >
                  {p.banner ? (
                    <>
                      {/* Two copies of the same file, so nothing ever
                          changes size. The sharp one sits at the card's own
                          bounds and is never transformed; the blurred one
                          lies over it and fades away.

                          A single layer cannot do both jobs. A blur samples
                          past the element's edge, and with nothing out there
                          the border fades out rather than blurring, so the
                          blurred copy has to be oversized — and animating
                          that oversize back to nothing on open is exactly
                          the shrink you can see. Fading a layer that is
                          always 106% leaves the geometry still. */}
                      <img
                        src={p.banner}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 w-full h-full object-cover object-top select-none pointer-events-none"
                      />
                      <img
                        src={p.banner}
                        alt=""
                        aria-hidden
                        className={`absolute inset-0 w-full h-full object-cover object-top select-none pointer-events-none blur-[7px] scale-[1.06] transition-opacity duration-700 ease-out ${
                          isOpen ? "opacity-0" : "opacity-100"
                        }`}
                      />
                      <div
                        aria-hidden
                        className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-700 ease-out ${
                          isOpen ? "opacity-0" : "opacity-40"
                        }`}
                      />
                    </>
                  ) : null}

                  {/* Shut, the card is a label over a muted banner; open, it
                      is the banner. So the text leaves as the card opens —
                      but only where there is artwork to give way to, or a
                      card without one would open onto nothing. It is faded
                      rather than removed, so it stays readable to a screen
                      reader in either state. */}
                  <div
                    className={`relative flex flex-col items-start gap-3 transition-opacity duration-500 ease-out ${
                      p.banner && isOpen ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    <Faceted
                      as="p"
                      delay={beat(i, GROUP)}
                      className="font-bold text-black text-title"
                    >
                      TITLE
                    </Faceted>
                    <Faceted
                      as="p"
                      density="wide"
                      delay={beat(i, GROUP) + BEAT}
                      className="font-bold text-black text-label"
                    >
                      {p.label}
                    </Faceted>
                    <Faceted
                      as="p"
                      density="coarse"
                      delay={beat(i, GROUP) + 2 * BEAT}
                      className="font-semibold text-[#555962] text-body"
                    >
                      {p.explain}
                    </Faceted>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </RevealGroup>
    </section>
  );
}
