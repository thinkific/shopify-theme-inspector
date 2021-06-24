// Change icon from colored to greyscale depending on whether or not thinkific has
// been detected
function setIcon(active: string, tabId: number) {
  const iconType = active ? 'thinkific' : 'thinkific-dimmed';
  chrome.pageAction.setIcon({
    tabId,
    path: {
      '16': `images/16-${iconType}.png`,
      '32': `images/32-${iconType}.png`,
      '48': `images/48-${iconType}.png`,
      '128': `images/128-${iconType}.png`,
    },
  });

  chrome.pageAction.show(tabId);
}

// Create a listener which handles when detectThinkific.js, which executes in the
// the same context as a tab, sends the results of of whether or not Shopify was
// detected
chrome.runtime.onMessage.addListener((event, sender) => {
  if (sender.tab && sender.tab.id && event.type === 'detect-thinkific') {
    setIcon(event.hasDetectedThinkific, sender.tab.id);
  }
});
