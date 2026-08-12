import Reveal from "./Reveal";

const PHILOSOPHY = [
  ["우리는 현장에서 답을 찾습니다."],
  ["가장 필요한 곳에, 가장 먼저 도착하는 기술을 만듭니다."],
  ["변화는 빠르고, 우리는 조금 더 빠릅니다.", "새로운 흐름을 관찰하고, 실험하고, 서비스로 증명합니다."],
  ["작은 불편도 그냥 지나치지 않습니다.", "불편을 마주하는 매 순간을 다시 설계합니다."],
  ["기술은 목적이 아니라 도구입니다.", "우리는 그 도구로 더 나은 경험을 만듭니다."],
  ["멈추지 않고 묻습니다. 지금보다 더 나은 방법은 무엇인가."],
  ["그 질문이 우리를 계속 나아가게 합니다."],
];

export default function Intro() {
  return (
    <section id="about" className="relative bg-white w-full scroll-mt-16">
      <div className="px-gutter py-section">
        <Reveal as="h2" className="font-bold text-[#e9e9e9] text-display">
          For The Moment &amp; For Every Day
        </Reveal>

        <div className="mt-block flex flex-col lg:flex-row lg:items-start lg:justify-between gap-block">
          <Reveal
            as="p"
            delay={120}
            className="font-bold text-[#292b2f] text-lead"
          >
            순간을 혁신하는 Development Partner
            <br />
            <Reveal
              as="span"
              variant="reveal-scale"
              delay={320}
              className="inline-block text-[#4a80f8] text-display"
            >
              더모먼트
            </Reveal>
          </Reveal>

          <div className="font-semibold text-[#555962] text-body max-w-[420px]">
            {PHILOSOPHY.map((block, i) => (
              <Reveal as="p" key={i} delay={i * 90} className="mb-6 last:mb-0">
                {block.map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < block.length - 1 && <br />}
                  </span>
                ))}
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
