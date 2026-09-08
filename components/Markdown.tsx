import { Fragment, type ReactNode } from 'react';

/**
 * Renders the markdown subset the lesson content actually uses -- headings,
 * paragraphs, lists, bold/italic, inline code, fenced code and links.
 *
 * Built as React elements rather than dangerouslySetInnerHTML so imported
 * lesson text can never inject markup into the page.
 */

/** Inline: `code`, **bold**, *italic*, [text](url). */
function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyBase}-i${i++}`;

    if (token.startsWith('`')) {
      nodes.push(
        <code key={key} className="gfk-code">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('**')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('[')) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch && /^https?:\/\//i.test(linkMatch[2])) {
        nodes.push(
          <a key={key} href={linkMatch[2]} target="_blank" rel="noopener noreferrer">
            {linkMatch[1]}
          </a>,
        );
      } else {
        nodes.push(linkMatch ? linkMatch[1] : token);
      }
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ source }: { source: string | string[] }) {
  const text = Array.isArray(source) ? source.join('\n') : source;
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];

  let listBuffer: string[] = [];
  let codeBuffer: string[] | null = null;
  let key = 0;

  const flushList = () => {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul${key++}`} className="gfk-list">
        {listBuffer.map((item, idx) => (
          <li key={idx}>{renderInline(item, `li${key}-${idx}`)}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  for (const line of lines) {
    // Fenced code blocks swallow everything until the closing fence.
    if (line.trimStart().startsWith('```')) {
      if (codeBuffer === null) {
        flushList();
        codeBuffer = [];
      } else {
        blocks.push(
          <pre key={`pre${key++}`} className="gfk-pre">
            <code>{codeBuffer.join('\n')}</code>
          </pre>,
        );
        codeBuffer = null;
      }
      continue;
    }
    if (codeBuffer !== null) {
      codeBuffer.push(line);
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      flushList();
      const level = heading[1].length;
      const content = renderInline(heading[2], `h${key}`);
      const Tag = (['h2', 'h3', 'h4', 'h5'] as const)[level - 1];
      blocks.push(
        <Tag key={`h${key++}`} className="gfk-heading">
          {content}
        </Tag>,
      );
      continue;
    }

    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      listBuffer.push(bullet[1]);
      continue;
    }

    if (line.trim() === '') {
      flushList();
      continue;
    }

    flushList();
    blocks.push(
      <p key={`p${key++}`} className="gfk-p">
        {renderInline(line, `p${key}`)}
      </p>,
    );
  }

  flushList();
  if (codeBuffer !== null && codeBuffer.length > 0) {
    blocks.push(
      <pre key={`pre${key++}`} className="gfk-pre">
        <code>{codeBuffer.join('\n')}</code>
      </pre>,
    );
  }

  return <Fragment>{blocks}</Fragment>;
}
