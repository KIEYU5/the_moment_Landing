import Faceted from "./Faceted";
import Reveal from "./Reveal";

const AWARDS = Array.from({ length: 7 }, () => ({
  title: "TITLE",
  subtitle: "SUBTITLE",
  explain: "EXPLAIN",
}));

export default function Awards() {
  return (
    <section id="awards" className="relative bg-white w-full">
      <div className="px-gutter py-section">
        <Faceted
          as="h2"
          className="font-bold text-[#292b2f] text-display mb-block"
        >
          Our <span className="text-[#4a80f8]">Awards</span>
        </Faceted>

        {/* Runs the full width as an index rather than a narrow column pinned
            to one side, which left the middle of the page empty. */}
        <div className="border-b border-[#e9e9e9]">
          {AWARDS.map((a, i) => (
            <Reveal key={i} delay={i * 70}>
              <div className="group border-t border-[#e9e9e9] py-stack grid grid-cols-12 gap-4 items-baseline transition-colors duration-700 ease-out hover:border-[#4a80f8]">
                <p className="col-span-12 sm:col-span-5 font-bold text-[#292b2f] text-lead transition-transform duration-700 ease-out group-hover:translate-x-2">
                  {a.title}
                </p>
                <p className="col-span-6 sm:col-span-3 font-normal text-[#555962] text-body">
                  {a.subtitle}
                </p>
                <p className="col-span-6 sm:col-span-4 font-normal text-[#555962] text-body sm:text-right">
                  {a.explain}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
