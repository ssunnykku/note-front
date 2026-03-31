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

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  signup: (data: SignupRequest) =>
    apiClient.post<AuthResponse>('/auth/signup', data).then((r) => r.data),

  refresh: () => apiClient.post<AuthResponse>('/auth/refresh').then((r) => r.data),

  logout: () => apiClient.post('/auth/logout').then((r) => r.data),
};
