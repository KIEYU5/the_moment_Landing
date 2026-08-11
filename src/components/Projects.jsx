const SUB_PROJECTS = [
  { label: "sub project hg", explain: "EXPLAIN" },
  { label: "sub project rg", explain: "EXPLAIN" },
  { label: "sub project eg", explain: "EXPLAIN" },
];

export default function Projects() {
  return (
    <section id="work" className="relative bg-white w-full scroll-mt-16">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-20 lg:py-[160px]">
        <h2 className="font-bold text-[#292b2f] text-[clamp(28px,4.4vw,64px)] mb-10 sm:mb-16 lg:mb-[140px]">
          Our <span className="text-[#4a80f8]">Project</span>
        </h2>

        <div className="flex flex-col md:flex-row gap-5">
          <div className="flex flex-col justify-between w-full md:w-[29.7%] md:shrink-0 h-[420px] md:h-[733px] bg-[#d9d9d9] p-4 sm:p-6">
            <p className="font-bold text-black text-[26px] sm:text-[32px] lg:text-[36px]">
              TITLE
            </p>
            <p className="font-bold text-black text-[20px]">main project dg</p>
            <p className="font-semibold text-[#555962] text-[16px]">EXPLAIN</p>
          </div>

          <div className="flex flex-col md:flex-row gap-5 flex-1 min-w-0">
            {SUB_PROJECTS.map((p) => (
              <div
                key={p.label}
                className="flex flex-col justify-between w-full md:flex-1 md:min-w-0 h-[280px] md:h-[398px] bg-[#d9d9d9] p-4 sm:p-6"
              >
                <p className="font-bold text-black text-[26px] sm:text-[32px] lg:text-[36px]">
                  TITLE
                </p>
                <p className="font-bold text-black text-[20px]">{p.label}</p>
                <p className="font-semibold text-[#555962] text-[16px]">
                  {p.explain}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
