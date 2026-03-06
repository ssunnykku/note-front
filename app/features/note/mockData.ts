import type { Note } from './types';

export const MOCK_NOTES: Note[] = [
  {
    id: '1',
    title: '프로젝트 기획안',
    content:
      '## 프로젝트 개요\n\n노트 작성 서비스를 개발한다. 사용자는 마크다운 기반으로 노트를 작성하고 관리할 수 있다.\n\n## 주요 기능\n\n- 노트 작성 및 편집\n- 폴더 기반 정리\n- AI 요약 기능\n- 실시간 동기화',
    updatedAt: '2026-03-06',
  },
  {
    id: '2',
    title: '회의록 - 3월 첫째 주',
    content:
      '## 참석자\n\n김철수, 이영희, 박민수\n\n## 논의 사항\n\n1. 프론트엔드 기술 스택 확정\n2. API 설계 리뷰\n3. 일정 조율\n\n## 결정 사항\n\n- React Router 7 + Tailwind CSS 4 사용\n- 백엔드 API는 다음 주까지 1차 완성',
    updatedAt: '2026-03-05',
  },
  {
    id: '3',
    title: 'Tailwind CSS 4 정리',
    content:
      '## 변경점\n\n- Vite 플러그인으로 통합\n- `@theme` 디렉티브로 커스텀 테마 설정\n- CSS-first 설정 방식\n\n## 사용법\n\n```css\n@import "tailwindcss";\n\n@theme {\n  --color-primary: #3b82f6;\n}\n```',
    updatedAt: '2026-03-04',
  },
  {
    id: '4',
    title: '할 일 목록',
    content:
      '- [x] 프로젝트 초기 세팅\n- [x] 공통 컴포넌트 구현\n- [ ] 노트 에디터 개발\n- [ ] AI 연동\n- [ ] 배포 파이프라인 구축',
    updatedAt: '2026-03-03',
  },
  {
    id: '5',
    title: '아이디어 메모',
    content:
      '## 추가 기능 아이디어\n\n- 태그 기반 검색\n- 노트 공유 링크 생성\n- 템플릿 기능\n- 단축키 지원\n- 오프라인 모드',
    updatedAt: '2026-03-02',
  },
];
