import { Outlet } from 'react-router';
import Header from '~/components/ui/Header';
import Body from '~/components/ui/Body';
import Footer from '~/components/ui/Footer';

const DefaultLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Body>
        <Outlet />
      </Body>
      <Footer />
    </div>
  );
};

export default DefaultLayout;
