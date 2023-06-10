import overwritePrismHighligher from '../scripts/overwrite-prism-highlighter?script&module'; // info: https://dev.to/jacksteamdev/advanced-config-for-rpce-3966
import hljs from '../utils/hljs';
import { LANGUAGE_MAPPER } from '../utils/language-mapper';
import { injectScript, loadThemeCSS } from '../utils/script-styles-loader';

injectScript(overwritePrismHighligher);

// TODO cleanup - use class?
// TODO: handle non existing languages
const CODE_BLOCK_SELECTOR = 'div.line-numbers.notion-code-block > div';

const languageObserver = new MutationObserver((mutationsList) => {
  // TODO add observers for language change + when language changed -> run highlight
  for (const languageBtnMutation of mutationsList) {
    if (languageBtnMutation.type !== 'characterData') return;
    if (!languageBtnMutation.target.parentElement) return;

    const mainCodeWrapper = languageBtnMutation.target.parentElement
      .closest('.notion-selectable.notion-code-block')
      ?.querySelector('div.line-numbers.notion-code-block > div');

    if (!mainCodeWrapper) return;

    const highlightResult = hljs.highlight(mainCodeWrapper.textContent ?? '', {
      language: LANGUAGE_MAPPER[languageBtnMutation.target.textContent ?? ''],
      ignoreIllegals: false
    });
    mainCodeWrapper.innerHTML = highlightResult.value;
  }
});

const highlightExistingCodeBlocks = () => {
  const codeBlocks = document.querySelectorAll('.notion-selectable.notion-code-block');

  for (const codeBlock of codeBlocks) {
    // TODO get current language and run highlight
    const languageBtn = codeBlock.querySelector('div[role=button]');
    const currentLanguage = languageBtn?.textContent;

    const mainCodeWrapper = codeBlock.querySelector(
      'div.line-numbers.notion-code-block > div'
    ) as HTMLElement;

    if (mainCodeWrapper && languageBtn) {
      // add hljs + reset styles
      overrideCodeBlockStyles(mainCodeWrapper);
      // add observers for language change
      // when language changed -> run highlight()
      languageObserver.observe(languageBtn, {
        characterData: true,
        subtree: true
      });

      // get current language and run highlight
      const highlightResult = hljs.highlight(mainCodeWrapper?.textContent ?? '', {
        language: LANGUAGE_MAPPER[currentLanguage ?? ''],
        ignoreIllegals: false
      });
      mainCodeWrapper.innerHTML = highlightResult.value;
    }
  }
};

const highlightNewCodeBlocks = () => {
  const handleNewNodes = (mutationsList: MutationRecord[]) => {
    for (const mutation of mutationsList) {
      for (const newNode of mutation.addedNodes) {
        if (newNode instanceof Element && newNode.matches('.notion-selectable.notion-code-block')) {
          const codeBlock = newNode.querySelector(CODE_BLOCK_SELECTOR) as HTMLElement;
          overrideCodeBlockStyles(codeBlock);
          // add observers for language change
          // when language changed -> run highlight()
          languageObserver.observe(codeBlock.querySelector('div[role=button]') as HTMLElement, {
            characterData: true,
            subtree: true
          });
        }
      }
    }
  };

  const codeBlock = document.querySelector('.notion-page-content') as HTMLElement;
  const newCodeBlocksObserver = new MutationObserver(handleNewNodes);
  newCodeBlocksObserver.observe(codeBlock, { childList: true });
};

const overrideCodeBlockStyles = (codeBlock: HTMLElement) => {
  // TODO don't use hljs if language not supported
  codeBlock.classList.add('hljs');
  // Notion has color as inline CSS, which I cannot override with class
  // that is why I have to remove it
  codeBlock.style.setProperty('color', null);
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
