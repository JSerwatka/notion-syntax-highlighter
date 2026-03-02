import hljs from './hljs-setup';
import { LANGUAGE_MAPPER } from './language-mapper';

const LOADING_CODE_PLACEHOLDER_REGEX = /^>\s*Loading(?:[\s\S]*?)code\.\.\.$/i;
const contentReadyObservers = new WeakMap<HTMLElement, MutationObserver>();
const languageRetryTimers = new WeakMap<HTMLElement, number>();
const languageRetryAttempts = new WeakMap<HTMLElement, number>();
const DEBUG_LOGS_ENABLED = false;
const DEBUG_PREFIX = '[NSH][code-highlighter]';
const LANGUAGE_RETRY_DELAY_MS = 120;
const MAX_LANGUAGE_RETRY_ATTEMPTS = 10;

type LanguageInfo = {
  language: string;
  canEdit: unknown;
  store: unknown;
  component?: string;
};

type FiberNodeProps = {
  language?: string;
  canEdit?: unknown;
  store?: unknown;
};

type FiberNode = {
  memoizedProps?: FiberNodeProps;
  pendingProps?: FiberNodeProps;
  child?: FiberNode | null;
  sibling?: FiberNode | null;
  return?: FiberNode | null;
  type?: { name?: string } | null;
  elementType?: { name?: string } | null;
};

const debugLog = (...args: unknown[]) => {
  if (!DEBUG_LOGS_ENABLED) return;

  console.debug(DEBUG_PREFIX, ...args);
};

const getElementDebugMeta = (element: Element | null) => {
  if (!element) return null;

  return {
    tag: element.tagName,
    className: element.className,
    textPreview: (element.textContent ?? '').trim().slice(0, 80)
  };
};

// Notion still writes a loading placeholder before real code text is attached.
const hasRealCodeContent = (codeContentElement: HTMLElement): boolean => {
  const codeContent = codeContentElement.textContent?.trim() ?? '';
  if (!codeContent) return false;
  return !LOADING_CODE_PLACEHOLDER_REGEX.test(codeContent);
};

const codeMutationObserver = new MutationObserver((mutationsList) => {
  handleCodeMutations(mutationsList);
});

// Public API

export const highlightExistingCodeBlocks = () => {
  const codeBlocks = document.querySelectorAll('.line-numbers.notion-code-block');
  debugLog('highlightExistingCodeBlocks:start', { count: codeBlocks.length });

  for (const codeBlock of codeBlocks) {
    initializeCodeBlock(codeBlock);
  }
};

export const highlightNewCodeBlocks = () => {
  debugLog('highlightNewCodeBlocks:observer-attached');
  const newCodeBlocksObserver = new MutationObserver((mutationsList: MutationRecord[]) => {
    debugLog('highlightNewCodeBlocks:mutations', { count: mutationsList.length });

    for (const mutation of mutationsList) {
      for (const newNode of mutation.addedNodes) {
        if (!(newNode instanceof Element)) {
          debugLog('highlightNewCodeBlocks:skip-non-element-node');
          continue;
        }

        // sometimes, an element with the classe ".notion-code-block" is created
        // however, at other times, it is nested within another created block
        if (newNode.matches('.notion-code-block')) {
          debugLog('highlightNewCodeBlocks:direct-code-block-found', getElementDebugMeta(newNode));
          initializeCodeBlock(newNode);
          continue;
        }
        if (newNode.querySelector('.notion-code-block')) {
          const codeBlockContentWrapper = newNode.querySelector('.notion-code-block') as HTMLElement;
          debugLog('highlightNewCodeBlocks:nested-code-block-found', getElementDebugMeta(codeBlockContentWrapper));
          initializeCodeBlock(codeBlockContentWrapper);
        }
      }
    }
  });
  newCodeBlocksObserver.observe(document.body, { childList: true, subtree: true });
};

// Initialization and discovery

