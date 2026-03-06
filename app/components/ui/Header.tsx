import { Link } from 'react-router';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-[1920px] min-w-[1024px] mx-auto flex items-center justify-between h-14 px-6">
        <Link to="/" className="text-lg font-semibold text-gray-900 dark:text-white">
          Note
        </Link>
        <nav className="flex items-center gap-4">{/* 네비게이션 링크 슬롯 */}</nav>
      </div>
    </header>
  );
};

export default Header;
