let hasDetectedThinkific = false;

if (typeof window.Thinkific === 'object') {
  hasDetectedThinkific = true;
}

chrome.runtime.sendMessage({
  type: 'detect-thinkific',
  hasDetectedThinkific,
});
