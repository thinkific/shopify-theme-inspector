import {env, RenderBackend} from './env';
import {isDev, Oauth2} from './utils';

const COLLABORATORS_SCOPE =
  'https://api.shopify.com/auth/partners.collaborator-relationships.readonly';
let shopifyEmployee = false;
let renderBackend = RenderBackend.StorefrontRenderer;

function getOauth2Client(origin: string) {
  const identityDomain = isDev(origin)
    ? env.DEV_OAUTH2_DOMAIN
    : env.OAUTH2_DOMAIN;
  const clientId = isDev(origin)
    ? env.DEV_OAUTH2_CLIENT_ID
    : env.OAUTH2_CLIENT_ID;
  const clientAuthParams = [
    [
      'scope',
      `openid profile ${
        shopifyEmployee === true ? 'employee' : ''
      } ${Object.values(env.DEVTOOLS_SCOPE).join(' ')} ${COLLABORATORS_SCOPE}`,
    ],
  ];

  return new Oauth2(clientId, identityDomain, {
    clientAuthParams,
  });
}

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

function getSubjectId(oauth: Oauth2, origin: string) {
  if (isDev(origin)) {
    return oauth.fetchClientId(env.DEV_OAUTH2_SUBJECT_NAME[renderBackend]);
  }
  return Promise.resolve(env.OAUTH2_SUBJECT_ID[renderBackend]);
}

chrome.runtime.onMessage.addListener(({type, origin}, _, sendResponse) => {
  if (type !== 'signOut') return false;

  getOauth2Client(origin)
    .logoutUser()
    .then(() => {
      sendResponse();
    })
    .catch(({message}) => {
      sendResponse({error: message});
    });

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

  getOauth2Client(origin)
    .authenticate()
    .then(() => {
      sendResponse({success: true});
    })
    .catch(error => {
      console.log('Authentication Error:', error.message);
      sendResponse({success: false, error});
    });

  return true;
});

// Listen for 'request-core-access-token' event and respond to the messenger
// with a valid access token. This may trigger a login popup window if needed.
chrome.runtime.onMessage.addListener(
  ({type, origin, isCore}, _, sendResponse) => {
    if (type !== 'request-core-access-token') {
      return false;
    }

    renderBackend = isCore
      ? RenderBackend.Core
      : RenderBackend.StorefrontRenderer;

    const params = [
      [
        'scope',
        `${shopifyEmployee === true ? 'employee' : ''} ${
          env.DEVTOOLS_SCOPE[renderBackend]
        } ${COLLABORATORS_SCOPE}`,
      ],
    ];

    // SFR does not need a destination.
    const destination =
      renderBackend === RenderBackend.Core ? `${origin}/admin` : '';

    const oauth = getOauth2Client(origin);

    getSubjectId(oauth, origin)
      .then(subjectId => {
        return oauth.getSubjectAccessToken(destination, subjectId, params);
      })
      .then(token => {
        sendResponse({token});
      })
      .catch(error => {
        sendResponse({error});
      });

    return true;
  },
);

// Listen for the 'request-user-info' event and respond to the messenger
// with a the given_name of the currently logged in user.
chrome.runtime.onMessage.addListener(({type, origin}, _, sendResponse) => {
  if (type !== 'request-user-name') return false;

  getOauth2Client(origin)
    .getUserInfo()
    .then(userInfo => {
      const name = userInfo.given_name;
      sendResponse({name});
    })
    .catch(error => {
      sendResponse({error});
    });

  return true;
});

// Listen for the 'request-auth-status' event and respond to the messenger
// with a boolean of user login status.
chrome.runtime.onMessage.addListener(({type, origin}, _, sendResponse) => {
  if (type !== 'request-auth-status') return false;

  getOauth2Client(origin)
    .hasValidClientToken()
    .then(isLoggedIn => {
      sendResponse({isLoggedIn});
    })
    .catch(error => {
      sendResponse({error});
    });

  return true;
});
