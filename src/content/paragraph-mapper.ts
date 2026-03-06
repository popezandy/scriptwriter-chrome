import type { ParagraphRecord, FormattingFingerprint } from "../common/types";

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function fingerprintFor(node: HTMLElement): FormattingFingerprint {
  const style = window.getComputedStyle(node);
  const text = normalizeText(node.innerText || node.textContent || "");
  const alignValue = style.textAlign;
  const align =
    alignValue === "right" ? "right" :
    alignValue === "center" ? "center" :
    alignValue === "left" || alignValue === "start" ? "left" :
    "unknown";

  return {
    align,
    indentStart: null,
    indentEnd: null,
    isUppercaseLike: text.length > 0 && text === text.toUpperCase(),
  };
}

function paragraphId(index: number, text: string): string {
  const prefix = text.slice(0, 24);
  return `${index}:${prefix}`;
}

function isVisible(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function scanParagraphs(root: HTMLElement): ParagraphRecord[] {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>("p, div"));
  const records: ParagraphRecord[] = [];

  for (const [index, node] of nodes.entries()) {
    const text = normalizeText(node.innerText || node.textContent || "");
    if (!text) continue;

    records.push({
      id: paragraphId(index, text),
      text,
      indexHint: index,
      isVisible: isVisible(node),
      node,
      formattingFingerprint: fingerprintFor(node),
    });
  }

  return records;
}
