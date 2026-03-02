import hljs from '../hljs-setup';
import { LANGUAGE_MAPPER } from '../language-mapper';
import { hasRealCodeContent } from './content';
import { debugLog, getElementDebugMeta } from '../debug';
import { getCodeBlockLanguage } from './react-language';
import { captureSelectionOffset, restoreSelectionOffset } from './selection';

const LANGUAGE_RETRY_DELAY_MS = 120;
const MAX_LANGUAGE_RETRY_ATTEMPTS = 10;

const contentReadyObservers = new WeakMap<HTMLElement, MutationObserver>();
const languageRetryTimers = new WeakMap<HTMLElement, number>();
const languageRetryAttempts = new WeakMap<HTMLElement, number>();

export const highlightCodeBlock = (codeContentElement: HTMLElement, preserveSelection = false) => {
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
  overrideCodeBlockStyles(codeContentElement);
  insertHighlightedCode(codeContentElement, currentLanguage);

  debugLog('highlightCodeBlock:done', {
    language: currentLanguage,
    mappedLanguage
  });
};

export const waitForCodeContentAndHighlight = (codeContentElement: HTMLElement) => {
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

const overrideCodeBlockStyles = (codeContentElement: HTMLElement) => {
  codeContentElement.classList.add('hljs');
  // Notion sets text color as inline style, so remove it for theme classes to apply.
  codeContentElement.style.setProperty('color', null);
  codeContentElement.style.setProperty('border-radius', '10px');
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
