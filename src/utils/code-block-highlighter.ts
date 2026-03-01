import hljs from './hljs-setup';
import { LANGUAGE_MAPPER } from './language-mapper';

const LOADING_CODE_PLACEHOLDER_REGEX = /^>\s*Loading(?:[\s\S]*?)code\.\.\.$/i;
const contentReadyObservers = new WeakMap<HTMLElement, MutationObserver>();

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

  for (const codeBlock of codeBlocks) {
    initializeCodeBlock(codeBlock);
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
          initializeCodeBlock(newNode);
          continue;
        }
        if (newNode.querySelector('.notion-code-block')) {
          const codeBlockContentWrapper = newNode.querySelector('.notion-code-block') as HTMLElement;
          initializeCodeBlock(codeBlockContentWrapper);
        }
      }
    }
  });
  newCodeBlocksObserver.observe(document.body, { childList: true, subtree: true });
};

// Initialization and discovery

const initializeCodeBlock = (codeBlock: Element) => {
  const codeContentElement = findCodeContentElement(codeBlock);
  if (!codeContentElement) return;

  normalizeNotionPadding(codeBlock, codeContentElement);

  if (hasRealCodeContent(codeContentElement)) {
    highlightCodeBlock(codeContentElement);
  } else {
    waitForCodeContentAndHighlight(codeContentElement);
  }

  codeMutationObserver.observe(codeContentElement, { childList: true, subtree: true, characterData: true });
};

const findCodeContentElement = (codeBlock: Element): HTMLElement | null => {
  return codeBlock.firstElementChild as HTMLElement | null;
};

const normalizeNotionPadding = (codeBlock: Element, codeContentElement: HTMLElement) => {
  // Notion can inject wrapper padding that clips highlighting edges.
  const paddingParent = codeBlock.parentElement as HTMLElement | null;
  if (!paddingParent || paddingParent.style.padding === '0px') return;

  codeContentElement.style.padding = '32px 22px';
  paddingParent.style.padding = '0';
  (codeBlock as HTMLElement).style.padding = '0px';
};

// Observer callbacks

const handleCodeMutations = (mutationsList: MutationRecord[]) => {
  for (const mutation of mutationsList) {
    const codeContentElement = mutation.target as HTMLElement | null;
    if (!codeContentElement) return;

    if (!hasRealCodeContent(codeContentElement)) {
      waitForCodeContentAndHighlight(codeContentElement);
      continue;
    }

    if (hasTokenClassChild(codeContentElement)) {
      highlightCodeBlock(codeContentElement, true);
    }
  }
};

const hasTokenClassChild = (codeContentElement: HTMLElement): boolean => {
  return Array.from(codeContentElement.children).some((child) => child.classList.contains('token'));
};

const waitForCodeContentAndHighlight = (codeContentElement: HTMLElement) => {
  if (contentReadyObservers.has(codeContentElement)) return;

  const observer = new MutationObserver(() => {
    if (!hasRealCodeContent(codeContentElement)) return;

    observer.disconnect();
    contentReadyObservers.delete(codeContentElement);
    highlightCodeBlock(codeContentElement);
  });

  contentReadyObservers.set(codeContentElement, observer);
  observer.observe(codeContentElement, { childList: true, subtree: true, characterData: true });
};

// Highlight pipeline

const highlightCodeBlock = (codeContentElement: HTMLElement, preserveSelection = false) => {
  const codeBlockWrapper = codeContentElement.closest('.notion-code-block');
  const languageInfo = getCodeBlockLanguage(codeBlockWrapper);
  const currentLanguage = languageInfo?.language ?? '';

  if (!(currentLanguage in LANGUAGE_MAPPER)) return;

  const savedOffset = preserveSelection ? captureSelectionOffset(codeContentElement) : null;

  overrideCodeBlockStyles(codeContentElement);
  insertHighlightedCode(codeContentElement, currentLanguage);

  if (preserveSelection && savedOffset !== null) {
    restoreSelectionOffset(codeContentElement, savedOffset);
  }
};

const insertHighlightedCode = (codeContentElement: HTMLElement, language: string) => {
  const highlightResult = hljs.highlight(codeContentElement.textContent ?? '', {
    language: LANGUAGE_MAPPER[language],
    ignoreIllegals: false
  });

  codeContentElement.innerHTML = highlightResult.value;
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

const getCodeBlockLanguage = (codeBlockElement: Element | null): LanguageInfo | null => {
  if (!codeBlockElement) return null;

  // Notion stores language in React internals; DOM alone does not expose it reliably.
  const reactKey = Object.keys(codeBlockElement).find((k) => k.includes('reactFiber') || k.includes('reactInternal'));
  if (!reactKey) return null;

  const rootFiber = (codeBlockElement as Record<string, unknown>)[reactKey] as FiberNode | undefined;
  if (!rootFiber) return null;

  const visited = new Set<FiberNode>();
  const queue: FiberNode[] = [rootFiber];

  while (queue.length) {
    const node = queue.shift();
    if (!node || visited.has(node)) continue;
    visited.add(node);

    const props = node.memoizedProps ?? node.pendingProps;
    if (props?.language) {
      return {
        language: props.language,
        canEdit: props.canEdit,
        store: props.store,
        component: node.type?.name || node.elementType?.name
      };
    }

    if (node.child) queue.push(node.child);
    if (node.sibling) queue.push(node.sibling);
    if (node.return) queue.push(node.return);
  }

  return null;
};
