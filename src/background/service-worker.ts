import { LOG_PREFIX } from "../common/constants";

chrome.runtime.onInstalled.addListener(() => {
  console.log(`${LOG_PREFIX} service worker installed`);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "PING") {
    sendResponse({ ok: true, source: "service-worker" });
    return true;
  }
  return false;
});
