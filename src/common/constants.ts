export const LOG_PREFIX = "[scriptwriter-chrome]";
export const DOCS_URL_RE = /^https:\/\/docs\.google\.com\/document\//;
export const ROOT_RETRY_MS = 750;
export const ROOT_MAX_RETRIES = 20;

// Known Google Docs selectors change over time.
// Keep this list centralized so we can debug root detection quickly.
export const EDITOR_ROOT_SELECTORS = [
  ".kix-appview-editor",
  ".kix-page-content-wrapper",
  ".kix-page",
  "[role='textbox']",
] as const;
