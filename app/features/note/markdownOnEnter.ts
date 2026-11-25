import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import { marked } from 'marked';

type Doc = Editor['state']['doc'];

// 줄 시작 문법(제목·목록·인용·코드펜스·구분선) 또는 줄 안 문법(굵게·링크·인라인 코드)
export const MARKDOWN_PATTERN =
  /^(#{1,6}\s|\s*[-*+]\s|\s*\d+\.\s|>\s|```|(-{3,}|\*{3,})\s*$)|\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^)\n]+\)|`[^`\n]+`/m;

const FENCE = /^```/;
const LIST_LINE = /^\s*([-*+]|\d+\.)\s/;
const QUOTE_LINE = /^>\s?/;

const textAt = (doc: Doc, index: number) => {
  if (index < 0 || index >= doc.childCount) return null;
  const node = doc.child(index);
  return node.type.name === 'paragraph' ? node.textContent : null;
};

const lineKind = (text: string | null) => {
  if (text === null) return null;
  if (LIST_LINE.test(text)) return 'list';
  if (QUOTE_LINE.test(text)) return 'quote';
  return null;
};

const findFenceEnd = (doc: Doc, index: number, step: 1 | -1) => {
  for (let i = index + step; i >= 0 && i < doc.childCount; i += step) {
    const text = textAt(doc, i);
    if (text === null) return null;
    if (FENCE.test(text)) return i;
  }
  return null;
};

// 붙여넣은 여러 줄은 줄마다 문단이 되므로, 목록·인용·코드펜스는 이어진 문단을 묶어서 변환한다
const findMarkdownRange = (doc: Doc, index: number) => {
  const text = textAt(doc, index);
  if (text === null) return null;

  if (FENCE.test(text)) {
    const forward = findFenceEnd(doc, index, 1);
    if (forward !== null) return { start: index, end: forward };
    const backward = findFenceEnd(doc, index, -1);
    return backward === null ? null : { start: backward, end: index };
  }

  const kind = lineKind(text);
  if (kind) {
    let start = index;
    let end = index;
    while (lineKind(textAt(doc, start - 1)) === kind) start -= 1;
    while (lineKind(textAt(doc, end + 1)) === kind) end += 1;
    return { start, end };
  }

  return MARKDOWN_PATTERN.test(text) ? { start: index, end: index } : null;
};

const MarkdownOnEnter = Extension.create({
  name: 'markdownOnEnter',
  // 목록·코드블록 확장의 Enter 처리보다 먼저 봐야 한다
  priority: 1000,

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { selection, doc } = editor.state;
        const { $from, empty } = selection;
        if (!empty || $from.depth !== 1) return false;
        if ($from.parent.type.name !== 'paragraph') return false;
        // 줄 중간의 Enter는 줄 나누기로 남겨 둔다
        if ($from.parentOffset !== $from.parent.content.size) return false;

        const range = findMarkdownRange(doc, $from.index(0));
        if (!range) return false;

        let from = 0;
        for (let i = 0; i < range.start; i += 1) from += doc.child(i).nodeSize;
        let to = from;
        const lines: string[] = [];
        for (let i = range.start; i <= range.end; i += 1) {
          to += doc.child(i).nodeSize;
          lines.push(doc.child(i).textContent);
        }

        const html = marked.parse(lines.join('\n'), { async: false });
        return editor.chain().insertContentAt({ from, to }, html).run();
      },
    };
  },
});

export default MarkdownOnEnter;
