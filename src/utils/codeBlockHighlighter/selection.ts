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

export const captureSelectionOffset = (codeContentElement: HTMLElement): number | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!codeContentElement.contains(range.commonAncestorContainer)) return null;

  const preRange = range.cloneRange();
  preRange.selectNodeContents(codeContentElement);
  preRange.setEnd(range.startContainer, range.startOffset);

  return preRange.toString().length;
};

export const restoreSelectionOffset = (codeContentElement: HTMLElement, savedOffset: number) => {
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
