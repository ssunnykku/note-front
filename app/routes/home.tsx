export function meta() {
  return [{ title: 'Note' }, { name: 'description', content: '노트 작성 서비스' }];
}

export default function Home() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Note</h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">노트 작성 서비스</p>
    </>
  );
}
