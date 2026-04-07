export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  window.location.href = '/login';
};
