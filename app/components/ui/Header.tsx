import { Link, useNavigate } from 'react-router';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('로그아웃');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-[1920px] min-w-[1024px] mx-auto flex items-center justify-between h-14 px-6">
        <Link to="/" className="text-lg font-semibold text-gray-900 dark:text-white">
          Note
        </Link>
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
