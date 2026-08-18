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
    detail:
      "DETAIL — 프로젝트 상세 설명이 들어갈 자리입니다. 무엇을 만들었고, 어떤 문제를 풀었는지.",
  },
  {
    label: "sub project hg",
    explain: "EXPLAIN",
    detail: "DETAIL — 상세 설명이 들어갈 자리입니다.",
    banner: hgBanner,
  },
  {
    label: "sub project rg",
    explain: "EXPLAIN",
    detail: "DETAIL — 상세 설명이 들어갈 자리입니다.",
    banner: rgBanner,
  },
  {
    label: "sub project eg",
    explain: "EXPLAIN",
    detail: "DETAIL — 상세 설명이 들어갈 자리입니다.",
    banner: egBanner,
  },
];

/* The banners are 2300x1000 — 3312x1440 reduced to the ratio it keeps, so an
   open card is that ratio exactly and the artwork lands uncropped.

   They arrived as SVG, but only as wrappers: six or seven PNG and JPEG
   payloads embedded per file, 32.1MB across the three. Nothing in them was
   vector, so every frame was paying to re-rasterise artwork that was already
   raster. Baked to WebP at the size they are actually shown, the same three
   are 216KB. Height comes from container query units rather
   than from the viewport: the card is inset by the section gutters and the
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
                      <img
                        src={p.banner}
                        alt=""
                        aria-hidden
                        /* object-top, so a shut card shows the head of the
                           banner rather than a band from its middle. Open,
                           the card carries the banner's own ratio and there
                           is nothing to position.

                           The scale is what keeps the blur honest: a blur
                           samples past the element's edge, and with nothing
                           there the border fades out. Oversizing by a few
                           percent puts image under the sampled area. */
                        className={`absolute inset-0 w-full h-full object-cover object-top select-none pointer-events-none transition-[filter,transform] duration-700 ease-out ${
                          isOpen ? "" : "blur-[7px] scale-[1.06]"
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
                      card without one would open onto nothing.

                      It stays in the accessibility tree either way, so the
                      detail is never something only a mouse can reach. */}
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
                    <p className="font-normal text-[#555962] text-body max-w-[720px]">
                      {p.detail}
                    </p>
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
