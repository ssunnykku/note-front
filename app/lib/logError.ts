import { isAxiosError } from 'axios';

// API 에러는 apiClient 인터셉터에서 이미 로깅하므로 그 외 에러만 출력
export const logError = (context: string, err: unknown) => {
  if (isAxiosError(err)) return;
  console.error(`${context}:`, err);
};
