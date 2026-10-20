export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;
export const PASSWORD_RULE_MESSAGE = `비밀번호는 공백이 아닌 ${PASSWORD_MIN_LENGTH}~${PASSWORD_MAX_LENGTH}자로 입력해주세요`;

export const isPasswordInvalid = (password: string) =>
  password.length > 0 &&
  (password.trim().length === 0 ||
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH);

export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  window.location.href = '/login';
};
