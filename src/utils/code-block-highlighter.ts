import hljs from './hljs-setup';
import { LANGUAGE_MAPPER } from './language-mapper';

const languageObserver = new MutationObserver((mutationsList) => {
  for (const languageBtnMutation of mutationsList) {
    if (languageBtnMutation.type !== 'characterData') return;
    if (!languageBtnMutation.target.parentElement) return;

    const mainCodeWrapper = languageBtnMutation.target.parentElement
      .closest('.notion-selectable.notion-code-block')
      ?.querySelector('div.line-numbers.notion-code-block > div') as HTMLElement | null;

    if (!mainCodeWrapper) return;

    const newlanguage = languageBtnMutation.target.textContent ?? '';

    if (newlanguage in LANGUAGE_MAPPER) {
      overrideCodeBlockStyles(mainCodeWrapper);
      insertHighlightedCode(mainCodeWrapper, newlanguage);
    } else {
      overrideCodeBlockStyles(mainCodeWrapper, 'remove');
    }
  }
});

export const highlightExistingCodeBlocks = () => {
  const codeBlocks = document.querySelectorAll('.notion-selectable.notion-code-block');

  for (const codeBlock of codeBlocks) {
    codeBlockInit(codeBlock);
  }
};

export const highlightNewCodeBlocks = () => {
  const newCodeBlocksObserver = new MutationObserver((mutationsList: MutationRecord[]) => {
    for (const mutation of mutationsList) {
      for (const newNode of mutation.addedNodes) {
        if (newNode instanceof Element && newNode.matches('.notion-selectable.notion-code-block')) {
          codeBlockInit(newNode);
        }
      }
    }
  });
  const codeBlock = document.querySelector('.notion-page-content') as HTMLElement;
  newCodeBlocksObserver.observe(codeBlock, { childList: true, subtree: true });
};

const codeBlockInit = (codeBlock: Element) => {
  const languageBtn = codeBlock.querySelector('div[role=button]') as HTMLElement | null;
  const mainCodeWrapper = codeBlock.querySelector(
    'div.line-numbers.notion-code-block > div'
  ) as HTMLElement | null;

  if (!mainCodeWrapper || !languageBtn) return;

  const currentLanguage = languageBtn.textContent ?? '';

  if (currentLanguage in LANGUAGE_MAPPER) {
    overrideCodeBlockStyles(mainCodeWrapper);
    insertHighlightedCode(mainCodeWrapper, currentLanguage);
  }

  languageObserver.observe(languageBtn, {
    characterData: true,
    subtree: true
  });
};

const insertHighlightedCode = (mainCodeWrapper: HTMLElement, language: string) => {
  const highlightResult = hljs.highlight(mainCodeWrapper?.textContent ?? '', {
    language: LANGUAGE_MAPPER[language],
    ignoreIllegals: false
  });

  mainCodeWrapper.innerHTML = highlightResult.value;
};

const overrideCodeBlockStyles = (
  codeWrapper: HTMLElement,
  mode: 'insert' | 'remove' = 'insert'
) => {
  if (mode === 'insert') {
    codeWrapper.classList.add('hljs');
    // Notion has text color as inline CSS, which I cannot override with class
    // that is why I have to remove it
    codeWrapper.style.setProperty('color', null);
  } else {
    codeWrapper.classList.remove('hljs');
    codeWrapper.style.setProperty('color', 'rgba(255, 255, 255, 0.81)');
  }
};
