---
trigger: always_on
---

- 서버 액션: 모든 서버 액션은 app/actions/ 폴더에 모듈화하여 저장한다.
- 컴포넌트: 공용 컴포넌트는 app/components/에, 특정 페이지 전용 컴포넌트는 해당 페이지 폴더 내에 위치시킨다.
- TypeScript: 타입 정의는 루트 types/ 디렉토리에 페이지이름으로 모듈화하고 index.ts에서 export 한다. 컴포넌트 내 인라인 정의를 금지한다. 또한 any 사용금지.
- UI/UX: Shadcn/ui 와 tailwindcss 를 사용하 디자인은 항상 모바일 퍼스트(Mobile-first)로 설계할 것.
  - 모달(Dialog) 구현 시: 헤더 배경색에 따라 닫기 버튼(X)의 시인성을 반드시 확보할 것. (어두운 배경일 경우 `[&>button]:text-white` 등 활용)
- 검증: 코드 수정 후에는 반드시 의도대로 작동하는지 셀프 테스트를 수행한다.
- Prisma orm 사용시 항상 최신문서를 참고하고 최신문법을 사용할것
