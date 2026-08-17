import { useState } from "react";
import DotField from "./DotField";
import Faceted from "./Faceted";
import Reveal from "./Reveal";
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
  },
  {
    label: "sub project rg",
    explain: "EXPLAIN",
    detail: "DETAIL — 상세 설명이 들어갈 자리입니다.",
  },
  {
    label: "sub project eg",
    explain: "EXPLAIN",
    detail: "DETAIL — 상세 설명이 들어갈 자리입니다.",
  },
];

const OPEN_HEIGHT = "h-[420px] lg:h-[520px]";
const SHUT_HEIGHT = "h-[150px] lg:h-[170px]";

const cardClass =
  "flex flex-col items-start gap-3 bg-[#d9d9d9] p-6 sm:p-8 w-full " +
  "overflow-hidden cursor-pointer outline-none " +
  "transition-[height] duration-700 ease-out " +
  "focus-visible:ring-2 focus-visible:ring-[#4a80f8] focus-visible:ring-offset-2";

export default function Projects() {
  const [open, setOpen] = useState(0);

  return (
    <section id="work" className="relative bg-white w-full overflow-hidden">
      <DotField bare on />
      <div className="relative px-gutter py-section">
        <Faceted
          as="h2"
          className="font-bold text-[#292b2f] text-display mb-block"
        >
          Our <span className="text-[#4a80f8]">Project</span>
        </Faceted>

        <div className="flex flex-col gap-5">
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

                  {/* Left in the accessibility tree whether open or not, so
                      the detail is never something only a mouse can reach. */}
                  <p
                    className={`font-normal text-[#555962] text-body max-w-[720px] transition-opacity duration-500 ease-out ${
                      isOpen ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {p.detail}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
