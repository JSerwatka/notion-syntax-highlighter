import overwritePrismHighligher from '../scripts/overwrite-prism-highlighter?script&module'; // info: https://dev.to/jacksteamdev/advanced-config-for-rpce-3966
import { injectScript, loadThemeCSS } from '../utils/script-styles-loader';

injectScript(overwritePrismHighligher);

// TODO make sure that all hlsj css properties are !important

const CODE_BLOCK_SELECTOR = 'div.line-numbers.notion-code-block > div';

const highlightExistingCodeBlocks = () => {
  const codeBlocks = document.querySelectorAll(CODE_BLOCK_SELECTOR) as NodeListOf<HTMLElement>;

  for (const codeBlock of codeBlocks) {
    // TODO don't use hljs if language not supported
    codeBlock.classList.add('hljs');

    // TODO use something more reliable then setTimeout
    setTimeout(() => {
      codeBlock.focus();
      codeBlock.click();
    }, 200);
  }
};

const highlightNewCodeBlocks = () => {
  const handleNewNodes = (mutationsList: MutationRecord[]) => {
    for (const mutation of mutationsList) {
      for (const newNode of mutation.addedNodes) {
        if (newNode instanceof Element && newNode.matches('.notion-selectable.notion-code-block')) {
          const codeBlock = newNode.querySelector(CODE_BLOCK_SELECTOR) as HTMLElement;
          codeBlock.classList.add('hljs');
        }
      }
    }
  };

  const codeBlock = document.querySelector('.notion-page-content') as HTMLElement;
  const newCodeBlocksObserver = new MutationObserver(handleNewNodes);
  newCodeBlocksObserver.observe(codeBlock, { childList: true });
};

// Force highlight after
if (document.readyState !== 'loading') {
  highlightExistingCodeBlocks();
  highlightNewCodeBlocks();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    highlightExistingCodeBlocks();
    highlightNewCodeBlocks();
  });
}

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
