import DotField from "./DotField";
import Faceted from "./Faceted";
import RevealGroup from "./RevealGroup";
import { BEAT, GROUP, beat } from "../lib/timing";

const PHILOSOPHY = [
  ["더모먼트팀은 광주소프트웨어마이스터고등학교의", "전공 동아리입니다."],
  ["약 30명의 재학생, 졸업생들이 모여서 활동하고,", "주로 학교에 필요한 서비스를 개발합니다."],
  ["작은 불편도 그냥 지나치지 않습니다.", "불편을 마주하는 매 순간을 다시 설계합니다."],
  ["순간을 혁신하고 싶나요?"],
  ["더모먼트 팀과 함께하세요."]
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
