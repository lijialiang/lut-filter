# webgl-lut-filter

WebGL 根据 LUT 算法渲染图片

## 安装

```sh
$ npm i webgl-lut-filter

# 或者

$ yarn add webgl-lut-filter
```

## 使用

```js
import lutFilter from 'webgl-lut-filter'

lutFilter({
  // 需要描绘的 canvas html 对象
  canvas: HTMLCanvasElement,
  // 需要处理的图片 image html 对象
  image: HTMLImageElement,
  // 滤镜图片 image html 对象（滤镜图片最好先转为 base64 以防止轻易被获取图片资源）
  filterImage: HTMLImageElement
})
```
