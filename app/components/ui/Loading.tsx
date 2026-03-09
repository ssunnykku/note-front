interface LoadingProps {
  fullScreen?: boolean;
}

const Loading = ({ fullScreen = false }: LoadingProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary dark:border-gray-600 dark:border-t-primary" />
      <span className="text-sm text-gray-500 dark:text-gray-400">로딩 중...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-950">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{content}</div>;
};

export default Loading;
