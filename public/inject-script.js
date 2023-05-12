function waitForPrism() {
  if (window.Prism) {
    window.Prism.highlight = function () {
      console.log('test');
    };
  } else {
    console.log('no Prism');
    setTimeout(waitForPrism, 1000);
  }
}

waitForPrism();
