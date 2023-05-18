import hljs from '../utils/hljs';
export {};

const loadThemeCSS = (selectedTheme: string) => {
  const linkElement = document.createElement('link');
  linkElement.rel = 'stylesheet';
  linkElement.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/${selectedTheme}.min.css`;
  // linkElement.href = chrome.runtime.getURL(`styles/${selectedTheme}.css`);
  linkElement.dataset.theme = selectedTheme;
  document.head.appendChild(linkElement);
};

// chrome.scripting
//   .executeScript({
//     target: { tabId: tab.id },
//     files: ['https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js']
//   })
//   .then(() => console.log('script injected'));
// const srcElement = document.createElement('script');
// srcElement.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js';

// document.body.appendChild(srcElement);

function injectScript(file: string, node: string) {
  const th = document.getElementsByTagName(node)[0];
  const s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', file);
  th.appendChild(s);
}
injectScript(chrome.runtime.getURL('inject-script.js'), 'body');

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.selectedTheme) {
    const selectedTheme = changes.selectedTheme.newValue as string;

    // Remove the existing theme CSS file
    const oldLinkElement = document.querySelector('link[data-theme]');
    if (oldLinkElement) {
      oldLinkElement.remove();
    }

    // Create a new link element for the new theme CSS file
    loadThemeCSS(selectedTheme);
  }
});

chrome.storage.sync.get('selectedTheme', ({ selectedTheme }) => {
  if (selectedTheme) {
    loadThemeCSS(selectedTheme);
  }
});

// TODO https://www.freecodecamp.org/news/chrome-extension-message-passing-essentials/
