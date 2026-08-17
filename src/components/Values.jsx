import Faceted from "./Faceted";
import { beat } from "../lib/timing";

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

/* The lower row starts halfway through the list. Both rows carry the same
   words, so running them from the same index stacks identical words in
   columns; rotating one breaks that up since the lengths no longer match. */
const WORDS_OFFSET = [...WORDS.slice(5), ...WORDS.slice(0, 5)];

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
function Ticker({ color, words = WORDS, reverse = false, className = "" }) {
  const track = reverse ? "animate-marquee-reverse" : "animate-marquee";

  return (
    <div
      aria-hidden
      className={`flex whitespace-nowrap overflow-hidden ${className}`}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          className={`flex gap-[clamp(32px,5vw,72px)] pr-[clamp(32px,5vw,72px)] ${track} shrink-0`}
        >
          {[...words, ...words].map((word, j) => (
            <p
              key={j}
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
      className="relative bg-white w-full overflow-hidden"
    >
      <div className="px-gutter py-section">
        {/* Stacked in flow rather than absolutely positioned — the rows are
            as tall as text-display, so overlapping offsets collided. */}
        <div className="flex flex-col gap-6">
          <Ticker color="#555962" className="w-full" />
          <Ticker
            color="#d9d9d9"
            words={WORDS_OFFSET}
            reverse
            className="w-full"
          />
        </div>

        <div className="mt-block flex flex-col gap-block">
          {VALUES.map((v) => (
            <div
              key={v.num}
              className="w-full flex flex-col lg:flex-row items-start justify-between gap-stack"
            >
              <Faceted
                as="p"
                density="wide"
                className="font-bold text-[#4a80f8] text-lead shrink-0"
              >
                {v.tag}
              </Faceted>
              <div className="flex gap-stack items-start w-full lg:w-auto">
                <Faceted
                  as="p"
                  density="coarse"
                  delay={beat(1)}
                  className="font-bold text-[#e9e9e9] text-title shrink-0"
                >
                  {v.num}
                </Faceted>
                <div className="flex flex-col gap-stack min-w-0">
                  <Faceted
                    as="p"
                    delay={beat(2)}
                    className="font-bold text-[#292b2f] text-lead max-w-[688px]"
                  >
                    {v.title}
                  </Faceted>
                  <Faceted
                    as="p"
                    density="coarse"
                    delay={beat(3)}
                    className="font-semibold text-[#555962] text-body"
                  >
                    {v.sub}
                  </Faceted>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