const initializeCodeBlock = (codeBlock: Element) => {
  debugLog('initializeCodeBlock:start', getElementDebugMeta(codeBlock));
  const codeContentElement = findCodeContentElement(codeBlock);
  if (!codeContentElement) {
    debugLog('initializeCodeBlock:missing-code-content-element', getElementDebugMeta(codeBlock));
    return;
  }

  normalizeNotionPadding(codeBlock, codeContentElement);

  if (hasRealCodeContent(codeContentElement)) {
    debugLog('initializeCodeBlock:content-ready-immediately', getElementDebugMeta(codeContentElement));
    highlightCodeBlock(codeContentElement);
  } else {
    debugLog('initializeCodeBlock:content-not-ready-waiting', getElementDebugMeta(codeContentElement));
    waitForCodeContentAndHighlight(codeContentElement);
  }

  codeMutationObserver.observe(codeContentElement, { childList: true, subtree: true, characterData: true });
  debugLog('initializeCodeBlock:observer-attached', getElementDebugMeta(codeContentElement));
};

const findCodeContentElement = (codeBlock: Element): HTMLElement | null => {
  return codeBlock.firstElementChild as HTMLElement | null;
};

const normalizeNotionPadding = (codeBlock: Element, codeContentElement: HTMLElement) => {
  // Notion can inject wrapper padding that clips highlighting edges.
  const paddingParent = codeBlock.parentElement as HTMLElement | null;
  if (!paddingParent || paddingParent.style.padding === '0px') return;

  debugLog('normalizeNotionPadding:adjusting-padding', {
    codeBlock: getElementDebugMeta(codeBlock),
    parentPadding: paddingParent.style.padding
  });
  codeContentElement.style.padding = '32px 22px';
  paddingParent.style.padding = '0';
  (codeBlock as HTMLElement).style.padding = '0px';
};

// Observer callbacks

const handleCodeMutations = (mutationsList: MutationRecord[]) => {
  debugLog('handleCodeMutations:start', { count: mutationsList.length });

  for (const mutation of mutationsList) {
    debugLog('handleCodeMutations:item', {
      type: mutation.type,
      targetNodeType: mutation.target.nodeType
    });

    const codeContentElement = mutation.target as HTMLElement | null;
    if (!codeContentElement) {
      debugLog('handleCodeMutations:missing-target-element');
      continue;
    }

    if (!hasRealCodeContent(codeContentElement)) {
      debugLog('handleCodeMutations:content-not-ready', getElementDebugMeta(codeContentElement));
      waitForCodeContentAndHighlight(codeContentElement);
      continue;
    }

    if (hasTokenClassChild(codeContentElement)) {
      debugLog('handleCodeMutations:token-child-detected-rehighlight', getElementDebugMeta(codeContentElement));
      highlightCodeBlock(codeContentElement, true);
    } else {
      debugLog('handleCodeMutations:no-token-child-skip', getElementDebugMeta(codeContentElement));
    }
  }
};

const hasTokenClassChild = (codeContentElement: HTMLElement): boolean => {
  return Array.from(codeContentElement.children).some((child) => child.classList.contains('token'));
};

const waitForCodeContentAndHighlight = (codeContentElement: HTMLElement) => {
  if (contentReadyObservers.has(codeContentElement)) {
    debugLog('waitForCodeContentAndHighlight:already-waiting', getElementDebugMeta(codeContentElement));
    return;
  }

  debugLog('waitForCodeContentAndHighlight:observer-created', getElementDebugMeta(codeContentElement));

  const observer = new MutationObserver(() => {
    if (!hasRealCodeContent(codeContentElement)) {
      debugLog('waitForCodeContentAndHighlight:mutation-but-still-loading', getElementDebugMeta(codeContentElement));
      return;
    }

    observer.disconnect();
    contentReadyObservers.delete(codeContentElement);
    debugLog('waitForCodeContentAndHighlight:content-ready-now-highlighting', getElementDebugMeta(codeContentElement));
    highlightCodeBlock(codeContentElement);
  });

  contentReadyObservers.set(codeContentElement, observer);
  observer.observe(codeContentElement, { childList: true, subtree: true, characterData: true });
};

// Highlight pipeline

const resetLanguageRetryState = (codeContentElement: HTMLElement) => {
  const retryTimerId = languageRetryTimers.get(codeContentElement);
  if (retryTimerId !== undefined) {
    window.clearTimeout(retryTimerId);
    languageRetryTimers.delete(codeContentElement);
  }
  languageRetryAttempts.delete(codeContentElement);
};

