// Change icon from colored to greyscale depending on whether or not thinkific has
// been detected
function setIconAndPopup(active: string, tabId: number) {
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

chrome.runtime.onMessage.addListener(({type, origin}, _, sendResponse) => {
  if (type !== 'signOut') return false;

  sendResponse();

  return true;
});

// Create a listener which handles when detectThinkific.js, which executes in the
// the same context as a tab, sends the results of of whether or not Shopify was
// detected
chrome.runtime.onMessage.addListener((event, sender) => {
  if (sender.tab && sender.tab.id && event.type === 'detect-thinkific') {
    setIconAndPopup(event.hasDetectedThinkific, sender.tab.id);
  }
});

// Create a listener which handles when the Sign In button is click from the popup
// or DevTools panel.
chrome.runtime.onMessage.addListener(({type, origin}, _, sendResponse) => {
  if (type !== 'authenticate') {
    return false;
  }

  sendResponse({success: true});

  return true;
});

// Listen for the 'request-user-info' event and respond to the messenger
// with a the given_name of the currently logged in user.
chrome.runtime.onMessage.addListener(({type, origin}, _, sendResponse) => {
  if (type !== 'request-user-name') return false;

  const name = window.Thinkific.current_user.full_name;

  sendResponse({name});

  return true;
});

// Listen for the 'request-auth-status' event and respond to the messenger
// with a boolean of user login status.
chrome.runtime.onMessage.addListener(({type, origin}, _, sendResponse) => {
  if (type !== 'request-auth-status') return false;

  if (window.Thinkific.current_user) {
    sendResponse({isLoggedIn: true});
  } else {
    sendResponse({isLoggedIn: false});
  }

  return true;
});
