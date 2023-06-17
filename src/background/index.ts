import { ThemeName } from '../utils/themes';

chrome.runtime.onInstalled.addListener(() => {
  // Set default themes
  chrome.storage.sync.get(['defaultThemes', 'selectedTheme'], (result) => {
    const defaultThemes: ThemeName[] =
      result.defaultThemes === undefined
        ? ['Gruvbox Dark Medium', 'Atom One Dark', 'Gradient Dark']
        : result.defaultThemes;
    const selectedTheme: ThemeName = result.selectedTheme === undefined ? 'Gruvbox Dark Medium' : result.selectedTheme;
    chrome.storage.sync.set({ defaultThemes, selectedTheme });
  });

  // Set default color scheme
  chrome.storage.sync.set({ prefersColorScheme: 'dark' });
});
