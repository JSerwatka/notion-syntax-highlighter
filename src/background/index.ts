export {};
// chrome.webNavigation.onCompleted.addListener(
//   function (details) {
//     if (details.url.startsWith('https://www.notion.so/')) {
//       // Code to execute on page refresh or change
//       chrome.tabs.executeScript(details.tabId, { file: '../content/index.js' })
//     }
//   },
//   { url: [{ urlMatches: 'https://www.notion.so/*' }] },
// )

// Set default themes
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['defaultThemes', 'selectedTheme'], (result) => {
    const defaultThemes =
      result.defaultThemes === undefined
        ? ['vs2015', 'base16/solarized-light', 'default']
        : result.defaultThemes;
    const selectedTheme = result.selectedTheme === undefined ? 'vs2015' : result.selectedTheme;
    chrome.storage.sync.set({ defaultThemes, selectedTheme });
  });
});
