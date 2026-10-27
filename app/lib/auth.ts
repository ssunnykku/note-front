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
