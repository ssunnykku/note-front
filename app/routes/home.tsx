import { useState } from 'react';
import Sidebar from '~/features/note/Sidebar';
import NoteContent from '~/features/note/NoteContent';
import { MOCK_NOTES, MOCK_CATEGORIES } from '~/features/note/mockData';
import type { Note } from '~/features/note/types';

export function meta() {
  return [{ title: 'Note' }, { name: 'description', content: '노트 작성 서비스' }];
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [selectedId, setSelectedId] = useState<string | null>(notes[0]?.id ?? null);

  const selectedNote = notes.find((note) => note.id === selectedId) ?? null;

  const handleSaveNote = (noteId: string, title: string, content: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              title,
              content,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : note,
      ),
    );
    console.log('노트 저장됨:', { noteId, title, content });
  };

  return (
    <>
      <Sidebar
        notes={notes}
        categories={MOCK_CATEGORIES}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <NoteContent note={selectedNote} onSave={handleSaveNote} />
    </>
  );
}
