document.getElementById('scanBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes("instagram.com")) {
    const status = document.getElementById('status');
    status.textContent = "Please open Instagram first!";
    status.className = "error";
    return;
  }

  const btn = document.getElementById('scanBtn');
  const status = document.getElementById('status');
  btn.disabled = true;
  btn.textContent = "Scanning...";
  status.textContent = "This might take a minute...";
  status.className = "";

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SCAN_COMPLETE") {
    // Background script opens the new tab. We just close popup or show success.
    window.close();
  } else if (request.type === "SCAN_ERROR") {
    const btn = document.getElementById('scanBtn');
    const status = document.getElementById('status');
    btn.disabled = false;
    btn.textContent = "Scan Now";
    status.textContent = request.message;
    status.className = "error";
  } else if (request.type === "SCAN_PROGRESS") {
    document.getElementById('status').textContent = request.message;
  }
});
