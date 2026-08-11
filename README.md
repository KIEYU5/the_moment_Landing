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
    Wordmark.jsx       THE MOMENT 워드마크 (글자별 애니메이션용 인라인 SVG)
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

Hero는 진입 시 내비 → `THE` → 붓터치 `M` → `OMENT` 순으로 이어집니다. 타이밍
상수는 [`Hero.jsx`](src/components/Hero.jsx) 상단에 모아 두었습니다.

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
