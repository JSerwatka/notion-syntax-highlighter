import { debugLog, getElementDebugMeta } from '../debug';
import type { FiberNode, LanguageInfo } from '../types';

const getReactFiberFromElement = (element: Element): FiberNode | null => {
  const elementRecord = element as unknown as Record<string, unknown>;
  const reactKey = Object.keys(elementRecord).find((k) => k.includes('reactFiber') || k.includes('reactInternal'));
  if (!reactKey) return null;

  const fiber = elementRecord[reactKey] as FiberNode | undefined;
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

export const getCodeBlockLanguage = (codeBlockElement: Element | null): LanguageInfo | null => {
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
