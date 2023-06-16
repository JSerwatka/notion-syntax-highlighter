// Set default themes

// TODO improve + use better types
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['defaultThemes', 'selectedTheme'], (result) => {
    const defaultThemes =
      result.defaultThemes === undefined
        ? ['Gruvbox Dark Medium', 'Atom One Dark', 'Gradient Dark']
        : result.defaultThemes;
    const selectedTheme = result.selectedTheme === undefined ? 'Gradient Dark' : result.selectedTheme;
    chrome.storage.sync.set({ defaultThemes, selectedTheme });
  });
});
