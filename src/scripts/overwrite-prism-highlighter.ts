import { Grammar } from 'prismjs';
import hljs from '../utils/hljs-setup';

function overwritePrismHighlighter() {
  if (window.Prism) {
    const originalPrismHighlighter = window.Prism.highlight;

    window.Prism.highlight = (text: string, config: Grammar, language: string) => {
      try {
        const highlightResult = hljs.highlight(text, { language: language, ignoreIllegals: false });

        return highlightResult.value;
      } catch (error) {
        // Fallback with original syntax highlighting for not supported languages
        return originalPrismHighlighter(text, config, language);
      }
    };
  } else {
    setTimeout(overwritePrismHighlighter, 300);
  }
}

overwritePrismHighlighter();
