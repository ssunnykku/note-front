# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

노트/메모 작성 서비스의 프론트엔드. AI 연동 기능이 포함될 예정이며, 백엔드 서버는 별도 레포에서 관리한다. 팀은 풀스택 1명 + AI 1명으로 구성.

## 기술 스택

- **프레임워크**: React 19 + React Router 7 (SSR 모드, `react-router.config.ts`에서 설정)
- **빌드**: Vite 7
- **스타일링**: Tailwind CSS 4 (Vite 플러그인)
- **패키지 매니저**: pnpm

## 주요 명령어

```bash
pnpm dev          # 개발 서버 실행 (HMR) - http://localhost:5173
pnpm build        # 프로덕션 빌드 (build/client, build/server 생성)
pnpm start        # 빌드된 서버 실행
pnpm typecheck    # React Router 타입 생성 + TypeScript 타입 검사
pnpm lint         # ESLint 실행 (app/ 디렉터리)
pnpm lint:fix     # ESLint 자동 수정
pnpm format       # Prettier로 코드 포맷팅
```

**Docker 빌드:**

```bash
docker build -t note-front .
docker run -p 3000:3000 note-front
```

## 디렉터리 구조

```
app/
├── routes.ts              # 라우트 정의 (React Router declarative config)
├── routes/                # 페이지 컴포넌트 (라우트 단위)
├── components/            # 공통 UI 컴포넌트
│   └── ui/                # 기본 UI 요소 (Button, Input, Modal 등)
├── features/              # 기능 단위 모듈
│   ├── note/              # 노트 관련 (컴포넌트, 훅, 타입)
│   └── ai/                # AI 연동 관련
├── hooks/                 # 공통 커스텀 훅
├── lib/                   # 유틸리티, API 클라이언트, 상수
├── types/                 # 공통 타입 정의
├── root.tsx               # 루트 레이아웃 (HTML 셸, 에러 바운더리)
└── app.css                # 글로벌 스타일 (Tailwind 설정)
```

## 라우팅

`app/routes.ts`에서 선언적으로 정의. 각 라우트 파일은 다음을 export할 수 있다:

- `default` — 페이지 컴포넌트
- `meta()` — 페이지 타이틀, 메타 태그
- `loader()` — 데이터 로딩 (API 호출)
- `action()` — 폼 제출, mutation 처리

라우트 타입은 `.react-router/types/`에 자동 생성되며 `import type { Route } from "./+types/<name>"`으로 사용.

**타입 생성:** `pnpm typecheck`를 실행하면 `react-router typegen`이 먼저 실행되어 `.react-router/types/`에 라우트별 타입 정의가 생성된다. 이 타입들은 `loader`, `action`, `meta`, `ErrorBoundary` 등의 함수에서 사용된다.

## 경로 별칭

`~/`는 `./app/`에 매핑된다 (tsconfig paths).

```typescript
import { Button } from "~/components/ui/Button";
```

## 코딩 컨벤션

### 네이밍

- **컴포넌트 파일/폴더**: PascalCase (`NoteCard.tsx`, `NoteEditor/`)
- **유틸/훅 파일**: camelCase (`useNote.ts`, `formatDate.ts`)
- **타입/인터페이스**: PascalCase, `I` 접두사 없이 (`Note`, `NoteListProps`)
- **상수**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### 컴포넌트

- 함수 컴포넌트 + 화살표 함수 사용
- Props 타입은 컴포넌트 파일 내에 정의
- 한 파일에 하나의 export default 컴포넌트

```typescript
interface NoteCardProps {
  title: string;
  content: string;
}

const NoteCard = ({ title, content }: NoteCardProps) => {
  return <div>{/* ... */}</div>;
};

export default NoteCard;
```

### 스타일링

- Tailwind 유틸리티 클래스를 직접 사용
- 다크모드는 Tailwind의 `dark:` variant 활용
- 반복되는 스타일 조합은 컴포넌트로 추출

### API 통신

- API 클라이언트는 `app/lib/api.ts`에서 관리
- 백엔드 base URL은 환경변수로 관리 (`VITE_API_URL`)
- fetch 기반, 응답 타입은 제네릭으로 지정

### ESLint 및 Prettier

- **ESLint**: TypeScript ESLint 기반, React Hooks 및 React Refresh 플러그인 사용
  - `app/routes/**/*.tsx`와 `app/root.tsx`에서는 `react-refresh/only-export-components` 규칙 비활성화 (라우트 파일은 여러 export를 허용)
- **Prettier**: 세미콜론 사용, 홑따옴표, 2칸 들여쓰기, trailing comma, 최대 줄 길이 100자

## 커밋 규칙

```
<type>: <subject>
```

**type:**

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `style`: UI/스타일 변경 (기능 변화 없음)
- `refactor`: 코드 리팩토링
- `chore`: 설정, 빌드, 의존성 변경
- `docs`: 문서 수정

**예시:**

```
feat: 노트 편집기 마크다운 미리보기 추가
fix: 노트 목록 무한 스크롤 중복 로딩 수정
style: 사이드바 다크모드 색상 조정
```

- 한글로 작성
- 제목은 50자 이내
- 본문이 필요하면 빈 줄 후 작성
