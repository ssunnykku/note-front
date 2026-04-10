import { useSyncExternalStore } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const getBreakpoint = (): Breakpoint => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

const subscribe = (callback: () => void) => {
  const mql = window.matchMedia('(max-width: 767px)');
  const mqt = window.matchMedia('(min-width: 768px) and (max-width: 1023px)');
  mql.addEventListener('change', callback);
  mqt.addEventListener('change', callback);
  return () => {
    mql.removeEventListener('change', callback);
    mqt.removeEventListener('change', callback);
  };
};

const useBreakpoint = (): Breakpoint => {
  return useSyncExternalStore(subscribe, getBreakpoint, () => 'desktop');
};

export default useBreakpoint;
