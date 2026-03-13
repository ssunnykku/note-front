/**
 * ISO 날짜 문자열을 "YYYY-MM-DD HH:mm:ss" 형식으로 변환
 */
export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${M}-${d} ${h}:${m}:${s}`;
};

/**
 * ISO 날짜 문자열을 "YYYY-MM-DD" 형식으로 변환
 */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${M}-${d}`;
};
