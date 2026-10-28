import axios, { isAxiosError, type AxiosRequestConfig } from 'axios';
import { clearAuth } from '~/lib/auth';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const REFRESH_URL = '/auth/refresh';

// [AUTH] 토큰 인증 적용 (클라이언트에서만 localStorage 접근)
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

const requestRefresh = () =>
  apiClient
    .post<{ accessToken: string }>(REFRESH_URL, null, { withCredentials: true })
    .then((r) => r.data.accessToken);

let refreshPromise: Promise<string> | null = null;

// refresh 토큰은 한 번 쓰면 폐기되므로 동시에 만료된 요청들은 진행 중인 refresh를 공유한다.
// 다른 탭이 먼저 회전시켰으면 401이 오는데, 쿠키는 탭끼리 공유되니 1회 재시도하면 새 쿠키로 성공한다
export const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = requestRefresh()
      .catch((err) => {
        if (isAxiosError(err) && err.response?.status === 401) return requestRefresh();
        throw err;
      })
      .then((token) => {
        localStorage.setItem('accessToken', token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

type RetriableConfig = AxiosRequestConfig & { _retried?: boolean };

// 응답 에러 공통 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const config = error.config as RetriableConfig | undefined;
    const url = config?.url;

    // refresh 자체의 실패는 refreshAccessToken을 기다리는 쪽에서 처리
    if (url === REFRESH_URL) return Promise.reject(error);

    if (
      status === 401 &&
      error.response?.data?.title === 'TOKEN_EXPIRED' &&
      config &&
      !config._retried
    ) {
      try {
        await refreshAccessToken();
      } catch {
        clearAuth();
        return Promise.reject(error);
      }
      config._retried = true;
      return apiClient(config);
    }

    // 백엔드 배포 전에는 인증 실패가 403(본문 없음)으로 온다
    if (status === 401 || status === 403) {
      clearAuth();
    } else {
      console.error(`[API Error] ${status ?? 'NETWORK'} ${url}`, error.response?.data);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
