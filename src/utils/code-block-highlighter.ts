import hljs from './hljs-setup';
import { LANGUAGE_MAPPER } from './language-mapper';

// --- NOTION CODE BLOCK - HTML structure ---
// <div class="notion-selectable notion-code-block"> <- code block wrapper (main)
//    ...
//    <div role="button" tabindex="0">...</div> <- change programming language (contains chosen language)
//    ...
//    <div class="line-numbers notion-code-block"> <- code block content wrapper
//      <div class="notranslate"> <-  main code wrapper is populated with html by Prism.highlight(), requires class "hljs" for the themes to work
//        ... <- html wtih code syntax highlighting
//      </div>
//    </div>
// </div>

// TODO: lang-selector-options-colors-issue: theme availble in window.theme

const languageObserver = new MutationObserver((mutationsList) => {
  for (const languageBtnMutation of mutationsList) {
    if (languageBtnMutation.type !== 'characterData') return;
    if (!languageBtnMutation.target.parentElement) return;

    const mainCodeWrapper = languageBtnMutation.target.parentElement
      .closest('.notion-selectable.notion-code-block')
      ?.querySelector('div.line-numbers.notion-code-block > div') as HTMLElement | null | undefined;

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
  const codeBlockContentWrappers = document.querySelectorAll('.line-numbers.notion-code-block');

  for (const codeBlock of codeBlockContentWrappers) {
    codeBlockInit(codeBlock);
  }
};

export const highlightNewCodeBlocks = () => {
  const newCodeBlocksObserver = new MutationObserver((mutationsList: MutationRecord[]) => {
    for (const mutation of mutationsList) {
      for (const newNode of mutation.addedNodes) {
        if (!(newNode instanceof Element)) return;

        // sometimes, an element with the classes ".line-numbers" and ".notion-code-block" is created
        // however, at other times, it is nested within another created block
        if (newNode.matches('.line-numbers.notion-code-block')) {
          codeBlockInit(newNode);
        }
        if (newNode.querySelector('.line-numbers.notion-code-block')) {
          const codeBlockContentWrapper = newNode.querySelector('.line-numbers.notion-code-block') as HTMLElement;
          codeBlockInit(codeBlockContentWrapper);
        }
      }
    }
  });
  newCodeBlocksObserver.observe(document.body, { childList: true, subtree: true });
};

const codeBlockInit = (codeBlock: Element) => {
  const codeBlockWrapper = codeBlock.closest('.notion-selectable.notion-code-block');
  const languageBtn = codeBlockWrapper?.querySelector('div[role=button]') as HTMLElement | null;
  const mainCodeWrapper = codeBlock.firstElementChild as HTMLElement | null;

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

const overrideCodeBlockStyles = (mainCodeWrapper: HTMLElement, mode: 'insert' | 'remove' = 'insert') => {
  if (mode === 'insert') {
    mainCodeWrapper.classList.add('hljs');
    // Notion has text color as inline CSS, which I cannot override with class
    // that is why I have to remove it
    mainCodeWrapper.style.setProperty('color', null);
  } else {
    mainCodeWrapper.classList.remove('hljs');
    mainCodeWrapper.style.setProperty('color', 'rgba(255, 255, 255, 0.81)');
  }
};
