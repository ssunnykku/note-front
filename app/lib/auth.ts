export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;
export const PASSWORD_RULE_MESSAGE = `비밀번호는 공백이 아닌 ${PASSWORD_MIN_LENGTH}~${PASSWORD_MAX_LENGTH}자로 입력해주세요`;

export const isPasswordInvalid = (password: string) =>
  password.length > 0 &&
  (password.trim().length === 0 ||
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH);

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 50;
export const NAME_RULE_MESSAGE = `닉네임은 공백이 아닌 ${NAME_MIN_LENGTH}~${NAME_MAX_LENGTH}자로 입력해주세요`;

export const isNameInvalid = (name: string) =>
  name.length > 0 &&
  (name.trim().length === 0 || name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH);

export const EMAIL_MAX_LENGTH = 255;
export const EMAIL_RULE_MESSAGE = '올바른 이메일 형식으로 입력해주세요';

export const isEmailInvalid = (email: string) =>
  email.length > 0 && (email.length > EMAIL_MAX_LENGTH || !/^[^\s@]+@[^\s@]+$/.test(email));

export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  window.location.href = '/login';
};

// JWT payload의 exp(초)로 상태 확인. 해석할 수 없는 토큰은 지우고 'none'으로 본다
// 'expired'는 refresh로 새 토큰을 받을 수 있으니 지우지 않는다
export type TokenStatus = 'valid' | 'expired' | 'none';

export const getTokenStatus = (): TokenStatus => {
  if (typeof window === 'undefined') return 'none';
  const token = localStorage.getItem('accessToken');
  if (!token) return 'none';
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload)) as { exp?: number };
    if (typeof exp !== 'number' || exp * 1000 > Date.now()) return 'valid';
    return 'expired';
  } catch {
    localStorage.removeItem('accessToken');
    return 'none';
  }
};
