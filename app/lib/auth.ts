export const clearAuth = () => {
  localStorage.removeItem('accessToken');
  window.location.href = '/login';
};
