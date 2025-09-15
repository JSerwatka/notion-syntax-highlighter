import hljs from './hljs-setup';
import { LANGUAGE_MAPPER } from './language-mapper';

// --- NOTION CODE BLOCK - HTML structure ---
// <div class="notion-selectable notion-code-block"> <- code block wrapper
//    ...
//    <div role="button" tabindex="0">...</div> <- change programming language (contains chosen language)
//    ...
//    <div class="line-numbers notion-code-block"> <- code block content wrapper
//      <div class="notranslate"> <-  main code wrapper is populated with html by Prism.highlight(), requires class "hljs" for the themes to work
//        ... <- html with code syntax highlighting
//      </div>
//    </div>
// </div>

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

const prismObserver = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    const mainCodeWrapper = mutation.target as HTMLElement | null;
    if (!mainCodeWrapper) return;

    const hasTokenClass = Array.from(mainCodeWrapper.children).some((child) => child.classList.contains('token'));
    if (hasTokenClass) {
      const codeBlockWrapper = mainCodeWrapper.closest('.notion-selectable.notion-code-block');
      const languageBtn = codeBlockWrapper?.querySelector('div[role=button]') as HTMLElement | null;

      const currentLanguage = languageBtn ? languageBtn.textContent ?? '' : '';

      if (currentLanguage in LANGUAGE_MAPPER) {
        // save current selection position within mainCodeWrapper
        const sel = window.getSelection();
        let savedOffset: number | null = null;
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          // Only save cursor position if it's within the current code block
          if (mainCodeWrapper.contains(range.commonAncestorContainer)) {
            // calculate the character offset relative to mainCodeWrapper
            const preRange = range.cloneRange();
            preRange.selectNodeContents(mainCodeWrapper);
            preRange.setEnd(range.startContainer, range.startOffset);
            savedOffset = preRange.toString().length;
          }
        }

        insertHighlightedCode(mainCodeWrapper, currentLanguage);

        // restore caret position if possible and if it was in this code block
        if (savedOffset !== null) {
          let node = mainCodeWrapper;
          let offset = savedOffset;
          // traverse text nodes to find the one containing the caret position
          const traverse = (n: Node): Node | null => {
            if (n.nodeType === Node.TEXT_NODE) {
              if (n.textContent!.length >= offset) return n;
              offset -= n.textContent!.length;
            } else {
              for (let i = 0; i < n.childNodes.length; i++) {
                const found = traverse(n.childNodes[i]);
                if (found) return found;
              }
            }
            return null;
          };

          const targetNode = traverse(mainCodeWrapper);
          if (targetNode) {
            const range = document.createRange();
            range.setStart(targetNode, offset);
            range.collapse(true);
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
        }
      }
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
          continue;
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

  // Fixes: Notion added padding to the code block, which screws up the highlighting on the edges
  const paddingParent = codeBlock.parentElement as HTMLElement | null;
  if (paddingParent && paddingParent.style.padding !== '0px') {
    mainCodeWrapper.style.padding = "32px 22px";
    paddingParent.style.padding = '0';
    (codeBlock as HTMLElement).style.padding = "0px"
  }

  const currentLanguage = languageBtn.textContent ?? '';

  if (currentLanguage in LANGUAGE_MAPPER) {
    overrideCodeBlockStyles(mainCodeWrapper);
    insertHighlightedCode(mainCodeWrapper, currentLanguage);
  }

  languageObserver.observe(languageBtn, {
    characterData: true,
    subtree: true
  });

  prismObserver.observe(mainCodeWrapper, { childList: true });
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
