import Faceted from "./Faceted";
import Reveal from "./Reveal";

/* Laid out as fragments rather than a tidy row: spans, starts and offsets
   differ per card so the grid reads as something broken apart and left where
   it fell. Collapses to a plain stack below lg, where a scattered grid would
   only be a scroll. */
const PROJECTS = [
  {
    label: "main project dg",
    explain: "EXPLAIN",
    place: "lg:col-span-7",
    height: "h-[420px] lg:h-[620px]",
    offset: "",
  },
  {
    label: "sub project hg",
    explain: "EXPLAIN",
    place: "lg:col-span-4 lg:col-start-9",
    height: "h-[300px] lg:h-[380px]",
    offset: "lg:mt-[112px]",
  },
  {
    label: "sub project rg",
    explain: "EXPLAIN",
    place: "lg:col-span-5 lg:col-start-2",
    height: "h-[300px] lg:h-[360px]",
    offset: "lg:mt-[64px]",
  },
  {
    label: "sub project eg",
    explain: "EXPLAIN",
    place: "lg:col-span-5 lg:col-start-8",
    height: "h-[300px] lg:h-[440px]",
    offset: "lg:-mt-[56px]",
  },
];

const cardClass =
  "group flex flex-col justify-between bg-[#d9d9d9] p-4 sm:p-6 h-full " +
  "transition duration-700 ease-out hover:-translate-y-2 " +
  "hover:shadow-[0_24px_48px_-24px_rgba(41,43,47,0.45)]";

export default function Projects() {
  return (
    <section id="work" className="relative bg-white w-full">
      <div className="px-gutter py-section">
        <Faceted
          as="h2"
          className="font-bold text-[#292b2f] text-display mb-block"
        >
          Our <span className="text-[#4a80f8]">Project</span>
        </Faceted>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {PROJECTS.map((p, i) => (
            <Reveal
              key={p.label}
              delay={i * 120}
              className={`w-full ${p.place} ${p.offset} ${p.height}`}
            >
              <div className={cardClass}>
                <Faceted
                  as="p"
                  delay={i * 120 + 80}
                  className="font-bold text-black text-title"
                >
                  TITLE
                </Faceted>
                <Faceted
                  as="p"
                  density="wide"
                  delay={i * 120 + 200}
                  className="font-bold text-black text-label"
                >
                  {p.label}
                </Faceted>
                <Faceted
                  as="p"
                  density="coarse"
                  delay={i * 120 + 300}
                  className="font-semibold text-[#555962] text-body"
                >
                  {p.explain}
                </Faceted>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
