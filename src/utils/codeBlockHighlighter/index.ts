import { findCodeContentElement, hasRealCodeContent, hasTokenClassChild, normalizeNotionPadding } from './content';
import { debugLog, getElementDebugMeta } from '../debug';
import { highlightCodeBlock, waitForCodeContentAndHighlight } from './highlighting';

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

const codeMutationObserver = new MutationObserver((mutationsList) => {
  handleCodeMutations(mutationsList);
});

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
