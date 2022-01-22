# WebGL LUT Filter ![](https://img.shields.io/npm/v/webgl-lut-filter?style=flat-square)

Use `WebGL` to render image based on LUT filter image([example](./__test__/filter.png)).

[Playground](https://jsbin.com/tipidur)

## Install

### CDN

```html
<script src="https://unpkg.com/webgl-lut-filter/webgl-lut-filter.js"></script>
```

### NPM

```sh
# yarn
yarn add webgl-lut-filter
# npm
npm install webgl-lut-filter
```

## Usage

```js
import lutFilter from 'webgl-lut-filter'

lutFilter({
  canvas: <HTMLCanvasElement>,
  image: <HTMLImageElement>,
  filterImage: <HTMLImageElement>
})
```

## LICENSE

[MIT](LICENSE)
