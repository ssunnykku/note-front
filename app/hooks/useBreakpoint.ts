import { useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 767px)');
    const mqTablet = window.matchMedia('(min-width: 768px) and (max-width: 1023px)');

    const update = () => {
      if (mqMobile.matches) setBreakpoint('mobile');
      else if (mqTablet.matches) setBreakpoint('tablet');
      else setBreakpoint('desktop');
    };

    // 마운트 시 즉시 현재 breakpoint 반영
    update();

    mqMobile.addEventListener('change', update);
    mqTablet.addEventListener('change', update);

    return () => {
      mqMobile.removeEventListener('change', update);
      mqTablet.removeEventListener('change', update);
    };
  }, []);

  return breakpoint;
};

export default useBreakpoint;
