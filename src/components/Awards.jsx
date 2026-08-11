const AWARDS = Array.from({ length: 7 }, () => ({
  title: "TITLE",
  subtitle: "SUBTITLE",
  explain: "EXPLAIN",
}));

export default function Awards() {
  return (
    <section className="relative bg-white w-full">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-20 lg:py-[160px]">
        <h2 className="font-bold text-[#292b2f] text-[clamp(28px,4.4vw,64px)] mb-10 sm:mb-16 lg:mb-[186px]">
          Our <span className="text-[#4a80f8]">Awards</span>
        </h2>

        <div className="flex flex-col gap-6 sm:gap-8 lg:gap-12 max-w-[660px] lg:ml-auto">
          {AWARDS.map((a, i) => (
            <div
              key={i}
              className="grid grid-cols-3 items-center gap-3 sm:gap-4 text-[13px] sm:text-[16px]"
            >
              <p className="font-bold text-[#292b2f]">{a.title}</p>
              <p className="font-normal text-[#555962] leading-[24px] text-center">
                {a.subtitle}
              </p>
              <p className="font-normal text-[#555962] leading-[24px] text-right">
                {a.explain}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
