import Big from 'big.js'
import type { SNode, ISparams } from '../../index.d.ts'

export default class SLineCore {
  [x: string]: any
  constructor({ priceScale, series, chart, data }: ISparams) {
    this.areaSeries = series
    this.areaChart = chart
    this.priceScale = priceScale || 0
    this.areaHistory = []
    this.notLoadedNodeList = []
    this.baseDelay = 20
    this.renderAnimationFrame = 0
    this.oldPriceData = null
    data.length && this.setSlineHistory(data)
  }
  // 获取平均值
  getMeanVal(node: SNode, nodeHistoryList: SNode[]) {
    // 插针数据不显示，平常取前后价格平均值，减少小尖角，增加曲线度
    if (!nodeHistoryList.length) return node.value
    const lastPriceData = nodeHistoryList[nodeHistoryList.length - 1]
    const lastHistory = nodeHistoryList.slice(-20).map((a) => a.value)
    const minVal = Math.min(...lastHistory)
    const maxVal = Math.max(...lastHistory)
    const mean10s = lastHistory
      .reduce((a, b) => new Big(b).plus(a), new Big(0))
      .div(lastHistory.length)
      .toNumber()
    const curValGap = new Big(node.value).minus(mean10s).toNumber()
    const preValGap = new Big(maxVal).minus(minVal).toNumber()
    const valRate = Math.floor(Math.abs(curValGap) / preValGap)
    if (curValGap && preValGap && Math.abs(curValGap) > preValGap && valRate > 8) {
      const newVal = new Big(lastPriceData.value).plus(new Big(curValGap).div(valRate)).toNumber()
      console.log(
        `插针倍率：${valRate}，价差：${curValGap}，平均值价格：${mean10s}，插针价格：${node.value}，修正价格：${newVal}`,
      )
      return newVal
    }
    return new Big(mean10s).plus(node.value).div(2).toNumber()
  }
  // 平滑数据生成
  dataFormat = (node: SNode[] | SNode, nodeHistoryList: SNode[]) => {
    let nodeList: SNode[] = []
    if (Array.isArray(node)) {
      node.map((n, i) => {
        if (i > 0) {
          const preNodeList = node.slice(0, i)
          n.value = this.getMeanVal(n, preNodeList)
          nodeList = nodeList.concat(this.dataFormat(n, preNodeList))
        } else {
          nodeList.push({
            value: n.value,
            time: n.time,
          })
        }
      })
    } else {
      const lastData = nodeHistoryList[nodeHistoryList.length - 1]
      const duration = node.time - lastData.time
      const count = Math.floor(duration / this.baseDelay)
      const priceVal = (node.value - lastData.value) / (count + 1)

      nodeList = Array.from({ length: count })
        .map((v, i) => ({
          value: lastData.value + priceVal * (i + 1),
          time: Math.min(lastData.time + this.baseDelay * (i + 1), node.time - 1),
        }))
        .concat(node)
    }
    return nodeList
  }
  // TODO:秒线图历史数据展示处理
  setSlineHistory(data: SNode[]) {
    clearTimeout(this.renderAnimationFrame)
    // 秒线图更新精度配置
    this.areaSeries.applyOptions({
      priceFormat: {
        type: 'price',
        minMove: this.priceScale <= 1 ? 0.01 : Number(Number(0).toFixed(this.priceScale - 1) + 1), // 价格数值越小，minMove也要变小，否则纵坐标无法显示
        precision: this.priceScale,
      },
    })
    this.areaHistory = data.slice(-1)
    this.notLoadedNodeList = []
    this.areaSeries.setData(this.dataFormat(data, data))
    this.areaChart.timeScale().scrollToPosition(20, false)
    this.renderSNode()
  }

  // TODO: 秒线动态数据更新
  updateSlineNode(node: SNode) {
    if (!this.areaHistory.length) return
    node.value = this.getMeanVal(node, this.areaHistory)
    // 秒线图超过一定数据，需要重新加载历史数据，避免K线图过长消耗渲染性能
    if (this.areaHistory.length > 150) {
      this.areaHistory.push(node)
      const newHistory = this.areaHistory.splice(-50)
      const nodeLen = this.notLoadedNodeList.length
      const notNodeCount = Math.round(nodeLen / (500 / this.baseDelay))
      // 根据未加载的节点数，计算剩余节点区间数，动态初始化历史数据
      if (notNodeCount > 1) {
        const cacheHistory = newHistory.splice(-notNodeCount)
        this.setSlineHistory(newHistory)
        cacheHistory.map((a: SNode) => this.updateSlineNode.bind(this)(a))
      } else {
        this.setSlineHistory(newHistory)
      }
    } else {
      this.notLoadedNodeList = this.notLoadedNodeList.concat(
        this.dataFormat(node, this.areaHistory),
      )
      this.areaHistory.push(node)
    }
  }
  // 渲染节点
  renderSNode() {
    const nodeLen = this.notLoadedNodeList.length
    if (nodeLen && this.areaHistory.length && this.areaSeries) {
      const node: SNode | undefined = this.notLoadedNodeList.shift()
      if (this.oldPriceData && node) {
        if (node.value < this.oldPriceData.value) {
          this.areaSeries.applyOptions({
            priceLineColor: '#f8465b', // 红降
          })
        } else if (node.value > this.oldPriceData.value) {
          this.areaSeries.applyOptions({
            priceLineColor: '#30bc6d', // 绿升
          })
        }
      }
      this.oldPriceData = node
      try {
        this.areaSeries.update(node) // 渲染新节点
      } catch (error) {
        console.error(error, node)
      }
    }
    const delay =
      nodeLen >= 60 ? this.baseDelay / 4 : nodeLen >= 40 ? this.baseDelay / 2 : this.baseDelay
    clearInterval(this.renderAnimationFrame)
    this.renderAnimationFrame = setTimeout(this.renderSNode.bind(this), delay)
  }
}
