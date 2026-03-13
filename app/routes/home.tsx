import { useState, useEffect } from 'react';
import Sidebar from '~/features/note/Sidebar';
import NoteContent from '~/features/note/NoteContent';
import AiChatPanel from '~/features/ai/AiChatPanel';
import { categoriesApi } from '~/lib/api/categories';
import { notesApi } from '~/lib/api/notes';
import type { Note, Category, ChatRoom } from '~/features/note/types';

export function meta() {
  return [{ title: 'Note' }, { name: 'description', content: '노트 작성 서비스' }];
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    // TODO: 로그인 구현 후 localStorage에서 userId 가져오기
    const userId = localStorage.getItem('userId') || '550e8400-e29b-41d4-a716-446655440000';

    categoriesApi
      .getAll(userId)
      .then((data) => {
        setCategories(data);
        const allNotes = data.flatMap((cat) => cat.notes);
        if (allNotes.length > 0 && selectedId === null) {
          setSelectedId(allNotes[0].id);
        }
      })
      .catch((err) => {
        console.error('카테고리 로딩 실패:', err);
      });
  }, []);

  useEffect(() => {
    if (selectedId === null) {
      setSelectedNote(null);
      return;
    }
    notesApi
      .getById(selectedId)
      .then(setSelectedNote)
      .catch(() => setSelectedNote(null));
  }, [selectedId]);

  const selectedChat = chatRooms.find((c) => c.id === selectedChatId) ?? null;

  const handleSaveNote = async (noteId: number, title: string, content: string) => {
    try {
      const categoryId = categories.find((cat) => cat.notes.some((n) => n.id === noteId))?.id;
      const updated = await notesApi.update(noteId, { title, content, categoryId });
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          notes: cat.notes.map((note) =>
            note.id === noteId
              ? { ...note, title: updated.title, updatedAt: updated.updatedAt }
              : note,
          ),
        })),
      );
    } catch (err) {
      console.error('노트 저장 실패:', err);
    }
  };

  const handleAddNote = async (categoryId: number) => {
    const userId = localStorage.getItem('userId') || '550e8400-e29b-41d4-a716-446655440000';
    const created = await notesApi.create({
      userId,
      title: '새 노트',
      content: '',
      categoryId,
    });
    const { content: _, ...noteItem } = created;
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, notes: [noteItem, ...cat.notes] } : cat,
      ),
    );
    setSelectedId(created.id);
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
    setChatRooms((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, title } : chat)));
  };

  const handleAddChat = (categoryId: number) => {
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
