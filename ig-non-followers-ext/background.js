chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SCAN_COMPLETE") {
    chrome.tabs.create({ url: chrome.runtime.getURL("results.html") });
  }
});
