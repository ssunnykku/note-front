import { Outlet, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import Header from '~/components/ui/Header';
import useBreakpoint from '~/hooks/useBreakpoint';
import useIsClient from '~/hooks/useIsClient';

const DefaultLayout = () => {
  const navigate = useNavigate();
  const isClient = useIsClient();
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // localStorage는 클라이언트에서만 접근 가능
  const hasToken = isClient && !!localStorage.getItem('accessToken');

  useEffect(() => {
    if (isClient && !hasToken) {
      navigate('/login', { replace: true });
    }
  }, [isClient, hasToken, navigate]);

  if (!hasToken) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      <Header showMenuButton={isMobile} onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
      <div className="flex flex-1 overflow-hidden">
        <Outlet context={{ isMobile, sidebarOpen, setSidebarOpen }} />
      </div>
    </div>
  );
};

export default DefaultLayout;
