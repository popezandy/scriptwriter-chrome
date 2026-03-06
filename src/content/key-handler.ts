import { log } from "../common/logger";
import type { ParagraphRecord } from "../common/types";

export type KeyHandlerContext = {
  getParagraphs: () => ParagraphRecord[];
};

function shouldHandle(event: KeyboardEvent): boolean {
  return event.key === "Tab" || event.key === "Enter";
}

export function attachKeyHandler(context: KeyHandlerContext): void {
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (!shouldHandle(event)) return;

    const target = event.target;
    const isEditable =
      target instanceof HTMLElement &&
      (target.isContentEditable || target.getAttribute("role") === "textbox" || !!target.closest("[contenteditable='true'], [role='textbox']"));

    if (!isEditable) return;

    if (event.key === "Tab") {
      event.preventDefault();
      log("Tab intercepted", {
        shiftKey: event.shiftKey,
        paragraphCount: context.getParagraphs().length,
      });
      return;
    }

    if (event.key === "Enter") {
      log("Enter observed", {
        shiftKey: event.shiftKey,
        paragraphCount: context.getParagraphs().length,
      });
    }
  }, true);
}
