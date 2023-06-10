# Important

The extension is still under development, please don't publish it to Chrome Web Store. I will do it after fixing all issues.


# Images
![image](https://github.com/JSerwatka/notion-syntax-highlighter/assets/33938646/c2f641a6-557b-42da-ab8b-0de5e37239c4)
![image](https://github.com/JSerwatka/notion-syntax-highlighter/assets/33938646/bf54cb99-9941-4f59-9bf6-96e4f2182b1b)
![image](https://github.com/JSerwatka/notion-syntax-highlighter/assets/33938646/37e19a64-200e-44c7-ac78-8302ab9ed3cc)


# notion-syntax-highlighter

> a chrome extension tools built with Vite + Vanilla, and Manifest v3

## Installing

1. Check if your `Node.js` version is >= **14**.
2. Change or configurate the name of your extension on `src/manifest`.
3. Run `npm install` to install the dependencies.

## Developing

run the command

```shell
$ cd notion-syntax-highlighter

$ npm run dev
```

### Chrome Extension Developer Mode

1. set your Chrome browser 'Developer mode' up
2. click 'Load unpacked', and select `notion-syntax-highlighter/build` folder

### Nomal FrontEnd Developer Mode

1. access `http://localhost:3000/`
2. when debugging popup page, open `/popup.html`
3. when debugging options page, open `/options.html`

## Packing

After the development of your extension run the command

```shell
$ npm build
```

Now, the content of `build` folder will be the extension ready to be submitted to the Chrome Web Store. Just take a look at the [official guide](https://developer.chrome.com/webstore/publish) to more infos about publishing.

---

Generated by [create-chrome-ext](https://github.com/guocaoyi/create-chrome-ext)
