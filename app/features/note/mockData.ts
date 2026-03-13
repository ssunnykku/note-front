import type { Category } from './types';

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    categoryName: '업무',
    notes: [
      {
        id: 1,
        userId: 'mock-user',
        title: '프로젝트 기획안',
        createdAt: '2026-03-06',
        updatedAt: '2026-03-06',
      },
      {
        id: 2,
        userId: 'mock-user',
        title: '회의록 - 3월 첫째 주',
        createdAt: '2026-03-05',
        updatedAt: '2026-03-05',
      },
    ],
  },
  {
    id: 2,
    categoryName: '학습',
    notes: [
      {
        id: 3,
        userId: 'mock-user',
        title: 'Tailwind CSS 4 정리',
        createdAt: '2026-03-04',
        updatedAt: '2026-03-04',
      },
    ],
  },
  {
    id: 3,
    categoryName: '개인',
    notes: [
      {
        id: 4,
        userId: 'mock-user',
        title: '할 일 목록',
        createdAt: '2026-03-03',
        updatedAt: '2026-03-03',
      },
      {
        id: 5,
        userId: 'mock-user',
        title: '아이디어 메모',
        createdAt: '2026-03-02',
        updatedAt: '2026-03-02',
      },
    ],
  },
];
