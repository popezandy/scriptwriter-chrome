import { DOCS_URL_RE, EDITOR_ROOT_SELECTORS, ROOT_MAX_RETRIES, ROOT_RETRY_MS } from "../common/constants";
import { log, warn } from "../common/logger";

function looksEditable(root: Element | null): root is HTMLElement {
  if (!(root instanceof HTMLElement)) return false;
  if (root.matches("[contenteditable='true'], [role='textbox']")) return true;
  return root.querySelector("[contenteditable='true'], [role='textbox']") instanceof HTMLElement;
}

function findRootCandidate(): HTMLElement | null {
  for (const selector of EDITOR_ROOT_SELECTORS) {
    const found = document.querySelector(selector);
    if (looksEditable(found)) {
      return found;
    }
  }

  // Fallback: choose the first editable ancestor we can find.
  const editable = document.querySelector("[contenteditable='true'], [role='textbox']");
  return editable instanceof HTMLElement ? editable : null;
}

export async function waitForDocsEditorRoot(): Promise<HTMLElement | null> {
  if (!DOCS_URL_RE.test(window.location.href)) {
    warn("not a supported Google Docs document URL", window.location.href);
    return null;
  }

  let attempts = 0;
  while (attempts < ROOT_MAX_RETRIES) {
    const root = findRootCandidate();
    if (root) {
      log("editor root detected", root);
      return root;
    }
    attempts += 1;
    await new Promise((resolve) => window.setTimeout(resolve, ROOT_RETRY_MS));
  }

  warn("failed to detect editor root");
  return null;
}
