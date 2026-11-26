/* background.js — service worker. */

console.log("Security Companion: worker started");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "page-text") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript(
          { target: { tabId: tabs[0].id }, func: () => document.body.innerText.slice(0, 5000) },
          (r) => sendResponse({ text: r?.[0]?.result || "" })
        );
      }
    });
    return true;
  }
});