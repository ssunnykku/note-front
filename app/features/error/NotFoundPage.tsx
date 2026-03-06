import { Link } from 'react-router';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white dark:bg-gray-950 px-4">
      <div className="text-6xl">🔍</div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">404</h1>
      <p className="text-lg text-gray-500 dark:text-gray-400">
        요청하신 페이지를 찾을 수 없습니다.
      </p>
      <Link
        to="/"
        className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
};

export default NotFoundPage;
