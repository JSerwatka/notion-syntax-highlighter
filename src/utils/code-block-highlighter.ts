// TODO: handle non existing languages

import hljs from './hljs-setup';
import { LANGUAGE_MAPPER } from './language-mapper';

const languageObserver = new MutationObserver((mutationsList) => {
  for (const languageBtnMutation of mutationsList) {
    if (languageBtnMutation.type !== 'characterData') return;
    if (!languageBtnMutation.target.parentElement) return;

    const mainCodeWrapper = languageBtnMutation.target.parentElement
      .closest('.notion-selectable.notion-code-block')
      ?.querySelector('div.line-numbers.notion-code-block > div');

    if (!mainCodeWrapper) return;

    insertHighlightedCode(
      mainCodeWrapper as HTMLElement,
      languageBtnMutation.target.textContent ?? ''
    );
  }
});

export const highlightExistingCodeBlocks = () => {
  const codeBlocks = document.querySelectorAll('.notion-selectable.notion-code-block');

  for (const codeBlock of codeBlocks) {
    const { languageBtn, mainCodeWrapper } = getLanguageCodeWrapperElements(codeBlock);
    if (!mainCodeWrapper || !languageBtn) return;

    const currentLanguage = languageBtn.textContent;
    overrideCodeBlockStyles(mainCodeWrapper, currentLanguage ?? '');
    languageObserver.observe(languageBtn, {
      characterData: true,
      subtree: true
    });

    // get current language and run highlight
    insertHighlightedCode(mainCodeWrapper, currentLanguage ?? '');
  }
};

export const highlightNewCodeBlocks = () => {
  const handleNewNodes = (mutationsList: MutationRecord[]) => {
    for (const mutation of mutationsList) {
      for (const newNode of mutation.addedNodes) {
        if (newNode instanceof Element && newNode.matches('.notion-selectable.notion-code-block')) {
          const { languageBtn, mainCodeWrapper } = getLanguageCodeWrapperElements(newNode);
          if (!mainCodeWrapper || !languageBtn) return;

          const currentLanguage = languageBtn.textContent;
          overrideCodeBlockStyles(mainCodeWrapper, currentLanguage ?? '');
          languageObserver.observe(languageBtn, {
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

const getLanguageCodeWrapperElements = (codeBlock: Element) => {
  const languageBtn = codeBlock.querySelector('div[role=button]');
  const mainCodeWrapper = codeBlock.querySelector('div.line-numbers.notion-code-block > div');

  return {
    languageBtn: languageBtn as Element | null,
    mainCodeWrapper: mainCodeWrapper as HTMLElement | null
  };
};

const insertHighlightedCode = (mainCodeWrapper: HTMLElement, language: string) => {
  const highlightResult = hljs.highlight(mainCodeWrapper?.textContent ?? '', {
    language: LANGUAGE_MAPPER[language ?? ''],
    ignoreIllegals: false
  });
  mainCodeWrapper.innerHTML = highlightResult.value;
};

const overrideCodeBlockStyles = (codeBlock: HTMLElement, language: string) => {
  // TODO don't use hljs if language not supported
  codeBlock.classList.add('hljs');
  // Notion has text color as inline CSS, which I cannot override with class
  // that is why I have to remove it
  codeBlock.style.setProperty('color', null);
};
