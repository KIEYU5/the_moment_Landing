import DotField from "./DotField";
import Faceted from "./Faceted";
import RevealGroup from "./RevealGroup";
import { BEAT, GROUP, beat } from "../lib/timing";

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
    <section id="about" className="relative bg-white w-full overflow-hidden">
      <DotField bare on />
      {/* Positioned, so it sits above the canvas — an absolutely positioned
          element paints over in-flow content whatever the DOM order. */}
      <RevealGroup className="relative px-gutter py-section">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-block">
          <div>
            <Faceted as="p" className="font-bold text-[#292b2f] text-lead">
              광주소프트웨어마이스터고 학생 개발팀
            </Faceted>
            <Faceted
              as="p"
              delay={BEAT}
              className="font-bold text-[#4a80f8] text-display"
            >
              더모먼트
            </Faceted>
          </div>

          <div className="font-semibold text-[#555962] text-body max-w-[420px]">
            {PHILOSOPHY.map((block, i) => (
              <Faceted
                as="p"
                key={i}
                density="coarse"
                delay={beat(i, GROUP)}
                className="mb-6 last:mb-0"
              >
                {block.map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < block.length - 1 && <br />}
                  </span>
                ))}
              </Faceted>
            ))}
          </div>
        </div>
      </RevealGroup>
    </section>
  );
}
