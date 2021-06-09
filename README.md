# webgl-lut-filter &middot; [![npm version](https://img.shields.io/npm/v/webgl-lut-filter?style=flat)](https://www.npmjs.com/package/webgl-lut-filter)

Use WebGL to render images based on LUT filter images.

[Playground](https://webgl-lut-filter.stackblitz.io/)

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/webgl-lut-filter/webgl-lut-filter.js"></script>
```

### NPM

```sh
$ npm i webgl-lut-filter
# or
$ yarn add webgl-lut-filter
```

## How to use

```js
import lutFilter from 'webgl-lut-filter'

lutFilter({
  canvas: <HTMLCanvasElement>,
  image: <HTMLImageElement>,
  filterImage: <HTMLImageElement>
})
```
