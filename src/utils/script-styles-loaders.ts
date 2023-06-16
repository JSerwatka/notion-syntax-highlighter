import { themes } from './themes';

export const loadThemeCSS = (selectedTheme: string) => {
  const cssLinkElement = document.createElement('link');
  cssLinkElement.rel = 'stylesheet';
  cssLinkElement.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/${themes[selectedTheme].originalName}.min.css`;

  cssLinkElement.dataset.theme = selectedTheme;
  document.head.appendChild(cssLinkElement);
};

export function injectScript(scriptURL: string) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(scriptURL);
  script.type = 'module';
  document.head.prepend(script);
}
