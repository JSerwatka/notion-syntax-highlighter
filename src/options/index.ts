import { adjustId, adjustThemeName, themes } from '../utils/themes';
import './index.css';

// TODO sort white themes - add infor to /utils/theme

const themeListElement = document.querySelector('div.theme-list');

// Populate option site with all available themes
themes.forEach((theme) => {
  const newThemeCheckbox = document.createElement('div');
  newThemeCheckbox.className = 'theme-checkbox';
  newThemeCheckbox.innerHTML = `
    <input type="checkbox" id="${adjustId(theme)}" name="${theme}" />
    <label for="${theme}">
      ${adjustThemeName(theme)}
    </label>
  `;
  themeListElement?.appendChild(newThemeCheckbox);
});

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
