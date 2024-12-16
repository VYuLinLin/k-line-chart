# k-line-chart

一个使用vue3和lightweight-charts的秒k线组件

## 功能

1、支持自定义lightweight-charts全部配置

2、自适应屏幕分辨率，宽度、高度自适应

3、支持价格精度控制

4、过滤插针数据，减少小尖角

# 示意图

![image](asstes/sline2024.png)
<video src="asstes/sline2024.mp4" autoplay="true" controls="controls" width="400" height="320">
</video>

# 使用方式

## 1. 安装

`npm i k-line-chart`

## 2. 引用

```javascript
import VdepthChart from 'k-line-chart'
// 全局引用
Vue.use(VdepthChart)
```

## 3.调用

example/App.vue

```javascript
<kLineChart :list="kLineDataList" :newData="newData"></kLineChart>
```
