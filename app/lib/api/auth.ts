import apiClient from '~/lib/apiClient';

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

interface AuthResponse {
  accessToken: string;
  user: {
    name: string;
    email: string;
  };
}

// refresh 토큰은 HttpOnly 쿠키(Path=/api/auth)로 오가므로 auth 요청은 withCredentials 필요
const withCookie = { withCredentials: true };

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data, withCookie).then((r) => r.data),

  signup: (data: SignupRequest) =>
    apiClient.post<AuthResponse>('/auth/signup', data, withCookie).then((r) => r.data),

  logout: () => apiClient.post('/auth/logout', null, withCookie).then((r) => r.data),
};
