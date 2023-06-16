import overwritePrismHighligher from '../scripts/overwrite-prism-highlighter?script&module'; // info: https://dev.to/jacksteamdev/advanced-config-for-rpce-3966
import {
  highlightExistingCodeBlocks,
  highlightNewCodeBlocks
} from '../utils/code-block-highlighter';
import { injectScript, loadThemeCSS } from '../utils/script-styles-loaders';

injectScript(overwritePrismHighligher);

highlightNewCodeBlocks();
highlightExistingCodeBlocks();

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

// info https://www.freecodecamp.org/news/chrome-extension-message-passing-essentials/
