import axios from 'axios';
import { clearAuth } from '~/lib/auth';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

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

// 응답 에러 공통 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 401) {
      clearAuth();
    } else {
      console.error(`[API Error] ${status ?? 'NETWORK'} ${url}`, error.response?.data);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
