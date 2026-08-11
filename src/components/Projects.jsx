import Reveal from "./Reveal";

const SUB_PROJECTS = [
  { label: "sub project hg", explain: "EXPLAIN" },
  { label: "sub project rg", explain: "EXPLAIN" },
  { label: "sub project eg", explain: "EXPLAIN" },
];

const cardClass =
  "group flex flex-col justify-between bg-[#d9d9d9] p-4 sm:p-6 " +
  "transition duration-500 ease-out hover:-translate-y-2 " +
  "hover:shadow-[0_24px_48px_-24px_rgba(41,43,47,0.45)]";

export default function Projects() {
  return (
    <section id="work" className="relative bg-white w-full scroll-mt-16">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-20 lg:py-[160px]">
        <Reveal
          as="h2"
          className="font-bold text-[#292b2f] text-[clamp(28px,4.4vw,64px)] mb-10 sm:mb-16 lg:mb-[140px]"
        >
          Our <span className="text-[#4a80f8]">Project</span>
        </Reveal>

        <div className="flex flex-col md:flex-row gap-5">
          <Reveal className="w-full md:w-[29.7%] md:shrink-0">
            <div className={`${cardClass} h-[420px] md:h-[733px]`}>
              <p className="font-bold text-black text-[26px] sm:text-[32px] lg:text-[36px] transition-colors duration-500 group-hover:text-[#4a80f8]">
                TITLE
              </p>
              <p className="font-bold text-black text-[20px]">main project dg</p>
              <p className="font-semibold text-[#555962] text-[16px]">EXPLAIN</p>
            </div>
          </Reveal>

          <div className="flex flex-col md:flex-row gap-5 flex-1 min-w-0">
            {SUB_PROJECTS.map((p, i) => (
              <Reveal
                key={p.label}
                delay={140 + i * 120}
                className="w-full md:flex-1 md:min-w-0"
              >
                <div className={`${cardClass} h-[280px] md:h-[398px]`}>
                  <p className="font-bold text-black text-[26px] sm:text-[32px] lg:text-[36px] transition-colors duration-500 group-hover:text-[#4a80f8]">
                    TITLE
                  </p>
                  <p className="font-bold text-black text-[20px]">{p.label}</p>
                  <p className="font-semibold text-[#555962] text-[16px]">
                    {p.explain}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
