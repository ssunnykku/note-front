import { useState } from 'react';
import Sidebar from '~/features/note/Sidebar';
import NoteContent from '~/features/note/NoteContent';
import AiChatPanel from '~/features/ai/AiChatPanel';
import { MOCK_CATEGORIES } from '~/features/note/mockData';
import type { Note, Category, ChatRoom } from '~/features/note/types';

export function meta() {
  return [{ title: 'Note' }, { name: 'description', content: '노트 작성 서비스' }];
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);

  const notes = categories.flatMap((cat) => cat.notes);
  const [selectedId, setSelectedId] = useState<string | null>(notes[0]?.id ?? null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const selectedNote = notes.find((note) => note.id === selectedId) ?? null;
  const selectedChat = chatRooms.find((c) => c.id === selectedChatId) ?? null;

  const handleSaveNote = (noteId: string, title: string, content: string) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        notes: cat.notes.map((note) =>
          note.id === noteId
            ? { ...note, title, content, updatedAt: new Date().toISOString().split('T')[0] }
            : note,
        ),
      })),
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
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, notes: [newNote, ...cat.notes] } : cat,
      ),
    );
    setSelectedId(newNote.id);
    console.log('새 노트 추가됨:', newNote);
  };

  const handleToggleChat = () => {
    if (isChatOpen) {
      setIsChatOpen(false);
      setSelectedChatId(null);
    } else {
      setIsChatOpen(true);
      if (chatRooms.length > 0) {
        setSelectedChatId(chatRooms[0].id);
      }
    }
  };

  const handleRenameChat = (chatId: string, title: string) => {
    setChatRooms((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, title } : chat)),
    );
  };

  const handleAddChat = (categoryId: string) => {
    const categoryChats = chatRooms.filter((c) => c.categoryId === categoryId);
    if (categoryChats.length >= 5) return;

    const newChat: ChatRoom = {
      id: String(Date.now()),
      title: `새 채팅 ${categoryChats.length + 1}`,
      categoryId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setChatRooms((prev) => [newChat, ...prev]);
    setSelectedChatId(newChat.id);
  };

  return (
    <>
      <Sidebar
        categories={categories}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          setIsChatOpen(false);
          setSelectedChatId(null);
        }}
        onAddNote={handleAddNote}
        isChatOpen={isChatOpen}
        onToggleChat={handleToggleChat}
        chatRooms={chatRooms}
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
        onAddChat={handleAddChat}
        onRenameChat={handleRenameChat}
      />
      {isChatOpen && selectedChat ? (
        <AiChatPanel
          chatId={selectedChat.id}
          chatTitle={selectedChat.title}
          onClose={() => setSelectedChatId(null)}
        />
      ) : isChatOpen ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-3">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
          <p className="text-sm">왼쪽 목록에서 채팅을 선택하거나 추가해주세요</p>
        </div>
      ) : (
        <NoteContent note={selectedNote} onSave={handleSaveNote} />
      )}
    </>
  );
}
