import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// [AUTH] 토큰 인증 적용
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    } else {
      console.error(`[API Error] ${status ?? 'NETWORK'} ${url}`, error.response?.data);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