const scheduleLanguageRetry = (codeContentElement: HTMLElement, preserveSelection: boolean) => {
  if (!codeContentElement.isConnected) {
    resetLanguageRetryState(codeContentElement);
    debugLog('highlightCodeBlock:language-retry-skip-disconnected-element', getElementDebugMeta(codeContentElement));
    return;
  }

  if (languageRetryTimers.has(codeContentElement)) {
    debugLog('highlightCodeBlock:language-retry-already-scheduled', getElementDebugMeta(codeContentElement));
    return;
  }

  const nextAttempt = (languageRetryAttempts.get(codeContentElement) ?? 0) + 1;
  if (nextAttempt > MAX_LANGUAGE_RETRY_ATTEMPTS) {
    resetLanguageRetryState(codeContentElement);
    debugLog('highlightCodeBlock:language-retry-max-attempts-reached', {
      maxAttempts: MAX_LANGUAGE_RETRY_ATTEMPTS,
      codeBlock: getElementDebugMeta(codeContentElement.closest('.notion-code-block'))
    });
    return;
  }

  languageRetryAttempts.set(codeContentElement, nextAttempt);
  debugLog('highlightCodeBlock:language-retry-scheduled', {
    attempt: nextAttempt,
    delayMs: LANGUAGE_RETRY_DELAY_MS,
    codeBlock: getElementDebugMeta(codeContentElement.closest('.notion-code-block'))
  });

  const timeoutId = window.setTimeout(() => {
    languageRetryTimers.delete(codeContentElement);
    debugLog('highlightCodeBlock:language-retry-running', {
      attempt: nextAttempt,
      codeBlock: getElementDebugMeta(codeContentElement.closest('.notion-code-block'))
    });
    highlightCodeBlock(codeContentElement, preserveSelection);
  }, LANGUAGE_RETRY_DELAY_MS);

  languageRetryTimers.set(codeContentElement, timeoutId);
};

const highlightCodeBlock = (codeContentElement: HTMLElement, preserveSelection = false) => {
  const codeBlockWrapper = codeContentElement.closest('.notion-code-block');
  const languageInfo = getCodeBlockLanguage(codeBlockWrapper);
  const currentLanguage = languageInfo?.language ?? '';
  const mappedLanguage = LANGUAGE_MAPPER[currentLanguage];

  debugLog('highlightCodeBlock:start', {
    preserveSelection,
    languageInfo,
    currentLanguage,
    mappedLanguage,
    codeBlock: getElementDebugMeta(codeBlockWrapper)
  });

  if (!(currentLanguage in LANGUAGE_MAPPER)) {
    if (!currentLanguage) {
      scheduleLanguageRetry(codeContentElement, preserveSelection);
    } else {
      resetLanguageRetryState(codeContentElement);
    }
    debugLog('highlightCodeBlock:language-not-supported-by-mapper', { currentLanguage, languageInfo });
    return;
  }

  resetLanguageRetryState(codeContentElement);

  const savedOffset = preserveSelection ? captureSelectionOffset(codeContentElement) : null;
  if (preserveSelection) {
    debugLog('highlightCodeBlock:captured-selection-offset', { savedOffset });
  }

  overrideCodeBlockStyles(codeContentElement);
  insertHighlightedCode(codeContentElement, currentLanguage);

  if (preserveSelection && savedOffset !== null) {
    restoreSelectionOffset(codeContentElement, savedOffset);
    debugLog('highlightCodeBlock:selection-restored', { savedOffset });
  }

  debugLog('highlightCodeBlock:done', {
    language: currentLanguage,
    mappedLanguage
  });
};

const insertHighlightedCode = (codeContentElement: HTMLElement, language: string) => {
  debugLog('insertHighlightedCode:start', {
    sourceLength: (codeContentElement.textContent ?? '').length,
    language,
    mappedLanguage: LANGUAGE_MAPPER[language]
  });

  const highlightResult = hljs.highlight(codeContentElement.textContent ?? '', {
    language: LANGUAGE_MAPPER[language],
    ignoreIllegals: false
  });

  codeContentElement.innerHTML = highlightResult.value;
  debugLog('insertHighlightedCode:done', {
    highlightedLength: highlightResult.value.length
  });
};

