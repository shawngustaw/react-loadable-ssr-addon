# React Loadable SSR Add-on
> Server Side Render add-on for React Loadable. Load splitted chunks was never that easy.

[![NPM][npm-image]][npm-url]
[![CircleCI][circleci-image]][circleci-url]
[![GitHub All Releases][releases-image]][releases-url]
[![GitHub stars][stars-image]][stars-url]
[![Known Vulnerabilities][vulnerabilities-image]][vulnerabilities-url]
[![GitHub issues][issues-image]][issues-url]
[![Awesome][awesome-image]][awesome-url]

## Description

`React Loadable SSR Add-on` is a `server side render` add-on for [React Loadable](https://github.com/jamiebuilds/react-loadable)
that helps you to load dynamically all files dependencies, e.g. `splitted chunks`, `css`, etc.

Oh yeah, and we also **provide support for [SRI (Subresource Integrity)](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)**.

<br />

## Installation

**Download our NPM Package**

```sh
npm install react-loadable-ssr-addon
# or
yarn add react-loadable-ssr-addon
```

**Note**: `react-loadable-ssr-addon` **should not** be listed in the `devDependencies`.

<br />

## How to use

### 1 - Webpack Plugin

First we need to import the package into our component;

```javascript
const ReactLoadableSSRAddon = require('react-loadable-ssr-addon');

module.exports = {
  entry: {
    // ...
  },
  output: {
    // ...
  },
  module: {
    // ...
  },
  plugins: [
    new ReactLoadableSSRAddon({
      filename: 'assets-manifest.json',
    }),
  ],
};
```

<br />

### 2 - On the Server


```js
// import `getBundles` to map required modules and its dependencies
import { getBundles } from 'react-loadable-ssr-addon';
// then import the assets manifest file generated by the Webpack Plugin
import manifest from './your-output-folder/assets-manifest.json';

...

// react-loadable ssr implementation
const modules = new Set();

const html = ReactDOMServer.renderToString(
<Loadable.Capture report={moduleName => modules.add(moduleName)}>
  <App />
</Loadable.Capture>
);

...

// now we concatenate the loaded `modules` from react-loadable `Loadable.Capture` method
// with our application entry point
const modulesToBeLoaded = [...manifest.entrypoints, ...Array.from(modules)];
// also if you find your project still fetching the files after the placement
// maybe a good idea to switch the order from the implementation above to
// const modulesToBeLoaded = [...Array.from(modules), ...manifest.entrypoints];
// see the issue #6 regarding this thread
// https://github.com/themgoncalves/react-loadable-ssr-addon/issues/6

// after that, we pass the required modules to `getBundles` map it.
// `getBundles` will return all the required assets, group by `file type`.
const bundles = getBundles(manifest, modulesToBeLoaded);

// so it's easy to implement it
const styles = bundles.css || [];
const scripts = bundles.js || [];

res.send(`
  <!doctype html>
  <html lang="en">
    <head>...</head>
    ${styles.map(style => {
      return `<link href="/dist/${style.file}" rel="stylesheet" />`;
    }).join('\n')}
    <body>
      <div id="app">${html}</div>
      ${scripts.map(script => {
        return `<script src="/dist/${script.file}"></script>`
      }).join('\n')}
  </html>
`);
```

See how easy to implement it is?

<br />

## API Documentation

### Webpack Plugin options

#### `filename`

Type: `string`
Default: `react-loadable.json`

Assets manifest file name. May contain relative or absolute path.


#### `integrity`

Type: `boolean`
Default: `false`

Enable or disable generation of [Subresource Integrity (SRI).](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) hash.

#### `integrityAlgorithms`

Type: `array`
Default: `[ 'sha256', 'sha384', 'sha512' ]`

Algorithms to generate hash.


#### `integrityPropertyName`

Type: `string`
Default: `integrity`

Custom property name to be output in the assets manifest file.


**Full configuration example**

```js
new ReactLoadableSSRAddon({
  filename: 'assets-manifest.json',
  integrity: false,
  integrityAlgorithms: [ 'sha256', 'sha384', 'sha512' ],
  integrityPropertyName: 'integrity',
})
```

<br />

### Server Side

### `getBundles`

```js
import { getBundles } from 'react-loadable-ssr-addon';

/**
 * getBundles
 * @param {object} manifest - The assets manifest content generate by ReactLoadableSSRAddon
 * @param {array} chunks - Chunks list to be loaded
 * @returns {array} - Assets list group by file type
 */
const bundles = getBundles(manifest, modules);


const styles = bundles.css || [];
const scripts = bundles.js || [];
const xml = bundles.xml || [];
const json = bundles.json || [];
...
```

<br />

### Assets Manifest

#### `Basic Structure`

```json
{
  "entrypoints": [ ],
  "origins": {
    "app": [ ]
  },
  "assets": {
    "app": {
      "js": [
        {
          "file": "",
          "hash": "",
          "publicPath": "",
          "integrity": ""
        }
      ]
    }
  }
}
```

#### `entrypoints`

Type: `array`

List of all application entry points defined in Webpack `entry`.


#### `origins`

Type: `array`

Origin name requested. List all assets required for the requested origin.


#### `assets`

Type: `array` of objects

Lists all application assets generate by Webpack, group by file type,
containing an `array of objects` with the following format:

```js
[file-type]: [
    {
      "file": "",       // assets file
      "hash": "",       // file hash generated by Webpack
      "publicPath": "", // assets file + webpack public path
      "integrity": ""   // integrity base64 hash, if enabled
    }
]
```

<br />

### Assets Manifest Example

```json
{
  "entrypoints": [
    "app"
  ],
  "origins": {
    "./home": [
      "home"
    ],
    "./about": [
      "about"
    ],
    "app": [
      "vendors",
      "app"
    ],
     "vendors": [
       "app",
       "vendors"
     ]
  },
  "assets": {
    "home": {
      "js": [
        {
          "file": "home.chunk.js",
          "hash": "fdb00ffa16dfaf9cef0a",
          "publicPath": "/dist/home.chunk.js",
          "integrity": "sha256-Xxf7WVjPbdkJjgiZt7mvZvYv05+uErTC9RC2yCHF1RM= sha384-9OgouqlzN9KrqXVAcBzVMnlYOPxOYv/zLBOCuYtUAMoFxvmfxffbNIgendV4KXSJ sha512-oUxk3Swi0xIqvIxdWzXQIDRYlXo/V/aBqSYc+iWfsLcBftuIx12arohv852DruxKmlqtJhMv7NZp+5daSaIlnw=="
        }
      ]
    },
    "about": {
      "js": [
        {
          "file": "about.chunk.js",
          "hash": "7e88ef606abbb82d7e82",
          "publicPath": "/dist/about.chunk.js",
          "integrity": "sha256-ZPrPWVJRjdS4af9F1FzkqTqqSGo1jYyXNyctwTOLk9o= sha384-J1wiEV8N1foqRF7W9SEvg2s/FhQbhpKFHBTNBJR8g1yEMNRMi38y+8XmjDV/Iu7w sha512-b16+PXStO68CP52R+0ZktccMiaI1v0jOy34l/DqyGN7kEae3DpV3xPNoC8vt1WfE1kCAH7dlnHDdp1XRVhZX+g=="
        }
      ]
    },
    "app": {
      "css": [
        {
          "file": "app.css",
          "hash": "5888714915d8e89a8580",
          "publicPath": "/dist/app.css",
          "integrity": "sha256-3y4DyCC2cLII5sc2kaElHWhBIVMHdan/tA0akReI9qg= sha384-vCMVPKjSrrNpfnhmCD9E8SyHdfPdnM3DO/EkrbNI2vd0m2wH6BnfPja6gt43nDIF"
        }
      ],
      "js": [
        {
          "file": "app.bundle.js",
          "hash": "0cbd05b10204597c781d",
          "publicPath": "/dist/app.bundle.js",
          "integrity": "sha256-sGdw+WVvXK1ZVQnYHI4FpecOcZtWZ99576OHCdrGil8= sha384-DZZzkPtPCTCR5UOWuGCyXQvsjyvZPoreCzqQGyrNV8+HyV9MdoYZawHX7NdGGLyi sha512-y29BlwBuwKB+BeXrrQYEBrK+mfWuOb4ok6F57kGbtrwa/Xq553Zb7lgss8RNvFjBSaMUdvXiJuhmP3HZA0jNeg=="
        }
      ]
    },
    "vendors": {
      "css": [
        {
          "file": "vendors.css",
          "hash": "5a9586c29103a034feb5",
          "publicPath": "/dist/vendors.css"
        }
      ],
      "js": [
        {
          "file": "vendors.chunk.js",
          "hash": "5a9586c29103a034feb5",
          "publicPath": "/dist/vendors.chunk.js"
        }
      ]
    }
  }
}
```

<br />

## Release History
* 0.3.0
    * NEW: [`@babel/runtime` become a explicit dependency](https://github.com/themgoncalves/react-loadable-ssr-addon/pull/22) by [@RDIL](https://github.com/RDIL)
        > Requirement for `yarn v2`.
* 0.2.3
    * FIX: [Parsing `null` or `undefined` to object on `getBundles()`](https://github.com/themgoncalves/react-loadable-ssr-addon/pull/21) reported by [@slorber](https://github.com/slorber)
* 0.2.2
    * FIX: As precaution measure, downgrade few dependencies due to node SemVer incompatibility.
* 0.2.1
    * FIX: [Possible missing chunk](https://github.com/themgoncalves/react-loadable-ssr-addon/pull/20) reported by [@lex111](https://github.com/lex111)
* 0.2.0
    * Improvement: Reduce memory consumption ([Issue #17](https://github.com/themgoncalves/react-loadable-ssr-addon/issues/17)) reported by [@endiliey](https://github.com/endiliey)

<details>
  <summary>See older release note</summary>

* 0.1.9
    * FIX: [Missing entry in origins](https://github.com/themgoncalves/react-loadable-ssr-addon/pull/13) reported by [@p-j](https://github.com/p-j);
* 0.1.8
    * Includes all features from deprecated v0.1.7;
    * FIX: [Issue #11](https://github.com/themgoncalves/react-loadable-ssr-addon/issues/11) reported by [@endiliey](https://github.com/endiliey)
* ~~0.1.7 (_deprecated_)~~
    * FIX: [`Cannot read property 'integrity' of undefined`](https://github.com/themgoncalves/react-loadable-ssr-addon/pull/10) reported by [@nguyenngocphuongnb](https://github.com/nguyenngocphuongnb);
    * Minor improvements.
* 0.1.6
    * FIX: `getManifestOutputPath` method when requested from `Webpack Dev Middleware`;
* 0.1.5
    * FIX: [Issue #7](https://github.com/themgoncalves/react-loadable-ssr-addon/issues/7) reported by [@themgoncalves](https://github.com/themgoncalves) and [@tomkelsey](https://github.com/tomkelsey)
* 0.1.4
    * FIX: [Issue #5](https://github.com/themgoncalves/react-loadable-ssr-addon/issues/5) reported by [@tomkelsey](https://github.com/tomkelsey)
* 0.1.3
    * FIX: [Issue #4](https://github.com/themgoncalves/react-loadable-ssr-addon/issues/4) reported by [@tomkelsey](https://github.com/tomkelsey)
* 0.1.2
    * FIX: [Issue #2](https://github.com/themgoncalves/react-loadable-ssr-addon/issues/2) reported by [@tatchi](https://github.com/tatchi)
* 0.1.1
    * FIX: [Issue #1](https://github.com/themgoncalves/react-loadable-ssr-addon/issues/1) reported by [@tatchi](https://github.com/tatchi)
* 0.1.0
    * First release
    * NEW: Created `getBundles()` to retrieve required assets
    * NEW: Created `ReactLoadableSSRAddon` Plugin for Webpack 3+
* 0.0.1
    * Work in progress
</details>

<br />

## Meta

### Author
**Marcos Gonçalves** – [LinkedIn](http://linkedin.com/in/themgoncalves/) – [Website](http://www.themgoncalves.com)

### License
Distributed under the MIT license. [Click here](/LICENSE) for more information.

[https://github.com/themgoncalves/react-loadable-ssr-addon](https://github.com/themgoncalves/react-loadable-ssr-addon)

## Contributing

1. Fork it (<https://github.com/themgoncalves/react-loadable-ssr-addon/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -m ':zap: Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

### Emojis for categorizing commits:

⚡️ New feature (`:zap:`)  
🐛 Bug fix (`:bug:`)    
🔥 P0 fix (`:fire:`)  
✅ Tests (`:white_check_mark:`)  
🚀 Performance improvements (`:rocket:`)  
🖍 CSS / Styling (`:crayon:`)  
♿ Accessibility (`:wheelchair:`)  
🌐 Internationalization (`:globe_with_meridians:`)  
📖 Documentation (`:book:`)  
🏗 Infrastructure / Tooling / Builds / CI (`:building_construction:`)  
⏪ Reverting a previous change (`:rewind:`)  
♻️ Refactoring (like moving around code w/o any changes) (`:recycle:`)  
🚮 Deleting code (`:put_litter_in_its_place:`)

<!-- Markdown link & img dfn's -->

[circleci-image]:https://circleci.com/gh/themgoncalves/react-loadable-ssr-addon.svg?style=svg
[circleci-url]: https://circleci.com/gh/themgoncalves/react-loadable-ssr-addon
[vulnerabilities-image]: https://snyk.io/test/github/themgoncalves/react-loadable-ssr-addon/badge.svg
[vulnerabilities-url]: https://snyk.io/test/github/themgoncalves/react-loadable-ssr-addon
[issues-image]: https://img.shields.io/github/issues/themgoncalves/react-loadable-ssr-addon.svg
[issues-url]: https://github.com/themgoncalves/react-loadable-ssr-addon/issues
[stars-image]: https://img.shields.io/github/stars/themgoncalves/react-loadable-ssr-addon.svg
[stars-url]: https://github.com/themgoncalves/react-loadable-ssr-addon/stargazers
[forks-image]: https://img.shields.io/github/forks/themgoncalves/react-loadable-ssr-addon.svg
[forks-url]: https://github.com/themgoncalves/react-loadable-ssr-addon/network
[releases-image]: https://img.shields.io/npm/dm/react-loadable-ssr-addon.svg
[releases-url]: https://github.com/themgoncalves/react-loadable-ssr-addon
[awesome-image]: https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg
[awesome-url]: https://github.com/themgoncalves/react-loadable-ssr-addon
[npm-image]: https://img.shields.io/npm/v/react-loadable-ssr-addon.svg
[npm-url]: https://www.npmjs.com/package/react-loadable-ssr-addon
