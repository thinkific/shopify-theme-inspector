import escape from 'lodash.escape';
import Toolbar from './components/toolbar';
import LiquidFlamegraph from './components/liquid-flamegraph';
import {
  getProfileData,
  setTotalTime,
  getBrowserTheme,
  emptyHTMLNode,
} from './utils';

import './styles/devtools.css';

const selectors = {
  refreshButton: '[data-refresh-button]',
  flamegraphContainer: '[data-flamegraph-container]',
  loadingAnimation: '[data-loading-animation]',
  initialMessage: '[data-initial-message]',
  notProfilableMessage: '[data-page-not-profilable]',
  flamegraphWrapper: '[data-flamegraph-wrapper]',
  searchButton: '[data-search-button]',
  clearButton: '[data-clear-button]',
  searchParam: '[data-search-param]',
};

let liquidFlamegraph: LiquidFlamegraph;

chrome.devtools.inspectedWindow.eval(
  `typeof window.Thinkific === 'object'`,
  function(isThinkificSite: boolean) {
    if (isThinkificSite) {
      chrome.devtools.panels.create('Thinkific', '', './devtools.html');

      if (getBrowserTheme() === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      }

      addEventListenerToButtons();
    }
  },
);

function addEventListenerToButtons() {
  const toolbar = new Toolbar();

  toolbar.refreshButton.addEventListener('click', refreshPanel);
  toolbar.zoomOutButton.addEventListener('click', zoomOutFlamegraph);

  document
    .querySelector(selectors.searchButton)!
    .addEventListener('click', function(event) {
      event.preventDefault();
      search();
    });

  document
    .querySelector(selectors.clearButton)!
    .addEventListener('click', function(event) {
      event.preventDefault();
      clear();
    });
}

function search() {
  const searchParam = (document.querySelector(
    selectors.searchParam,
  ) as HTMLInputElement).value;

  if (typeof liquidFlamegraph.flamegraph !== 'undefined') {
    liquidFlamegraph.flamegraph.search(escape(searchParam));
  }
}

function clear() {
  (document.querySelector(selectors.searchParam) as HTMLInputElement).value =
    '';

  if (typeof liquidFlamegraph.flamegraph !== 'undefined') {
    liquidFlamegraph.flamegraph.clear();
  }
}

function getInspectedWindowURL(): Promise<URL> {
  return new Promise(resolve => {
    chrome.devtools.inspectedWindow.eval(
      `document.location.protocol + '//' + document.location.host + document.location.pathname + document.location.search`,
      function(currentUrl: string) {
        resolve(new URL(currentUrl));
      },
    );
  });
}

async function refreshPanel() {
  emptyHTMLNode(document.querySelector(selectors.initialMessage));
  document
    .querySelector(selectors.flamegraphWrapper)!
    .classList.add('loading-fade');
  document.querySelector(selectors.loadingAnimation)!.classList.remove('hide');
  document.querySelector(selectors.notProfilableMessage)!.classList.add('hide');

  let profile: FormattedProfileData;
  const url = await getInspectedWindowURL();

  try {
    profile = await getProfileData(url);

    liquidFlamegraph = new LiquidFlamegraph(
      document.querySelector(selectors.flamegraphContainer),
      profile,
      url,
    );

    // All events happening here are synchronous. The set timeout is for UI
    // purposes so that timing information gets displayed after the flamegraph is shown.
    setTimeout(function() {
      setTotalTime(profile.value);
    }, 300);

    document
      .querySelector(selectors.flamegraphWrapper)!
      .classList.remove('hide');
  } catch (error) {
    console.error(error);
    document.querySelector(selectors.flamegraphWrapper)!.classList.add('hide');
    document
      .querySelector(selectors.notProfilableMessage)!
      .classList.remove('hide');
  }

  document.querySelector(selectors.loadingAnimation)!.classList.add('hide');
  document
    .querySelector(selectors.flamegraphWrapper)!
    .classList.remove('loading-fade');
}

function zoomOutFlamegraph() {
  if (typeof liquidFlamegraph.flamegraph !== 'undefined') {
    liquidFlamegraph.flamegraph.resetZoom();
  }
}
