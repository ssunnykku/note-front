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

  const handleAddNote = (categoryId: string) => {
    const newNote: Note = {
      id: String(Date.now()),
      title: '새 노트',
      content: '',
      categoryId,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setSelectedId(newNote.id);
    console.log('새 노트 추가됨:', newNote);
  };

  return (
    <>
      <Sidebar
        notes={notes}
        categories={MOCK_CATEGORIES}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAddNote={handleAddNote}
      />
      <NoteContent note={selectedNote} onSave={handleSaveNote} />
    </>
  );
}
