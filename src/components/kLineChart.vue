<template>
  <div class="k-line-chart" ref="chartEl"></div>
</template>

<script lang="ts" setup>
import { defineComponent, nextTick, onMounted, ref, watch } from 'vue'
import initAreaSeries from '@/components/initAreaSeries'
import SLineCore from './sLineCore'
import type { SNode } from '../../index.d.ts'
import type { IChartApi } from 'lightweight-charts'

defineComponent({
  name: 'kLineChart',
})

const props = defineProps({
  // 图表默认宽度
  width: { type: Number, default: () => 0 },
  // 图表默认高度
  height: { type: Number, default: () => 0 },
  // 历史数据
  list: { type: Array, default: () => [] as SNode[] },
  // 最新的数据
  newData: { type: Object, default: () => null },
  // 价格精度
  priceScale: { type: Number, default: () => 2 },
  // chart配置
  chartConfig: { type: Object, default: () => {} },
  // service配置
  seriesConfig: { type: Object, default: () => {} },
})
const chartEl = ref()
const width = ref(375) // 总宽
const height = ref(340) // 总高
const historyDataList = ref<SNode[]>([...(props.list as SNode[])])
let areaSeries = null
let areaChart: IChartApi | null = null
let sLineCore: any = null
watch(
  () => props.list,
  () => {
    if (!sLineCore) {
      historyDataList.value = [...(props.list as SNode[])]
      return
    }
    sLineCore.setSlineHistory(props.list as SNode[])
  },
)
watch(
  () => props.newData,
  (data) => {
    if (!sLineCore) {
      historyDataList.value.push(data as SNode)
      return
    }
    sLineCore.updateSlineNode(data)
  },
)
const init = () => {
  const w = props.width || width.value
  const h = props.height || height.value
  const chartConfig = {
    width: w,
    height: h,
    ...props.chartConfig,
  }
  const area = initAreaSeries(chartEl.value, chartConfig, props.seriesConfig)
  areaSeries = area.areaSeries
  areaChart = area.chart
  areaChart.timeScale().fitContent()
  sLineCore = new SLineCore({
    chart: areaChart,
    series: areaSeries,
    data: props.list as SNode[],
    priceScale: props.priceScale,
  })
}

const getClientSize = () => {
  if (!chartEl.value) return
  width.value = chartEl.value.clientWidth
  height.value = chartEl.value.clientHeight
  window.addEventListener('resize', getClientSize)
  if (areaChart) {
    nextTick(() => {
      areaChart?.resize(width.value, height.value)
      areaChart?.timeScale().fitContent()
    })
  }
}
onMounted(() => {
  getClientSize()
  init()
})
</script>
<style scoped>
/* 增加定位解决全屏问题 */
.k-line-chart {
  position: relative;
  width: 100%;
  height: 100%;
}
.k-line-chart > div:first-child {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}
</style>
