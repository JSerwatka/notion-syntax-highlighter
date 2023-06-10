import { Grammar } from 'prismjs';
import hljs from '../utils/hljs-setup';

function overwritePrismHighligher() {
  if (window.Prism) {
    const originalPrismHighlighter = window.Prism.highlight;

    window.Prism.highlight = (text: string, config: Grammar, language: string) => {
      try {
        const highlightResult = hljs.highlight(text, { language: language, ignoreIllegals: false });
        return highlightResult.value;
      } catch (error) {
        // Fallback with original syntax highliting for not supported languages
        return originalPrismHighlighter(text, config, language);
      }
    };
  } else {
    setTimeout(overwritePrismHighligher, 300);
  }
}

overwritePrismHighligher();
