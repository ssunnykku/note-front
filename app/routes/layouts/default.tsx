import { Outlet, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import Header from '~/components/ui/Header';
import useBreakpoint from '~/hooks/useBreakpoint';
import useIsClient from '~/hooks/useIsClient';
import { refreshAccessToken } from '~/lib/apiClient';
import { clearAuth, getTokenStatus } from '~/lib/auth';

const DefaultLayout = () => {
  const navigate = useNavigate();
  const isClient = useIsClient();
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  // localStorage는 클라이언트에서만 접근 가능
  const tokenStatus = isClient ? getTokenStatus() : 'none';
  const ready = tokenStatus === 'valid' || refreshed;

  // 토큰이 없으면 로그인으로, 만료됐으면 화면을 그리기 전에 refresh부터 시도
  useEffect(() => {
    if (!isClient) return;
    if (tokenStatus === 'none') {
      navigate('/login', { replace: true });
    } else if (tokenStatus === 'expired') {
      refreshAccessToken()
        .then(() => setRefreshed(true))
        .catch(clearAuth);
    }
  }, [isClient, tokenStatus, navigate]);

  if (!ready) {
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
