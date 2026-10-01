import React from "react";

// Inline regex pattern matching:
// 1: Safe Markdown link [text](url)
// 1: Safe Markdown link label, 2: url
// 3: Bold-Italic ***text***
// 4: Bold **text**
// 5: Bold __text__
// 6: Italic *text*
// 7: Italic _text_ (surrounded by whitespace/boundaries)
// 8: Inline code `text`
const INLINE_REGEX =
  /(?:\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|[^\s)]+)\))|(?:\*\*\*([^*]+?)\*\*\*)|(?:\*\*([^*]+?)\*\*)|(?:__([^_]+?)__)|(?:\*([^*]+?)\*)|(?:(?<=\s|^)_([^_]+?)_(?=\s|$|[.,:;!?]))|(?:`([^`]+?)`)/g;

/**
 * Validate and sanitize URLs to prevent javascript:, data:, and other malicious schemes
 */
function sanitizeUrl(rawUrl) {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  const lower = trimmed.toLowerCase();

  // Disallow executable and unsafe protocols
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return null;
  }

  // Allow standard web protocols and relative paths
  if (
    lower.startsWith("https://") ||
    lower.startsWith("http://") ||
    lower.startsWith("mailto:") ||
    lower.startsWith("tel:") ||
    lower.startsWith("/") ||
    lower.startsWith("#")
  ) {
    return trimmed;
  }

  // Format bare web domains safely
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return null;
}

/**
 * Render inline markdown elements safely into React elements
 */
function renderInline(text) {
  if (!text) return null;
  const elements = [];
  let lastIndex = 0;
  let match;

  INLINE_REGEX.lastIndex = 0;

  while ((match = INLINE_REGEX.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      elements.push(text.slice(lastIndex, matchIndex));
    }

    const key = `inline-${elements.length}-${matchIndex}`;

    if (match[1]) {
      // Group 1: label, Group 2: url
      const label = match[1];
      const url = match[2];
      const safeUrl = sanitizeUrl(url);

      if (safeUrl) {
        elements.push(
          <a
            key={key}
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 break-all inline-flex items-center gap-0.5 transition-colors cursor-pointer"
          >
            {label}
          </a>
        );
      } else {
        // Disallowed protocol: render plain text label
        elements.push(label);
      }
    } else if (match[3]) {
      // Group 3: Bold-Italic ***text***
      elements.push(
        <strong key={key} className="font-bold text-white">
          <em className="italic text-slate-200">{match[3]}</em>
        </strong>
      );
    } else if (match[4] || match[5]) {
      // Group 4: **text**, Group 5: __text__
      const boldText = match[4] || match[5];
      elements.push(
        <strong key={key} className="font-semibold text-white">
          {boldText}
        </strong>
      );
    } else if (match[6] || match[7]) {
      // Group 6: *text*, Group 7: _text_
      const italicText = match[6] || match[7];
      elements.push(
        <em key={key} className="italic text-slate-300">
          {italicText}
        </em>
      );
    } else if (match[8]) {
      // Group 8: `code`
      elements.push(
        <code
          key={key}
          className="px-1.5 py-0.5 rounded bg-slate-900/90 text-cyan-300 font-mono text-[12px] border border-slate-700/60 break-all"
        >
          {match[8]}
        </code>
      );
    }

    lastIndex = INLINE_REGEX.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements.length === 1 ? elements[0] : elements;
}

/**
 * Parse markdown text into structured blocks (headings, code blocks, lists, paragraphs)
 */
function parseBlocks(markdown) {
  if (!markdown) return [];
  const lines = markdown.split(/\r?\n/);
  const blocks = [];

  let currentCodeBlock = null;
  let currentList = null; // { type: 'ul' | 'ol', items: [] }
  let currentParagraphLines = [];

  function flushParagraph() {
    if (currentParagraphLines.length > 0) {
      blocks.push({
        type: "paragraph",
        lines: [...currentParagraphLines],
      });
      currentParagraphLines = [];
    }
  }

  function flushList() {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  }

  function flushAll() {
    flushParagraph();
    flushList();
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    // 1. Fenced Code Block delimiter
    if (rawLine.trim().startsWith("```")) {
      if (currentCodeBlock) {
        blocks.push({
          type: "code-block",
          lang: currentCodeBlock.lang,
          code: currentCodeBlock.lines.join("\n"),
        });
        currentCodeBlock = null;
      } else {
        flushAll();
        currentCodeBlock = {
          lang: rawLine.trim().slice(3).trim(),
          lines: [],
        };
      }
      continue;
    }

    if (currentCodeBlock) {
      currentCodeBlock.lines.push(rawLine);
      continue;
    }

    // 2. Horizontal Rule (---, ***, ___)
    if (/^\s*([-*_]){3,}\s*$/.test(rawLine)) {
      flushAll();
      blocks.push({ type: "hr" });
      continue;
    }

    // 3. Empty line
    if (!rawLine.trim()) {
      flushParagraph();
      continue;
    }

    // 4. Headings (#, ##, ###, ####, #####, ######)
    const headingMatch = rawLine.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushAll();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      continue;
    }

    // 5. Unordered list item (*, -, +, •)
    const ulMatch = rawLine.match(/^(\s*)[*+\-•]\s+(.+)$/);
    if (ulMatch) {
      flushParagraph();
      const indent = ulMatch[1].length;
      if (currentList && currentList.type !== "ul") {
        flushList();
      }
      if (!currentList) {
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push({
        text: ulMatch[2].trim(),
        isNested: indent >= 2,
      });
      continue;
    }

    // 6. Ordered list item (1., 2., etc.)
    const olMatch = rawLine.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (olMatch) {
      flushParagraph();
      const indent = olMatch[1].length;
      if (currentList && currentList.type !== "ol") {
        flushList();
      }
      if (!currentList) {
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push({
        number: olMatch[2],
        text: olMatch[3].trim(),
        isNested: indent >= 2,
      });
      continue;
    }

    // 7. Indented continuation of list item
    if (currentList && currentList.items.length > 0 && /^\s{2,}\S/.test(rawLine)) {
      currentList.items[currentList.items.length - 1].text += " " + rawLine.trim();
      continue;
    }

    // 8. Regular paragraph line
    flushList();
    currentParagraphLines.push(rawLine);
  }

  flushAll();
  return blocks;
}

