<script setup lang="ts">
import kLineChart from '@/components/kLineChart.vue'
import { ref } from 'vue'
import type { SNode } from '..'

const kLineDataList = ref<SNode[]>([])
let newData = ref<SNode>()
let cacheList: SNode[] = []
const getKLineDataList = () => {
  console.info('Start loading mock data')
  import('./mock/historyData.json').then((res) => {
    kLineDataList.value = res.data.map((a) => ({
      time: a.lastTime,
      value: Number(a.close),
    }))
    const latestNode = kLineDataList.value[kLineDataList.value.length - 1]
    cacheList = kLineDataList.value
      .slice()
      .reverse()
      .map((a, i, arr) => ({
        time: latestNode.time + 1000 * (i + 1),
        value: a.value,
      }))

    const flag = setInterval(() => {
      if (!cacheList.length) {
        console.info('Loading mock data is over')
        clearInterval(flag)
        return
      }
      const newNode = cacheList.shift()
      if (newNode) {
        newData.value = newNode
      }
    }, 1000)
  })
}
getKLineDataList()
</script>

<template>
  <main>
    <kLineChart :list="kLineDataList" :newData="newData"></kLineChart>
  </main>
</template>

<style scoped>
main {
  width: 100%;
  height: 30vh;
}
</style>
