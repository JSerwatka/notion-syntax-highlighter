import { debugLog, getElementDebugMeta } from '../debug';

const LOADING_CODE_PLACEHOLDER_REGEX = /^>\s*Loading(?:[\s\S]*?)code\.\.\.$/i;

export const hasRealCodeContent = (codeContentElement: HTMLElement): boolean => {
  const codeContent = codeContentElement.textContent?.trim() ?? '';
  if (!codeContent) return false;
  return !LOADING_CODE_PLACEHOLDER_REGEX.test(codeContent);
};

export const findCodeContentElement = (codeBlock: Element): HTMLElement | null => {
  return codeBlock.firstElementChild as HTMLElement | null;
};

export const hasTokenClassChild = (codeContentElement: HTMLElement): boolean => {
  return Array.from(codeContentElement.children).some((child) => child.classList.contains('token'));
};

export const normalizeNotionPadding = (codeBlock: Element, codeContentElement: HTMLElement) => {
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
