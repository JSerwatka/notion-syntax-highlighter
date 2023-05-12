import { adjustId, adjustThemeName, themes } from '../utils/theme';
import './index.css';

const themeList = themes.map((theme) => {
  return `
      <div class="theme-checkbox">
        <input type="checkbox" id="${adjustId(theme)}" name="${theme}" />
        <label for="${theme}">
          ${adjustThemeName(theme)}
        </label>
      </div>
    `;
});

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main>
  <h3>Select available themes:</h3>
  <div class="theme-list">
      ${themeList.join('')}
  </div>
  <h4>All themes can be viewed here<a href="https://highlightjs.org/static/demo/">Highlight.js themes demo</a>
  </main>
`;

// Check default options
chrome.storage.sync.get(['defaultThemes'], (result) => {
  const defaultThemes = result.defaultThemes as string[];
  defaultThemes.forEach((defaultTheme) => {
    try {
      const themeCheckbox = document.querySelector(
        `input#${adjustId(defaultTheme)}`
      ) as HTMLInputElement;
      themeCheckbox.checked = true;
    } catch (error) {
      console.error('Invalid theme name ', defaultTheme);
    }
  });
});

// Handle theme list change
const checkboxList = document.querySelector('.theme-list') as HTMLDivElement;
checkboxList.addEventListener('change', (event) => {
  if (
    event.target &&
    event.target instanceof HTMLInputElement &&
    event.target.matches('input[type="checkbox"]')
  ) {
    const checkbox = event.target;
    chrome.storage.sync.get('defaultThemes', (result) => {
      let defaultThemes = result.defaultThemes as string[];
      if (checkbox.checked && defaultThemes.includes(checkbox.name)) {
        return;
      }

      if (checkbox.checked) {
        // Add theme to defaultThemes
        defaultThemes.push(checkbox.name);
      } else {
        // Remove theme from defaultThemes
        defaultThemes = defaultThemes.filter((theme) => theme !== checkbox.name);
      }
      chrome.storage.sync.set({ defaultThemes });
    });
  }
});
