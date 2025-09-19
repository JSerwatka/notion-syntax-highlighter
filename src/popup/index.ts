import './index.css';

const themeSelectElement = document.querySelector('select#theme-select') as HTMLSelectElement;
const optionsLink = `<a class="options-link" href="${chrome.runtime.getURL('options.html')}" target=”_blank”>options page</a>`;

const createOptions = (defaultThemes: string[], selectedTheme: string) => {
  defaultThemes.forEach((defaultTheme) => {
    const optionElement = document.createElement('option');
    optionElement.value = defaultTheme;
    optionElement.text = defaultTheme;
    if (defaultTheme === selectedTheme) {
      optionElement.selected = true;
    }
    themeSelectElement.appendChild(optionElement);
  });
};

const createMoreThemesInfo = () => {
  const linkWrapper = document.querySelector('.options-link-wrapper');

  const themesLocationInfoElement = document.createElement('div');
  themesLocationInfoElement.innerHTML = `More themes available in the ${optionsLink}!`;

  linkWrapper?.appendChild(themesLocationInfoElement);
};
createMoreThemesInfo();

// Update default themes options if the list has changed
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.defaultThemes) {
    const defaultThemes = changes.defaultThemes.newValue as string[];

    // Remove all existing options
    while (themeSelectElement.firstChild) {
      themeSelectElement.removeChild(themeSelectElement.firstChild);
    }

    chrome.storage.sync.get(['selectedTheme'], (result) => {
      const selectedTheme = result.selectedTheme as string;
      // Add new options
      createOptions(defaultThemes, selectedTheme);
    });
  }
});

// Create options for all default themes
chrome.storage.sync.get(['defaultThemes', 'selectedTheme'], (result) => {
  const defaultThemes = result.defaultThemes as string[];
  const selectedTheme = result.selectedTheme as string;

  // Handle no theme selected
  // TODO add better styles
  if (defaultThemes.length === 0) {
    const mainElement = document.querySelector('main') as HTMLBaseElement;
    mainElement.innerHTML = `No themes selected - go to ${optionsLink} to choose default themes`;
    mainElement.classList.add('no-theme-warning');
  }

  createOptions(defaultThemes, selectedTheme);
});

// Update selectedTheme when new option chosen
themeSelectElement.addEventListener('change', (event) => {
  const selectedTheme = (event.target as HTMLSelectElement).value;
  chrome.storage.sync.set({ selectedTheme });
});
