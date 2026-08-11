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
| `reveal-brush` | 왼쪽 → 오른쪽 `clip-path` 와이프 (Hero의 파란 M) |

Hero는 진입 시 내비 → `THE` → 붓터치 `M` → `OMENT` 순으로 이어집니다. 타이밍
상수는 [`Hero.jsx`](src/components/Hero.jsx) 상단에 모아 두었습니다.

주의할 점 두 가지:

- `Reveal` 요소에 Tailwind `transition-*` 유틸리티를 같이 쓰면 리빌 트랜지션을
  덮어씁니다. hover 효과 등은 자식 요소에 두세요.
- `clip-path`는 `none`과 보간되지 않습니다. `reveal-brush`의 양끝이 모두
  `inset()`인 이유입니다.

`prefers-reduced-motion: reduce`에서는 리빌의 숨김 상태 자체가 적용되지 않고
마퀴와 부드러운 스크롤도 멈춥니다.

## 남은 작업

- `Projects` · `Awards` · `Contact` 섹션의 플레이스홀더(`TITLE` / `EXPLAIN` / `SUBEXPLAIN`) 실제 콘텐츠 입력
- 내비의 `SERVICE` 항목은 전용 섹션이 없어 임시로 `Values`(`#service`)를 가리킴
- `Contact` 폼 전송 백엔드 미연결 (현재는 클라이언트 검증 + 완료 표시까지)
- 푸터 SOCIAL 링크 2개가 모두 `Instagram` 플레이스홀더 — 실제 채널/URL 필요
