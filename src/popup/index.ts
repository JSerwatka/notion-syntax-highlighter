import './index.css';

// const select = document.getElementById('theme-select') as HTMLSelectElement;
// select.addEventListener('change', () => {
//   const theme = select.value;
//   chrome.storage.sync.set({ theme }).then(() => console.log('theme set'));
//   // chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
//   //   chrome.tabs.sendMessage(tabs[0].id, { action: "changeTheme", theme });
//   // });
// });

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.defaultThemes) {
    const defaultThemes = changes.defaultThemes.newValue as string[];
    const themeSelectElement = document.querySelector('select#theme-select');

    if (!themeSelectElement) {
      return;
    }

    // Remove all existing options
    while (themeSelectElement.firstChild) {
      themeSelectElement.removeChild(themeSelectElement.firstChild);
    }

    // Add new options
    defaultThemes.forEach((defaultTheme) => {
      const optionElement = document.createElement('option');
      optionElement.value = defaultTheme;
      optionElement.text = defaultTheme;
      themeSelectElement.appendChild(optionElement);
    });
  }
});

chrome.storage.sync.get(['defaultThemes', 'selectedTheme'], (result) => {
  const defaultThemes = result.defaultThemes as string[];
  const selectedTheme = result.selectedTheme as string;
  const themeSelectElement = document.querySelector('select#theme-select');

  console.log(defaultThemes);
  if (!themeSelectElement || defaultThemes.length === 0) {
    return;
  }

  defaultThemes.forEach((defaultTheme) => {
    const optionElement = document.createElement('option');
    optionElement.value = defaultTheme;
    optionElement.text = defaultTheme;
    if (defaultTheme === selectedTheme) {
      optionElement.selected = true;
    }
    themeSelectElement.appendChild(optionElement);
  });
});

const themeSelectElement = document.querySelector('select#theme-select');
if (themeSelectElement) {
  themeSelectElement.addEventListener('change', (event) => {
    const selectedTheme = (event.target as HTMLSelectElement).value;
    chrome.storage.sync.set({ selectedTheme });
  });
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main>
    <label for="theme-select">Select a theme:</label>
    <select id="theme-select">
    </select>
    More themes available in options!
  </main>
`;
