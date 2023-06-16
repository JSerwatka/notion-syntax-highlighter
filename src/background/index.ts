import { ThemeName } from '../utils/themes';

// Set default themes
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['defaultThemes', 'selectedTheme'], (result) => {
    const defaultThemes: ThemeName[] =
      result.defaultThemes === undefined
        ? ['Gruvbox Dark Medium', 'Atom One Dark', 'Gradient Dark']
        : result.defaultThemes;
    const selectedTheme: ThemeName = result.selectedTheme === undefined ? 'Gradient Dark' : result.selectedTheme;
    chrome.storage.sync.set({ defaultThemes, selectedTheme });
  });
});
