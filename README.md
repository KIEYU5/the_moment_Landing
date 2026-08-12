# THE MOMENT — Landing

더모먼트 회사 소개 원페이지 랜딩. Figma 디자인을 React로 옮긴 프로젝트입니다.

## 스택

- **Vite 8** + **React 19** (JSX)
- **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **oxlint**
- 폰트: Pretendard (jsDelivr CDN)

## 실행

```bash
npm install
npm run dev
```

| 스크립트 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | oxlint |

## 구조

```
src/
  App.jsx              섹션 조립
  index.css            Tailwind 진입점 + 마퀴/리빌 애니메이션 정의
  hooks/useInView.js   스크롤 진입 감지 (IntersectionObserver, 1회성)
  assets/              워드마크 · Union 로고 SVG
  components/
    Reveal.jsx         진입 시 나타나는 래퍼
    Wordmark.jsx       THE MOMENT 워드마크 (삼각 세공면으로 분할된 인라인 SVG)
    Brush.jsx          파란 M 붓터치 (획을 따라 그려지는 마스크)
    Hero.jsx           #(top)    내비 + THE MOMENT 워드마크
    Intro.jsx          #about    회사 소개 · 철학
    Values.jsx         #service  마퀴 티커 + 핵심 가치 3
    Projects.jsx       #work     프로젝트 카드
    Awards.jsx         #awards   수상 이력
    Contact.jsx        #contact  문의 폼
    Footer.jsx                   푸터
```

## 디자인 토큰

| 용도 | 값 |
| --- | --- |
| 본문 / 제목 | `#292b2f` |
| 포인트 (블루) | `#4a80f8` |
| 보조 텍스트 | `#555962` |
| 연회색 (배경 텍스트) | `#e9e9e9` |
| 카드 배경 | `#d9d9d9` |
| 푸터 배경 | `#fbfbfb` |

좌우 여백은 모든 섹션이 `px-10`(40px)로 통일돼 있습니다. Hero만 예외입니다.

## 타입 스케일

역할별 토큰으로 [`index.css`](src/index.css)의 `@theme`에 정의돼 있습니다. 굵기와
색은 같은 역할이라도 섹션마다 달라서 토큰에 넣지 않고 요소에 둡니다.

| 클래스 | 크기 | 쓰는 곳 |
| --- | --- | --- |
| `text-display` | `clamp(28px, 4.4vw, 64px)` | 섹션 제목, 더모먼트, 마퀴 |
| `text-title` | `clamp(26px, 2.6vw, 36px)` | 카드 제목, 푸터 로고, 밸류 번호 |
| `text-lead` | `clamp(20px, 2.2vw, 32px)` | 도입 문장, 밸류 본문 |
| `text-subtitle` | `clamp(18px, 1.8vw, 24px)` | 푸터 태그라인 |
| `text-label` | `20px` | 라벨, 링크, 카드 캡션 |
| `text-body` | `16px / 24px` | 본문, 입력 필드, 버튼 |
| `text-caption` | `14px` | 부가 설명, 저작권, 그룹 헤딩 |

Hero는 이 스케일 밖입니다 — 워드마크는 글자가 아니라 아트웍이고, 내비는 자체
`clamp`를 씁니다.

## 애니메이션

`Reveal`을 감싸면 화면에 들어올 때 한 번 나타납니다. `variant`로 방향을 고르고
`delay`(ms)로 순서를 만듭니다.

```jsx
<Reveal as="h2" delay={120} className="...">제목</Reveal>
<Reveal variant="reveal-left">…</Reveal>
```

| variant | 움직임 |
| --- | --- |
| `reveal-up` (기본) | 아래에서 위로 + 페이드 |
| `reveal-left` | 왼쪽에서 슬라이드 |
| `reveal-scale` | 살짝 확대되며 페이드 |

Hero는 진입 시 내비 → 붓터치 `M`(세공) → 워드마크 세공면 정렬 순으로 이어집니다.
타이밍 상수는 [`Hero.jsx`](src/components/Hero.jsx) 상단에 모아 두었습니다.

### 워드마크 세공면 (`Wordmark.jsx`)

워드마크 띠를 삼각형 72개로 자르고, **각 삼각형이 자기 클립을 통해 워드마크
전체를 따로 보여줍니다.** 면마다 위치·회전·배율이 조금씩 어긋나 있어서 글자가
세공면 경계에서 깨져 보이고, 어긋남이 풀리면서 하나로 맞물립니다. 보석 면마다
다르게 비친 상이 정렬되는 모습입니다.

