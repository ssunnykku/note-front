import { useState } from 'react';
import Sidebar from '~/features/note/Sidebar';
import NoteContent from '~/features/note/NoteContent';
import { MOCK_NOTES } from '~/features/note/mockData';

export function meta() {
  return [{ title: 'Note' }, { name: 'description', content: '노트 작성 서비스' }];
}

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_NOTES[0]?.id ?? null);
  const selectedNote = MOCK_NOTES.find((note) => note.id === selectedId) ?? null;

  return (
    <>
      <Sidebar notes={MOCK_NOTES} selectedId={selectedId} onSelect={setSelectedId} />
      <NoteContent note={selectedNote} />
    </>
  );
}
