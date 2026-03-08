import { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';

interface Block {
  id: string;
  content: string;
  isEditing: boolean;
}

interface BlockEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

const BlockEditor = ({ initialContent, onChange }: BlockEditorProps) => {
  const [blocks, setBlocks] = useState<Block[]>(() => {
    if (!initialContent.trim()) {
      return [{ id: '1', content: '', isEditing: true }];
    }
    const lines = initialContent.split('\n');
    return lines.map((line, idx) => ({
      id: String(idx + 1),
      content: line,
      isEditing: false,
    }));
  });

  const inputRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  useEffect(() => {
    const content = blocks.map((b) => b.content).join('\n');
    onChange(content);
  }, [blocks, onChange]);

  const updateBlock = (id: string, content: string) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, content } : block)),
    );
  };

  const setBlockEditing = (id: string, isEditing: boolean) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, isEditing } : block)),
    );
  };

  const addNewBlock = (afterId: string) => {
    const index = blocks.findIndex((b) => b.id === afterId);
    const newBlock: Block = {
      id: String(Date.now()),
      content: '',
      isEditing: true,
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);

    setTimeout(() => {
      inputRefs.current[newBlock.id]?.focus();
    }, 0);
  };

  const mergeWithPreviousBlock = (id: string) => {
    const index = blocks.findIndex((b) => b.id === id);
    if (index <= 0) return;

    const currentBlock = blocks[index];
    const prevBlock = blocks[index - 1];
    const prevContentLength = prevBlock.content.length;

    setBlocks((prev) => {
      const newBlocks = [...prev];
      newBlocks[index - 1] = {
        ...prevBlock,
        content: prevBlock.content + currentBlock.content,
        isEditing: true,
      };
      newBlocks.splice(index, 1);
      return newBlocks;
    });

    setTimeout(() => {
      const textarea = inputRefs.current[prevBlock.id];
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(prevContentLength, prevContentLength);
      }
    }, 0);
  };

  const deleteBlock = (id: string) => {
    if (blocks.length === 1) {
      setBlocks([{ id: '1', content: '', isEditing: true }]);
      return;
    }

    const index = blocks.findIndex((b) => b.id === id);
    const newBlocks = blocks.filter((b) => b.id !== id);
    setBlocks(newBlocks);

    if (index > 0) {
      setTimeout(() => {
        const prevBlock = newBlocks[index - 1];
        const textarea = inputRefs.current[prevBlock.id];
        if (textarea) {
          textarea.focus();
          const length = prevBlock.content.length;
          textarea.setSelectionRange(length, length);
        }
        setBlockEditing(prevBlock.id, true);
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, blockId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setBlockEditing(blockId, false);
      addNewBlock(blockId);
    }

    if (e.key === 'Backspace') {
      const textarea = e.currentTarget;
      const cursorPosition = textarea.selectionStart;
      const block = blocks.find((b) => b.id === blockId);

      if (block && block.content === '') {
        e.preventDefault();
        deleteBlock(blockId);
      } else if (cursorPosition === 0 && block) {
        e.preventDefault();
        mergeWithPreviousBlock(blockId);
      }
    }
  };

  const handleBlockClick = (blockId: string) => {
    setBlockEditing(blockId, true);
    setTimeout(() => {
      inputRefs.current[blockId]?.focus();
    }, 0);
  };

  return (
    <div className="flex-1 px-6 py-4 overflow-y-auto bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto">
        {blocks.map((block) => (
          <div key={block.id} className="mb-1 min-h-[2rem]">
            {block.isEditing ? (
              <textarea
                ref={(el) => {
                  inputRefs.current[block.id] = el;
                }}
                value={block.content}
                onChange={(e) => updateBlock(block.id, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, block.id)}
                onBlur={() => setBlockEditing(block.id, false)}
                className="w-full bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white font-mono text-sm leading-relaxed min-h-[1.5rem]"
                placeholder="입력하세요 ('/' 로 명령어)"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '1.5rem',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
            ) : (
              <div
                onClick={() => handleBlockClick(block.id)}
                className="cursor-text min-h-[1.5rem] hover:bg-gray-50 dark:hover:bg-gray-900 rounded px-1 -mx-1 transition-colors"
              >
                {block.content.trim() === '' ? (
                  <div className="text-gray-400 dark:text-gray-600 text-sm">빈 줄</div>
                ) : (
                  <div className="prose dark:prose-invert prose-sm max-w-none prose-p:my-0 prose-headings:my-1 prose-ul:my-0 prose-ol:my-0 prose-li:my-0">
                    <Markdown>{block.content}</Markdown>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockEditor;
