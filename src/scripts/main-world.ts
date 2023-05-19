import { Grammar } from 'prismjs';
import hljs from '../utils/hljs';

function waitForPrism() {
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
    console.log('no Prism');
    setTimeout(waitForPrism, 1000);
  }
}

waitForPrism();
