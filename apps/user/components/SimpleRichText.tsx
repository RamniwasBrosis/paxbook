import * as React from "react";

/**
 * Renders CMS page text with a few plain-text conventions, without ever interpreting HTML:
 * "## Heading", "### Sub-heading", lines starting with "- " as a bullet list, "1. " as a numbered
 * list, and a blank line between paragraphs. Plain text with none of these looks as before.
 */
export function SimpleRichText({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) blocks.push(<p key={blocks.length} className="mt-4 leading-relaxed">{para.join(" ")}</p>);
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const items = list.items.map((it, i) => <li key={i}>{it}</li>);
    blocks.push(
      list.ordered ? (
        <ol key={blocks.length} className="mt-3 list-decimal space-y-1.5 pl-6">
          {items}
        </ol>
      ) : (
        <ul key={blocks.length} className="mt-3 list-disc space-y-1.5 pl-6 marker:text-slate-300">
          {items}
        </ul>
      ),
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    const h2 = line.match(/^##\s+(.*)$/);
    const h3 = line.match(/^###\s+(.*)$/);
    const bullet = line.match(/^[-•]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (h3 || h2) {
      flushPara();
      flushList();
      blocks.push(
        h3 ? (
          <h3 key={blocks.length} className="mt-6 font-display text-lg font-bold text-navy-deep">
            {h3[1]}
          </h3>
        ) : (
          <h2 key={blocks.length} className="mt-9 font-display text-2xl font-extrabold text-navy-deep first:mt-0">
            {h2![1]}
          </h2>
        ),
      );
    } else if (bullet || numbered) {
      flushPara();
      const ordered = Boolean(numbered);
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push((bullet ?? numbered)![1]!);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return <>{blocks}</>;
}
