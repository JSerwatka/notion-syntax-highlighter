import { ThemeName, adjustId, themes } from '../utils/themes';
import './index.css';

const themesDarkList = document.querySelector('div.themes-dark-list');
const themesLightList = document.querySelector('div.themes-light-list');

// Populate option site with all available themes
for (const theme in themes) {
  const themeName = theme as ThemeName;
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
  const defaultThemes = result.defaultThemes as ThemeName[];
  defaultThemes.forEach((defaultTheme) => {
    try {
      const themeCheckbox = document.querySelector(`input[name=${adjustId(defaultTheme)}]`) as HTMLInputElement;
      themeCheckbox.checked = true;
    } catch (error) {
      console.error('Invalid theme name ', defaultTheme);
    }
  });
});

// Handle theme list change
const checkboxes = document.querySelectorAll('input[type=checkbox]') as NodeListOf<HTMLInputElement>;
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    if (!target.dataset.theme) return;

    const tagetThemeName = target.dataset.theme as ThemeName;
    const tagetIsChecked = target.checked;

    chrome.storage.sync.get('defaultThemes', (result) => {
      let defaultThemes = result.defaultThemes as ThemeName[];
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

// Handle color scheme change
const mainContainer = document.querySelector('#app');
const iconDiv = document.querySelector('.theme-icon') as HTMLElement;
const listsWrapper = document.querySelector('.lists-wrapper') as HTMLElement;
const moonIcon = iconDiv.querySelector('.icon-tabler-moon');
const sunIcon = iconDiv.querySelector('.icon-tabler-sun');

const handleThemeChange = (colorScheme: string) => {
  if (colorScheme === 'light') {
    moonIcon?.classList.remove('disabled');
    sunIcon?.classList.add('disabled');

    mainContainer?.classList.add('light');
    listsWrapper.style.flexDirection = 'column-reverse';
  } else {
    moonIcon?.classList.add('disabled');
    sunIcon?.classList.remove('disabled');

    mainContainer?.classList.remove('light');
    listsWrapper.style.flexDirection = 'column';
  }
};

chrome.storage.sync.get(['prefersColorScheme'], (result) => {
  handleThemeChange(result.prefersColorScheme);
});

moonIcon?.addEventListener('pointerdown', () => {
  handleThemeChange('dark');
  chrome.storage.sync.set({ prefersColorScheme: 'dark' });
});

sunIcon?.addEventListener('pointerdown', () => {
  handleThemeChange('light');
  chrome.storage.sync.set({ prefersColorScheme: 'light' });
});
