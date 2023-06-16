import { adjustId, themes } from '../utils/themes';
import './index.css';

const themesDarkList = document.querySelector('div.themes-dark-list');
const themesLightList = document.querySelector('div.themes-light-list');

// Populate option site with all available themes
for (const themeName in themes) {
  const themeId = adjustId(themeName);
  const newThemeCheckbox = document.createElement('div');

  newThemeCheckbox.className = 'theme-checkbox';
  newThemeCheckbox.innerHTML = `
    <input type="checkbox" id="${themeId}" name="${themeId}" data-theme="${themeName}" />
    <label for="${themeId}">
      ${themeName}
    </label>
  `;

  if (themes[themeName].type === 'dark') {
    themesDarkList!.appendChild(newThemeCheckbox);
  } else {
    themesLightList!.appendChild(newThemeCheckbox);
  }
}

// // Check default options
chrome.storage.sync.get(['defaultThemes'], (result) => {
  const defaultThemes = result.defaultThemes as string[]; // TODO add better types
  defaultThemes.forEach((defaultTheme) => {
    try {
      const themeCheckbox = document.querySelector(`input[name=${adjustId(defaultTheme)}]`) as HTMLInputElement;
      themeCheckbox.checked = true;
    } catch (error) {
      console.error('Invalid theme name ', defaultTheme);
    }
  });
});

// // Handle theme list change
const checkboxes = document.querySelectorAll('input[type=checkbox]') as NodeListOf<HTMLInputElement>;
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    if (!target.dataset.theme) return;

    const tagetThemeName: string = target.dataset.theme; // TODO add better types
    const tagetIsChecked = target.checked;

    chrome.storage.sync.get('defaultThemes', (result) => {
      let defaultThemes = result.defaultThemes as string[]; // TODO add better types
      if (tagetIsChecked && defaultThemes.includes(tagetThemeName)) {
        return;
      }

      if (tagetIsChecked) {
        // Add theme to defaultThemes
        defaultThemes.push(tagetThemeName);
      } else {
        // Remove theme from defaultThemes
        defaultThemes = defaultThemes.filter((theme) => theme !== tagetThemeName);
      }
      chrome.storage.sync.set({ defaultThemes });
    });
  });
});
