import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import './tiptap.css';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const TipTapEditor = ({ content, onChange, placeholder }: TipTapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "입력하세요. '/' 로 명령어를 사용할 수 있습니다.",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'tiptap prose dark:prose-invert prose-sm max-w-none focus:outline-none min-h-[500px] px-8 py-5',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-950">
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapEditor;
