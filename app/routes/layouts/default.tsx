import { Outlet, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import Header from '~/components/ui/Header';
import useBreakpoint from '~/hooks/useBreakpoint';

const DefaultLayout = () => {
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login', { replace: true });
    } else {
      setAuthChecked(true);
    }
  }, [navigate]);

  if (!authChecked) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      <Header
        showMenuButton={isMobile}
        onMenuToggle={() => setSidebarOpen((prev) => !prev)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Outlet context={{ isMobile, sidebarOpen, setSidebarOpen }} />
      </div>
    </div>
  );
};

export default DefaultLayout;
