// TODO: do I need it?
export {};

// Set default themes
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['defaultThemes', 'selectedTheme'], (result) => {
    const defaultThemes =
      result.defaultThemes === undefined
        ? ['base16/gruvbox-dark-medium', 'atom-one-dark', 'gradient-dark']
        : result.defaultThemes;
    const selectedTheme =
      result.selectedTheme === undefined ? 'gradient-dark' : result.selectedTheme;
    chrome.storage.sync.set({ defaultThemes, selectedTheme });
  });
});
