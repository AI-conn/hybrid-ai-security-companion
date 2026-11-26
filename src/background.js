// Service worker — handles extension lifecycle
// Firebase AI Logic initialization happens in ai-engine.js (module scope)

console.log("Hybrid AI Security Companion: service worker started");

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "get-page-text") {
    // Grab page text for analysis
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript(
          { target: { tabId: tabs[0].id }, func: () => document.body.innerText.substring(0, 5000) },
          (results) => sendResponse({ text: results?.[0]?.result || "" })
        );
      }
    });
    return true; // async response
  }
});