/**
 * SafeMarkdown Component
 * Safely renders Gemini AI markdown responses into React DOM nodes without dangerouslySetInnerHTML.
 */
export default function SafeMarkdown({ content, className = "" }) {
  if (!content) return null;
  const blocks = parseBlocks(content);

  const headingClasses = {
    1: "text-base font-bold text-white mt-3 mb-1.5",
    2: "text-sm font-bold text-white mt-2.5 mb-1",
    3: "text-xs font-bold text-cyan-300 uppercase tracking-wide mt-2 mb-1",
    4: "text-xs font-bold text-slate-200 mt-1.5 mb-0.5",
    5: "text-xs font-semibold text-slate-300 mt-1 mb-0.5",
    6: "text-xs font-semibold text-slate-400 mt-1 mb-0.5",
  };

  return (
    <div className={`space-y-2 text-sm leading-relaxed text-slate-200 ${className}`}>
      {blocks.map((block, bIdx) => {
        const bKey = `block-${bIdx}`;

        if (block.type === "hr") {
          return <hr key={bKey} className="my-2.5 border-slate-700/60" />;
        }

        if (block.type === "heading") {
          const Tag = block.level === 1 ? "h3" : block.level === 2 ? "h4" : "h5";
          return (
            <Tag key={bKey} className={headingClasses[block.level] || headingClasses[3]}>
              {renderInline(block.text)}
            </Tag>
          );
        }

        if (block.type === "ul") {
          return (
            <ul key={bKey} className="my-1.5 space-y-1.5 pl-4 list-disc marker:text-cyan-400">
              {block.items.map((item, iIdx) => (
                <li
                  key={`ul-item-${iIdx}`}
                  className={`leading-relaxed text-slate-200 ${
                    item.isNested ? "ml-4 list-[circle] marker:text-cyan-500/70" : "pl-0.5"
                  }`}
                >
                  {renderInline(item.text)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ol") {
          return (
            <ol
              key={bKey}
              className="my-1.5 space-y-1.5 pl-5 list-decimal marker:text-cyan-400 font-medium"
            >
              {block.items.map((item, iIdx) => (
                <li
                  key={`ol-item-${iIdx}`}
                  className={`leading-relaxed text-slate-200 font-normal ${
                    item.isNested ? "ml-4" : "pl-0.5"
                  }`}
                >
                  {renderInline(item.text)}
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === "code-block") {
          return (
            <div
              key={bKey}
              className="my-2.5 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden text-xs"
            >
              {block.lang && (
                <div className="px-3 py-1 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
                  {block.lang}
                </div>
              )}
              <pre className="p-3 overflow-x-auto font-mono text-cyan-200 leading-relaxed">
                <code>{block.code}</code>
              </pre>
            </div>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={bKey} className="leading-relaxed">
              {block.lines.map((line, lIdx) => (
                <React.Fragment key={`line-${lIdx}`}>
                  {lIdx > 0 && <br />}
                  {renderInline(line)}
                </React.Fragment>
              ))}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}
