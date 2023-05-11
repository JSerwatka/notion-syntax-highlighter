console.info('chrome-ext template-vanilla-ts background script')

export {}
let rule1 = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: { hostEquals: 'www.notion.so' },
    }),
  ],
  actions: [new chrome.declarativeContent.ShowPageAction()],
}

chrome.declarativeContent.onPageChanged.removeRules(undefined, (data) => {
  chrome.declarativeContent.onPageChanged.addRules([rule1], (data) => {
    console.log('addRules', data)
  })
})
