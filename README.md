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
  index.css            Tailwind 진입점 + 전역 애니메이션 키프레임
  assets/              워드마크 · Union 로고 SVG
  components/
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

## 남은 작업

- `Projects` · `Awards` · `Contact` 섹션의 플레이스홀더(`TITLE` / `EXPLAIN` / `SUBEXPLAIN`) 실제 콘텐츠 입력
- 내비의 `SERVICE` 항목은 전용 섹션이 없어 임시로 `Values`(`#service`)를 가리킴
- `Contact` 폼 전송 백엔드 미연결 (현재는 클라이언트 검증 + 완료 표시까지)
- 푸터 SOCIAL 링크 2개가 모두 `Instagram` 플레이스홀더 — 실제 채널/URL 필요
