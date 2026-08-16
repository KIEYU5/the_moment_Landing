import Faceted from "./Faceted";
import Reveal from "./Reveal";

/* One row filling the width, cards sitting on a common baseline. Heights
   differ so the bottom edge is the thing that lines up. */
const PROJECTS = [
  { label: "main project dg", explain: "EXPLAIN", height: "h-[420px] lg:h-[620px]" },
  { label: "sub project hg", explain: "EXPLAIN", height: "h-[300px] lg:h-[440px]" },
  { label: "sub project rg", explain: "EXPLAIN", height: "h-[300px] lg:h-[500px]" },
  { label: "sub project eg", explain: "EXPLAIN", height: "h-[300px] lg:h-[460px]" },
];

const cardClass =
  "group flex flex-col justify-between bg-[#d9d9d9] p-4 sm:p-6 h-full " +
  "transition-transform duration-700 ease-out hover:-translate-y-2";

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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
          {PROJECTS.map((p, i) => (
            <Reveal
              key={p.label}
              delay={i * 120}
              className={`w-full ${p.height}`}
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
