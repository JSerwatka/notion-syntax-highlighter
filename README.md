# Chrome Web Store updates
This extension is currently undergoing a review process to be made available in the Chrome Web Store. Once the review is completed, I will update this repository with the link.

# Notion Syntax Highlighter

Notion Syntax Highlighter is a Chrome extension that improves Notion's code blocks syntax highlighting and adds tons of theme options.

**Contents**

- [Features](#features)
  - [245 themes available](#245-themes-available)
  - [Improved syntax highlighting](#improved-syntax-highlighting)
  - [Update syntax highlighting on language change](#update-syntax-highlighting-on-language-change)
- [Developing](#developing)
- [Known issues](#known-issues)
- [Build with](#build-with)

## Features

### **245 themes available**

From `Groovbox` to `Solarized`, find the theme that suits you best. Whether you prefer light mode or dark mode, I won't judge.
![All themes](https://github.com/JSerwatka/notion-syntax-highlighter/assets/33938646/71b6c8a7-c587-434e-b4b3-ab0514424001)

### **Improved syntax highlighting**

Prism, which is used by Notion, has a rather limited keyword library.

It's noticeably improved with this extension.
![Default vs Notion Syntax Highlighter](https://github.com/JSerwatka/notion-syntax-highlighter/assets/33938646/e9c43e31-7a94-41f8-bb12-f706ba144fcc)

### **Update syntax highlighting on language change**

Notion lacks automatic updating of syntax highlighting when changing the language. To see the changes, you need to manually click on the code block.

This issue is resolved with this extension.
![language change](https://github.com/JSerwatka/notion-syntax-highlighter/assets/33938646/0b0f8d66-e21e-44bf-8500-a6cfc22565ea)

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
- **Slow on large code snippets**: When you haven't reached the threshold for disabling syntax highlighting but still working with a very large code snippet, writing code inside a code block can become sluggish. This is an inherent issue with Notion's code blocks. I will explore ways to improve performance by identifying the differences between the previous and new code blocks and implementing granular HTML editing.
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

- **Changing Notion appearance requires page refreshing**: When you switch the appearance of Notion from "dark" to "light" (or the other way around), the font color inside the code blocks may not always update. To solve this problem, refresh the page

<br/>
This extension requires thorough testing, so if you encounter any issues, please report them as bugs.

---

## Build with

Chrome Extension with Vite template from [create-chrome-ext](https://github.com/guocaoyi/create-chrome-ext)

Themes and syntax highlighting thanks to [highlight.js](https://github.com/highlightjs/highlight.js)
