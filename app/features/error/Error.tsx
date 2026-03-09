import { Link } from 'react-router';

interface ErrorPageProps {
  message?: string;
  details?: string;
  stack?: string;
}

const ErrorPage = ({ message = '오류 발생', details, stack }: ErrorPageProps) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white dark:bg-gray-950 px-4">
      <div className="text-6xl">⚠️</div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{message}</h1>
      {details && <p className="text-lg text-gray-500 dark:text-gray-400">{details}</p>}
      {stack && (
        <pre className="mt-4 max-w-3xl w-full overflow-x-auto rounded-lg bg-gray-100 dark:bg-gray-900 p-4 text-sm text-gray-800 dark:text-gray-200">
          <code>{stack}</code>
        </pre>
      )}
      <Link
        to="/"
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
};

export default ErrorPage;
