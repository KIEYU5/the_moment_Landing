import Reveal from "./Reveal";

const AWARDS = Array.from({ length: 7 }, () => ({
  title: "TITLE",
  subtitle: "SUBTITLE",
  explain: "EXPLAIN",
}));

export default function Awards() {
  return (
    <section id="awards" className="relative bg-white w-full scroll-mt-16">
      <div className="max-w-[1440px] mx-auto px-10 py-16 sm:py-20 lg:py-[160px]">
        <Reveal
          as="h2"
          className="font-bold text-[#292b2f] text-display mb-10 sm:mb-16 lg:mb-[186px]"
        >
          Our <span className="text-[#4a80f8]">Awards</span>
        </Reveal>

        <div className="flex flex-col gap-6 sm:gap-8 lg:gap-12 max-w-[660px] lg:ml-auto">
          {AWARDS.map((a, i) => (
            <Reveal
              key={i}
              variant="reveal-left"
              delay={i * 90}
              className="grid grid-cols-3 items-center gap-3 sm:gap-4 text-body"
            >
              <p className="font-bold text-[#292b2f]">{a.title}</p>
              <p className="font-normal text-[#555962] text-center">
                {a.subtitle}
              </p>
              <p className="font-normal text-[#555962] text-right">
                {a.explain}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
