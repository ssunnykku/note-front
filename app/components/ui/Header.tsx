import { Link, useNavigate } from 'react-router';

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

const Header = ({ onMenuToggle, showMenuButton }: HeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('로그아웃');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between h-14 px-4 lg:px-6">
        <div className="flex items-center gap-2">
          {showMenuButton && (
            <button
              onClick={onMenuToggle}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors md:hidden"
              aria-label="메뉴 열기"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
          <Link to="/" className="text-lg font-semibold text-gray-900 dark:text-white">
            Note
          </Link>
        </div>
        <nav className="flex items-center gap-1">
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Logout
          </button>
          <button className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-medium hover:shadow-lg transition-shadow">
            U
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
