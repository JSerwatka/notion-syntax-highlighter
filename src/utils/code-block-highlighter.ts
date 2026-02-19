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

const LOADING_CODE_PLACEHOLDER_REGEX = /^>\s*Loading(?:[\s\S]*?)code\.\.\.$/i;
const pendingContentObservers = new WeakMap<HTMLElement, MutationObserver>();

const languageObserver = new MutationObserver((mutationsList) => {
  for (const languageBtnMutation of mutationsList) {
    if (languageBtnMutation.type !== 'characterData') return;
    if (!languageBtnMutation.target.parentElement) return;

    const mainCodeWrapper = languageBtnMutation.target.parentElement
      .closest('.notion-code-block')
      ?.querySelector('div.notion-code-block > div') as HTMLElement | null | undefined;

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

    if (!hasRealCodeContent(mainCodeWrapper)) {
      waitForCodeContentAndHighlight(mainCodeWrapper);
      continue;
    }

    const hasTokenClass = Array.from(mainCodeWrapper.children).some((child) => child.classList.contains('token'));
    if (hasTokenClass) {
      highlightCodeBlock(mainCodeWrapper, true);
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

        // sometimes, an element with the classe ".notion-code-block" is created
        // however, at other times, it is nested within another created block
        if (newNode.matches('.notion-code-block')) {
          codeBlockInit(newNode);
          continue;
        }
        if (newNode.querySelector('.notion-code-block')) {
          const codeBlockContentWrapper = newNode.querySelector('.notion-code-block') as HTMLElement;
          codeBlockInit(codeBlockContentWrapper);
        }
      }
    }
  });
  newCodeBlocksObserver.observe(document.body, { childList: true, subtree: true });
};

const codeBlockInit = (codeBlock: Element) => {
  const mainCodeWrapper = codeBlock.firstElementChild as HTMLElement | null;

  if (!mainCodeWrapper) return;

  // Fixes: Notion added padding to the code block, which screws up the highlighting on the edges
  const paddingParent = codeBlock.parentElement as HTMLElement | null;
  if (paddingParent && paddingParent.style.padding !== '0px') {
    mainCodeWrapper.style.padding = '32px 22px';
    paddingParent.style.padding = '0';
    (codeBlock as HTMLElement).style.padding = '0px';
  }

  if (hasRealCodeContent(mainCodeWrapper)) {
    highlightCodeBlock(mainCodeWrapper);
  } else {
    waitForCodeContentAndHighlight(mainCodeWrapper);
  }

  // languageObserver.observe(languageBtn, {
  //   characterData: true,
  //   subtree: true
  // });

  prismObserver.observe(mainCodeWrapper, { childList: true, subtree: true, characterData: true });
};

const hasRealCodeContent = (mainCodeWrapper: HTMLElement): boolean => {
  const codeContent = mainCodeWrapper.textContent?.trim() ?? '';
  if (!codeContent) return false;
  return !LOADING_CODE_PLACEHOLDER_REGEX.test(codeContent);
};

const waitForCodeContentAndHighlight = (mainCodeWrapper: HTMLElement) => {
  if (pendingContentObservers.has(mainCodeWrapper)) return;

  const observer = new MutationObserver(() => {
    if (!hasRealCodeContent(mainCodeWrapper)) return;

    observer.disconnect();
    pendingContentObservers.delete(mainCodeWrapper);
    highlightCodeBlock(mainCodeWrapper);
  });

  pendingContentObservers.set(mainCodeWrapper, observer);
  observer.observe(mainCodeWrapper, { childList: true, subtree: true, characterData: true });
};

const highlightCodeBlock = (mainCodeWrapper: HTMLElement, preserveSelection = false) => {
  const codeBlockWrapper = mainCodeWrapper.closest('.notion-code-block');
  const langOject = getCodeBlockLanguage(codeBlockWrapper, mainCodeWrapper);
  const currentLanguage = langOject?.language ?? '';

  if (!(currentLanguage in LANGUAGE_MAPPER)) return;

  let savedOffset: number | null = null;
  const sel = window.getSelection();

  if (preserveSelection && sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    if (mainCodeWrapper.contains(range.commonAncestorContainer)) {
      const preRange = range.cloneRange();
      preRange.selectNodeContents(mainCodeWrapper);
      preRange.setEnd(range.startContainer, range.startOffset);
      savedOffset = preRange.toString().length;
    }
  }

  overrideCodeBlockStyles(mainCodeWrapper);
  insertHighlightedCode(mainCodeWrapper, currentLanguage);

  if (preserveSelection && savedOffset !== null) {
    let offset = savedOffset;

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

function getCodeBlockLanguage(codeBlockElement: Element | null, mainCodeWrapper?: HTMLElement | null) {
  const codeContent = mainCodeWrapper?.textContent?.trim() ?? '';
  const isLoadingPlaceholder = LOADING_CODE_PLACEHOLDER_REGEX.test(codeContent);
  if (!codeContent || isLoadingPlaceholder) return null;

  if (!codeBlockElement) return null;

  const reactKey = Object.keys(codeBlockElement).find((k) => k.includes('reactFiber') || k.includes('reactInternal'));

  if (!reactKey) return null;

  let node = (codeBlockElement as any)[reactKey];
  const visited = new Set();
  const queue = [node];

  while (queue.length) {
    node = queue.shift();
    if (!node || visited.has(node)) continue;
    visited.add(node);

    const props = node.memoizedProps || node.pendingProps;

    // Check if this component has language prop directly
    if (props?.language) {
      return {
        language: props.language,
        canEdit: props.canEdit,
        store: props.store,
        component: node.type?.name || node.elementType?.name
      };
    }

    // Add connected nodes to queue
    if (node.child) queue.push(node.child);
    if (node.sibling) queue.push(node.sibling);
    if (node.return) queue.push(node.return);
  }

  return null;
}
