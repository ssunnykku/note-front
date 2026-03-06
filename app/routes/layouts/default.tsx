import { Outlet } from 'react-router';
import Header from '~/components/ui/Header';

const DefaultLayout = () => {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default DefaultLayout;