- 격자 꼭짓점은 결정론적으로 흔들되(`rnd`) **바깥 테두리는 흔들지 않습니다.**
  테두리가 어긋나면 타일링에 틈이 생겨 글자에 구멍이 납니다.
- 인접한 클립은 변을 공유하는데 안티앨리어싱된 두 변이 맞닿으면 머리카락 같은
  이음새가 보입니다. 꼭짓점을 무게중심 반대로 `0.9` 단위 밀어 겹치게 했습니다.
  정렬이 끝나면 겹친 내용이 동일하므로 보이지 않습니다.
- 면마다 워드마크 8자를 다 그리면 프레임당 576개 path가 됩니다. 각 면이 이동
  구간에서 실제로 닿을 수 있는 글자만 `<use>`로 참조해 **146개**로 줄였습니다.
  어떤 글자가 필요한지는 `sourceSpan()`이 시작 시점 변형(이동·회전·skew·배율)의
  **역행렬로 클립을 되돌려** 계산합니다. 움직임 진폭(`PUSH_*`/`LIFT`/`TURN`/
  `SKEW`/`SCALE_*`)을 바꾸면 자동으로 따라오지만, 진행 0~100% 구간에서 누락
  픽셀이 0인지는 다시 확인하세요.
- `transform-origin`은 면마다 자기 무게중심으로 지정합니다. 기본값이면 viewBox
  중심을 기준으로 돌아 전혀 다른 움직임이 됩니다.

정렬이 끝난 상태는 원본 워드마크와 픽셀 단위로 일치해야 합니다(2× 해상도에서
누락 0px). 기하를 손볼 때 이 대조를 다시 하세요.

### 붓터치 (`Brush.jsx`)

`THE MOMENT`의 `M` 자리에 들어가는 파란 마크는 붓으로 그린 그림입니다.
사각형으로 훑어 내리는 대신, 획의 중심선을 따라간 굵은 패스 3개
(왼쪽 다리+꼬리 → 가운데 V → 오른쪽 다리)로 아트웍을 마스킹하고
`stroke-dashoffset`을 0으로 보내 **실제로 칠하듯이** 나타냅니다.

- 좌표는 아트웍 자체의 `217.825 × 209.331` viewBox 기준입니다.
- `pathLength="1"`로 길이를 정규화해 `getTotalLength()` 없이 `strokeDasharray="1"`,
  `stroke-dashoffset: 1 → 0`으로 제어합니다.
- 마스크 그룹에 약한 `feGaussianBlur`를 걸어 획 끝이 번지듯 들어옵니다.
- 획 폭은 붓이 가장 넓게 퍼지는 지점을 덮되 옆 획을 침범하지 않도록 개별 지정.
  현재 설정으로 아트웍의 99.7%를 덮습니다 — 폭을 줄이면 붓의 일부가 영구히
  잘리므로 중심선을 바꿀 때 함께 확인하세요.

주의할 점:

- `Reveal` 요소에 Tailwind `transition-*` 유틸리티를 같이 쓰면 리빌 트랜지션을
  덮어씁니다. hover 효과 등은 자식 요소에 두세요.
- 크기를 넘겨받는 컴포넌트에서 `w-full`과 `w-[15.1%]`를 **같은 요소**에 두지
  마세요. Tailwind는 클래스 문자열 순서가 아니라 생성된 CSS 순서로 승자를
  정하는데 `.w-full`이 뒤에 나와서 이깁니다. 래퍼가 크기를, 안쪽 요소가
  `w-full`을 갖도록 나누세요.
- `useInView`의 `threshold`는 0이 기본입니다. 뷰포트보다 큰 요소는 비율
  threshold에 영원히 도달하지 못해 리빌이 아예 발화하지 않습니다. 시점 조절은
  `rootMargin`으로 하세요.

`prefers-reduced-motion: reduce`에서는 리빌의 숨김 상태 자체가 적용되지 않고
마퀴와 부드러운 스크롤도 멈춥니다.

## 남은 작업

- `Projects` · `Awards` · `Contact` 섹션의 플레이스홀더(`TITLE` / `EXPLAIN` / `SUBEXPLAIN`) 실제 콘텐츠 입력
- 내비의 `SERVICE` 항목은 전용 섹션이 없어 임시로 `Values`(`#service`)를 가리킴
- `Contact` 폼 전송 백엔드 미연결 (현재는 클라이언트 검증 + 완료 표시까지)
- 푸터 SOCIAL 링크 2개가 모두 `Instagram` 플레이스홀더 — 실제 채널/URL 필요
