import React from "react";

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    if (match[2] !== undefined) {
      tokens.push(<strong key={`${keyPrefix}-b-${i}`}>{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      tokens.push(<em key={`${keyPrefix}-i-${i}`}>{match[3]}</em>);
    }
    lastIndex = match.index + match[0].length;
    i++;
  }
  if (lastIndex < text.length) tokens.push(text.slice(lastIndex));
  return tokens;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.split(/\n/);
  const blocks: React.ReactNode[] = [];
  let para: string[] = [];
  let listItems: string[] = [];

  const flushPara = () => {
    if (para.length) {
      const joined = para.join(" ");
      blocks.push(<p key={`p-${blocks.length}`}>{renderInline(joined, `p${blocks.length}`)}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (listItems.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`}>
          {listItems.map((li, idx) => (
            <li key={idx}>{renderInline(li, `li${blocks.length}-${idx}`)}</li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.trim() === "") {
      flushPara();
      flushList();
      continue;
    }
    if (/^\s*-\s+/.test(line)) {
      flushPara();
      listItems.push(line.replace(/^\s*-\s+/, ""));
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();

  return <div className="prose-ms">{blocks}</div>;
}
