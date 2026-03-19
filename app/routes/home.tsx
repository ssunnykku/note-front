import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import Sidebar from '~/features/note/Sidebar';
import NoteContent from '~/features/note/NoteContent';
import AiChatPanel from '~/features/ai/AiChatPanel';
import { categoriesApi } from '~/lib/api/categories';
import { notesApi } from '~/lib/api/notes';
import type { Note, Category, ChatRoom } from '~/features/note/types';

interface LayoutContext {
  isMobile: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function meta() {
  return [{ title: 'Note' }, { name: 'description', content: '노트 작성 서비스' }];
}

export default function Home() {
  const { isMobile, sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContext>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'editor' | 'chat'>('list');
  const [pendingNoteIds, setPendingNoteIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const userId = localStorage.getItem('userId') || '550e8400-e29b-41d4-a716-446655440000';

    categoriesApi
      .getAll(userId)
      .then((data) => {
        setCategories(data);
        const allNotes = data.flatMap((cat) => cat.notes);
        if (allNotes.length > 0) {
          setSelectedId((prev) => prev ?? allNotes[0].id);
        }
      })
      .catch((err) => {
        console.error('카테고리 로딩 실패:', err);
      });
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    // 아직 서버에 생성되지 않은 임시 노트는 API 호출하지 않음
    if (pendingNoteIds.has(selectedId)) return;
    notesApi
      .getById(selectedId)
      .then(setSelectedNote)
      .catch(() => setSelectedNote(null));
  }, [selectedId, pendingNoteIds]);

  const selectedChat = chatRooms.find((c) => c.id === selectedChatId) ?? null;

  const handleSaveNote = async (noteId: number, title: string, content: string) => {
    try {
      const categoryId = categories.find((cat) => cat.notes.some((n) => n.id === noteId))?.id;

      if (pendingNoteIds.has(noteId)) {
        // 아직 서버에 생성되지 않은 노트 → create API 호출
        const userId =
          localStorage.getItem('userId') || '550e8400-e29b-41d4-a716-446655440000';
        const created = await notesApi.create({
          userId,
          title,
          content,
          categoryId: categoryId!,
        });
        // pending에서 제거
        setPendingNoteIds((prev) => {
          const next = new Set(prev);
          next.delete(noteId);
          return next;
        });
        // 카테고리 내 임시 노트를 실제 노트로 교체
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            notes: cat.notes.map((note) =>
              note.id === noteId
                ? {
                    ...note,
                    id: created.id,
                    title: created.title,
                    updatedAt: created.updatedAt,
                  }
                : note,
            ),
          })),
        );
        setSelectedId(created.id);
        setSelectedNote((prev) =>
          prev && prev.id === noteId
            ? { ...created }
            : prev,
        );
      } else {
        // 기존 노트 → update API 호출
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
        setSelectedNote((prev) =>
          prev && prev.id === noteId
            ? { ...prev, title: updated.title, updatedAt: updated.updatedAt }
            : prev,
        );
      }
    } catch (err) {
      console.error('노트 저장 실패:', err);
    }
  };

  const handleAddNote = (categoryId: number) => {
    const userId = localStorage.getItem('userId') || '550e8400-e29b-41d4-a716-446655440000';
    const tempId = -Date.now();
    const now = new Date().toISOString();
    const noteItem = {
      id: tempId,
      userId,
      title: '새 노트',
      createdAt: now,
      updatedAt: now,
    };
    setPendingNoteIds((prev) => new Set(prev).add(tempId));
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, notes: [noteItem, ...cat.notes] } : cat,
      ),
    );
    setSelectedId(tempId);
    setSelectedNote({
      id: tempId,
      userId,
      title: '새 노트',
      content: '',
      createdAt: now,
      updatedAt: now,
    });
    if (isMobile) setMobileView('editor');
  };

  const handleAddCategory = async (name: string) => {
    try {
      const created = await categoriesApi.create({ name });
      setCategories((prev) => [...prev, { ...created, notes: created.notes ?? [] }]);
    } catch (err) {
      console.error('카테고리 생성 실패:', err);
    }
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
    if (isMobile) setMobileView('chat');
  };

  const handleSelectNote = (id: number) => {
    // 편집하지 않은 빈 새 노트는 목록에서 제거
    if (selectedId !== null && selectedId !== id && pendingNoteIds.has(selectedId)) {
      const pendingId = selectedId;
      setPendingNoteIds((prev) => {
        const next = new Set(prev);
        next.delete(pendingId);
        return next;
      });
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          notes: cat.notes.filter((n) => n.id !== pendingId),
        })),
      );
    }
    setSelectedId(id);
    setIsChatOpen(false);
    setSelectedChatId(null);
    if (isMobile) {
      setMobileView('editor');
      setSidebarOpen(false);
    }
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    if (isMobile) {
      setMobileView('chat');
      setSidebarOpen(false);
    }
  };

  const handleMobileBack = () => {
    setMobileView('list');
  };

  // 모바일 사이드바 오버레이 (에디터/채팅 뷰에서 햄버거로 열 때)
  const mobileSidebarOverlay = isMobile && sidebarOpen && mobileView !== 'list' && (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => setSidebarOpen(false)}
      />
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-gray-50 dark:bg-gray-900 shadow-xl pt-14">
        <Sidebar
          categories={categories}
          selectedId={selectedId}
          onSelect={handleSelectNote}
          onAddNote={handleAddNote}
          isChatOpen={isChatOpen}
          onToggleChat={handleToggleChat}
          chatRooms={chatRooms}
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
          onAddChat={handleAddChat}
          onRenameChat={handleRenameChat}
          onAddCategory={handleAddCategory}
          pendingNoteIds={pendingNoteIds}
          forceMobile
        />
      </aside>
    </>
  );

  // 모바일 레이아웃
  if (isMobile) {
    return (
      <>
        {mobileSidebarOverlay}
        {mobileView === 'list' ? (
          <Sidebar
            categories={categories}
            selectedId={selectedId}
            onSelect={handleSelectNote}
            onAddNote={handleAddNote}
            isChatOpen={isChatOpen}
            onToggleChat={handleToggleChat}
            chatRooms={chatRooms}
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
            onAddChat={handleAddChat}
            onRenameChat={handleRenameChat}
          onAddCategory={handleAddCategory}
          pendingNoteIds={pendingNoteIds}
            forceMobile
          />
        ) : mobileView === 'editor' ? (
          <NoteContent note={selectedNote} onSave={handleSaveNote} onBack={handleMobileBack} isPending={selectedNote ? pendingNoteIds.has(selectedNote.id) : false} />
        ) : isChatOpen && selectedChat ? (
          <AiChatPanel
            chatId={selectedChat.id}
            chatTitle={selectedChat.title}
            onClose={() => setSelectedChatId(null)}
            onBack={handleMobileBack}
          />
        ) : (
          <NoteContent note={selectedNote} onSave={handleSaveNote} onBack={handleMobileBack} isPending={selectedNote ? pendingNoteIds.has(selectedNote.id) : false} />
        )}
      </>
    );
  }

  // 데스크톱/태블릿 레이아웃
  return (
    <>
      <Sidebar
        categories={categories}
        selectedId={selectedId}
        onSelect={handleSelectNote}
        onAddNote={handleAddNote}
        onAddCategory={handleAddCategory}
        pendingNoteIds={pendingNoteIds}
        isChatOpen={isChatOpen}
        onToggleChat={handleToggleChat}
        chatRooms={chatRooms}
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
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
        <NoteContent note={selectedNote} onSave={handleSaveNote} isPending={selectedNote ? pendingNoteIds.has(selectedNote.id) : false} />
      )}
    </>
  );
}
