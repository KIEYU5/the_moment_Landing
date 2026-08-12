import Reveal from "./Reveal";

const WORDS = [
  "BREAKTHROUGH",
  "PROGRESS",
  "ADVANCEMENT",
  "EVOLUTION",
  "TRANSFORMATION",
  "REINVENTION",
  "CREATIVITY",
  "INGENUITY",
  "INVENTION",
  "DISRUPTION",
];

const VALUES = [
  {
    num: "1.",
    tag: "Professional",
    title:
      "We are the experts who lead our field — driven by relentless learning, sharpening our craft, and raising the standard of what's possible.",
    sub: "끊임없이 배우고 역량을 키우며, 각자의 분야에서 최고가 되는 사람들.",
  },
  {
    num: "2.",
    tag: "Communication",
    title:
      "We are collaborators who move as one — grounded in openness and trust, we respect one another and grow together.",
    sub: "열린 태도와 신뢰를 바탕으로, 서로를 존중하며 함께 나아가는 사람들.",
  },
  {
    num: "3.",
    tag: "Passion",
    title:
      "We are challengers who thrive on ambition — with creative thinking, we embrace change and never fear failure.",
    sub: "창의적인 사고로 변화에 앞장서고, 실패를 두려워하지 않는 열정적인 사람들.",
  },
];

/* Each track holds the word list twice so the -50% marquee loops seamlessly;
   two tracks side by side keep the strip filled at any viewport width. */
function Ticker({ color, className = "" }) {
  return (
    <div
      aria-hidden
      className={`flex whitespace-nowrap overflow-hidden ${className}`}
    >
      {[0, 1].map((track) => (
        <div
          key={track}
          className="flex gap-[clamp(32px,5vw,72px)] pr-[clamp(32px,5vw,72px)] animate-marquee shrink-0"
        >
          {[...WORDS, ...WORDS].map((word, i) => (
            <p
              key={i}
              className="font-bold text-display shrink-0"
              style={{ color }}
            >
              {word}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Values() {
  return (
    <section
      id="service"
      className="relative bg-white w-full overflow-hidden scroll-mt-16"
    >
      <div className="max-w-[1440px] mx-auto px-10 py-16 sm:py-20 lg:pb-[120px]">
        <div className="marquee relative h-[clamp(48px,8.7vw,125px)]">
          <Ticker color="#292b2f" className="absolute top-0 left-0 w-full" />
          <Ticker
            color="#e9e9e9"
            className="absolute top-[36%] left-0 w-full"
          />
        </div>

        <div className="mt-16 sm:mt-20 lg:mt-[100px] flex flex-col items-stretch lg:items-end gap-14 sm:gap-16 lg:gap-[160px]">
          {VALUES.map((v) => (
            <div
              key={v.num}
              className="w-full max-w-[1280px] flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-8"
            >
              <Reveal
                as="p"
                variant="reveal-left"
                className="font-bold text-[#4a80f8] text-label shrink-0"
              >
                {v.tag}
              </Reveal>
              <div className="flex gap-5 sm:gap-8 lg:gap-12 items-start w-full lg:w-auto">
                <Reveal
                  as="p"
                  variant="reveal-scale"
                  delay={120}
                  className="font-bold text-[#e9e9e9] text-title shrink-0"
                >
                  {v.num}
                </Reveal>
                <div className="flex flex-col gap-5 sm:gap-8 lg:gap-12 min-w-0">
                  <Reveal
                    as="p"
                    delay={200}
                    className="font-bold text-[#292b2f] text-lead max-w-[688px]"
                  >
                    {v.title}
                  </Reveal>
                  <Reveal
                    as="p"
                    delay={320}
                    className="font-semibold text-[#555962] text-body"
                  >
                    {v.sub}
                  </Reveal>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
