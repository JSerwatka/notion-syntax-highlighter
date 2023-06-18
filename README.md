# Important

The extension is still under development, please don't publish it to Chrome Web Store. I will do it after fixing all issues.

<!-- ![image](https://github.com/JSerwatka/notion-syntax-highlighter/assets/33938646/cc69a04a-1970-4426-9a20-e4b2460d2fdb)
![image](https://github.com/JSerwatka/notion-syntax-highlighter/assets/33938646/b71cd034-9a65-49c6-9bf0-d5f1d312bd19)
![image](https://github.com/JSerwatka/notion-syntax-highlighter/assets/33938646/4ebed17e-6243-4a51-87d1-bc6f0d4d9b54) -->

# Notion Syntax Highlighter

## About

### **245 themes available**

From `Groovbox` to `Solarized`, find the theme that suits you best. Whether you prefer light mode or dark mode, I won't judge.

<!-- #TODO add imgs -->

### **Improved syntax highlighting**

Prism, which is used by Notion, has a rather limited keyword library.

It's greatly improved with this extension. Check comparison below:

<!-- #TODO add imgs -->

### **Update syntax highlighting on language change**

Notion lacks automatic updating of syntax highlighting when changing the language. To see the changes, you need to manually click on the code block.

This issue is resolved with this extension. Check comparison below:

<!-- #TODO add gifs -->

---

## Developing

1. Check if your `Node.js` version is >= **14**
2. Clone this repo and `cd` into it
   ```shell
   git clone https://github.com/JSerwatka/notion-syntax-highlighter.git
   cd notion-syntax-highlighter
   ```
3. Install the dependencies
   ```shell
   npm i
   ```
4. Build the project in dev mode

   ```shell
   npm run dev
   ```

5. Enable `Developer mode` in your `Manage Extensions` tab
6. Click `Load unpacked`, and select `notion-syntax-highlighter/build` folder

---

## Known issues

- **Character limit on highlighting**: Syntax highlighting gets disabled after reaching a certain character limit. This mechanism is built into Notion's code blocks originally due to performance issues.
- **Slow on large code snippets**: When you haven't reached the threshold for disabling syntax highlighting but stil working with a very large code snippet, writing code inside a code block can become sluggish. This is an inherent issue with Notion's code blocks. I will explore ways to improve performance by identifying the differences between the previous and new code blocks and implementing granular HTML editing.
- **Some languages are not supported by `highlight.js`**: Highlighting and themes will fallback to Notion's default for certain languages, such as:

  - ABAP
  - Agda
  - Dhall
  - Flow
  - Idris
  - Mermaid
  - PureScript
  - Racket

  If you need support for these languages, please create a parser. Check [higlightjs parsers](https://github.com/highlightjs/highlight.js/tree/main/src/languages) for refernece.

This extension requires thorough testing, so if you encounter any issues, please report them as bugs.

---

## Build with

Chrome Extension with Vite template from [create-chrome-ext](https://github.com/guocaoyi/create-chrome-ext)

Themes and syntax highlighting thanks to [highlight.js](https://github.com/highlightjs/highlight.js)
