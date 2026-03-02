const DEBUG_LOGS_ENABLED = false;
const DEBUG_PREFIX = '[NSH][code-highlighter]';

export const debugLog = (...args: unknown[]) => {
  if (!DEBUG_LOGS_ENABLED) return;
  console.debug(DEBUG_PREFIX, ...args);
};

export const getElementDebugMeta = (element: Element | null) => {
  if (!DEBUG_LOGS_ENABLED || !element) return null;

  return {
    tag: element.tagName,
    className: element.className,
    textPreview: (element.textContent ?? '').trim().slice(0, 80)
  };
};
