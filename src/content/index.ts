export {}; // TODO do I need it?
import overwritePrismHighligher from '../scripts/overwritePrismHighligher?script&module'; // info: https://dev.to/jacksteamdev/advanced-config-for-rpce-3966
import { waitForElement } from '../utils/waitForElement';

// TODO move to utils
const loadThemeCSS = (selectedTheme: string) => {
  const cssLinkElement = document.createElement('link');
  cssLinkElement.rel = 'stylesheet';
  cssLinkElement.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/${selectedTheme}.min.css`;

  cssLinkElement.dataset.theme = selectedTheme;
  document.head.appendChild(cssLinkElement);
};

// TODO rename + maybe move to utils
function injectScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(overwritePrismHighligher);
  script.type = 'module';
  document.head.prepend(script);
}
injectScript();

// TODO don't use any
waitForElement('div.line-numbers.notion-code-block .notranslate').then((elm: any) => {
  // const content = elm.innerHTML;
  // elm.innerHTML = `<div class="hljs">${content}</div>`;
  console.log(elm);
  console.log(elm.textContent);
  elm.classList.add('hljs');
  // TODO make sure that all hlsj css properties are !important
  // TODO don't use hljs if language not supported
  // elm.innerHTML = `<pre><code class="hljs">${content}</pre></code>`;
  // console.log(elm);
  // console.log(elm.textContent);
});

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