// Selection helpers

const captureSelectionOffset = (codeContentElement: HTMLElement): number | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!codeContentElement.contains(range.commonAncestorContainer)) return null;

  const preRange = range.cloneRange();
  preRange.selectNodeContents(codeContentElement);
  preRange.setEnd(range.startContainer, range.startOffset);

  return preRange.toString().length;
};

const restoreSelectionOffset = (codeContentElement: HTMLElement, savedOffset: number) => {
  const selection = window.getSelection();
  if (!selection) return;

  const target = findTextNodeAtOffset(codeContentElement, savedOffset);
  if (!target) return;

  const range = document.createRange();
  range.setStart(target.node, target.offset);
  range.collapse(true);

  selection.removeAllRanges();
  selection.addRange(range);
};

const findTextNodeAtOffset = (root: HTMLElement, offset: number): { node: Node; offset: number } | null => {
  let remainingOffset = offset;

  const traverse = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      if ((node.textContent ?? '').length >= remainingOffset) return node;
      remainingOffset -= (node.textContent ?? '').length;
      return null;
    }

    for (let i = 0; i < node.childNodes.length; i++) {
      const foundNode = traverse(node.childNodes[i]);
      if (foundNode) return foundNode;
    }

    return null;
  };

  const node = traverse(root);
  if (!node) return null;

  return { node, offset: remainingOffset };
};

// Styling helpers

const overrideCodeBlockStyles = (codeContentElement: HTMLElement, mode: 'insert' | 'remove' = 'insert') => {
  if (mode === 'insert') {
    codeContentElement.classList.add('hljs');
    // Notion sets text color as inline style, so remove it for theme classes to apply.
    codeContentElement.style.setProperty('color', null);
  } else {
    codeContentElement.classList.remove('hljs');
    codeContentElement.style.setProperty('color', 'rgba(255, 255, 255, 0.81)');
  }
};

// React language extraction

const getReactFiberFromElement = (element: Element): FiberNode | null => {
  const reactKey = Object.keys(element).find((k) => k.includes('reactFiber') || k.includes('reactInternal'));
  if (!reactKey) return null;

  const fiber = (element as Record<string, unknown>)[reactKey] as FiberNode | undefined;
  return fiber ?? null;
};

const findReactFiberNearCodeBlock = (codeBlockElement: Element): FiberNode | null => {
  const directFiber = getReactFiberFromElement(codeBlockElement);
  if (directFiber) return directFiber;

  const children = Array.from(codeBlockElement.children);
  for (const child of children) {
    const childFiber = getReactFiberFromElement(child);
    if (childFiber) return childFiber;
  }

  let parent = codeBlockElement.parentElement;
  let depth = 0;
  while (parent && depth < 3) {
    const parentFiber = getReactFiberFromElement(parent);
    if (parentFiber) return parentFiber;
    parent = parent.parentElement;
    depth += 1;
  }

  return null;
};

const getCodeBlockLanguage = (codeBlockElement: Element | null): LanguageInfo | null => {
  if (!codeBlockElement) {
    debugLog('getCodeBlockLanguage:missing-code-block-element');
    return null;
  }

  // Notion stores language in React internals; DOM alone does not expose it reliably.
  const rootFiber = findReactFiberNearCodeBlock(codeBlockElement);
  if (!rootFiber) {
    debugLog('getCodeBlockLanguage:react-root-fiber-missing', getElementDebugMeta(codeBlockElement));
    return null;
  }

  const visited = new Set<FiberNode>();
  const queue: FiberNode[] = [rootFiber];

  while (queue.length) {
    const node = queue.shift();
    if (!node || visited.has(node)) continue;
    visited.add(node);

    const props = node.memoizedProps ?? node.pendingProps;
    if (props?.language) {
      const result = {
        language: props.language,
        canEdit: props.canEdit,
        store: props.store,
        component: node.type?.name || node.elementType?.name
      };

      debugLog('getCodeBlockLanguage:found-language', result);
      return result;
    }

    if (node.child) queue.push(node.child);
    if (node.sibling) queue.push(node.sibling);
    if (node.return) queue.push(node.return);
  }

  debugLog('getCodeBlockLanguage:language-not-found-after-traversal');
  return null;
};
