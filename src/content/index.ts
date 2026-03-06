import { log, warn } from "../common/logger";
import { waitForDocsEditorRoot } from "./docs-root";
import { scanParagraphs } from "./paragraph-mapper";
import { attachKeyHandler } from "./key-handler";

async function boot(): Promise<void> {
  log("content script booting");

  const root = await waitForDocsEditorRoot();
  if (!root) {
    warn("boot aborted: no docs editor root");
    return;
  }

  let paragraphs = scanParagraphs(root);
  log("initial paragraph scan", { count: paragraphs.length });

  attachKeyHandler({
    getParagraphs: () => paragraphs,
  });

  const observer = new MutationObserver(() => {
    paragraphs = scanParagraphs(root);
  });

  observer.observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  log("scriptwriter spine ready");
}

void boot();
