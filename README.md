# LUT Filter ![](https://img.shields.io/npm/v/lut-filter?style=flat-square)

Rendering image with LUT filter effect.

## Install

### CDN

```html
<script src="https://unpkg.com/lut-filter/lut-filter.js"></script>
```

### NPM

```sh
# yarn
yarn add lut-filter
# npm
npm install lut-filter
```

## Usage

### WebGL

```js
import lutFilter from 'lut-filter/webgl'

lutFilter({
  canvas: <HTMLCanvasElement>,
  image: <HTMLImageElement>,
  filterImage: <HTMLImageElement>
})
```

[Playground](https://jsbin.com/gixozet)

### WebGPU

```js
import lutFilter from 'lut-filter/webgpu'

lutFilter({
  canvas: <HTMLCanvasElement>,
  image: <HTMLImageElement>,
  filterImage: <HTMLImageElement>
})
```

[Playground](https://jsbin.com/daxexom)

![](docs/webgpu-vs-webgl.png)

## LICENSE

[MIT](LICENSE)
