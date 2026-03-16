import { Outlet } from 'react-router';
import { useState } from 'react';
import Header from '~/components/ui/Header';
import useBreakpoint from '~/hooks/useBreakpoint';

const DefaultLayout = () => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
