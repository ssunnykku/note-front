import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',
  hr: '---',
});

turndown.addRule('strike', {
  filter: ['s', 'del'],
  replacement: (content) => `~~${content}~~`,
});

// turndown 기본값은 글머리 뒤에 공백 3칸을 넣어 다른 앱에 붙이면 들여쓰기가 어긋난다
// TipTap은 항목마다 <p>를 넣으므로 빈 줄을 지워야 항목 사이가 벌어지지 않는다
turndown.addRule('listItem', {
  filter: 'li',
  replacement: (content, node, options) => {
    const parent = node.parentNode as HTMLElement | null;
    let prefix = `${options.bulletListMarker} `;
    if (parent?.nodeName === 'OL') {
      const start = Number(parent.getAttribute('start') ?? 1);
      prefix = `${start + Array.prototype.indexOf.call(parent.children, node)}. `;
    }
    const body = content
      .trim()
      .replace(/\n\s*\n/g, '\n')
      .replace(/\n/g, `\n${' '.repeat(prefix.length)}`);
    return prefix + body + (node.nextSibling ? '\n' : '');
  },
});

const cellText = (cell: Element) =>
  turndown.turndown(cell.innerHTML).replace(/\n+/g, ' ').replace(/\|/g, '\\|').trim();

// 마크다운 표는 머리줄이 꼭 있어야 하므로 첫 줄을 머리줄로 쓴다
turndown.addRule('table', {
  filter: 'table',
  replacement: (_content, node) => {
    const rows = Array.from((node as HTMLTableElement).rows).map((row) =>
      Array.from(row.cells).map(cellText),
    );
    if (rows.length === 0) return '';
    const width = Math.max(...rows.map((row) => row.length));
    const line = (cells: string[]) =>
      `| ${Array.from({ length: width }, (_, i) => cells[i] ?? '').join(' | ')} |`;
    const separator = `| ${Array(width).fill('---').join(' | ')} |`;
    const [head, ...body] = rows;
    return `\n\n${[line(head), separator, ...body.map(line)].join('\n')}\n\n`;
  },
});

const htmlToMarkdown = (html: string) => turndown.turndown(html);

export default htmlToMarkdown;
