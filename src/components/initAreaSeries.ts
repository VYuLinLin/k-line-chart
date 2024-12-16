import { LastPriceAnimationMode, createChart } from 'lightweight-charts'

const initAreaSeries = (container: string | HTMLElement, chartConfig: any, seriesConfig: any) => {
  const chart = createChart(container, {
    rightPriceScale: {
      minimumWidth: 5, // 纵座标与容器右侧的距离
      autoScale: true,
      borderColor: '#eee',
      borderVisible: true,
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    },
    timeScale: {
      barSpacing: 0, // 条的间距,默认6 使曲线变化比较平顺
      borderVisible: true,
      minBarSpacing: 0.4,
      rightOffset: 20, // 线与右侧的距离，默认0
      uniformDistribution: true,
      // ticksVisible: true,
      tickMarkMaxCharacterLength: 0.5,
      rightBarStaysOnScroll: true,
      allowBoldLabels: false,
      visible: true,
      secondsVisible: true,
      timeVisible: true,
      fixLeftEdge: true,
      borderColor: '#eee',
      tickMarkFormatter: (time: number, tickMarkType: any, locale: Intl.LocalesArgument) => {
        const millisecond = time % 5000
        let t = 0
        let showTime = ''
        if (millisecond > 4850) {
          t = time + (5000 - millisecond)
        } else if (millisecond < 150) {
          t = time - millisecond
        }
        if (t) {
          showTime = new Date(t).toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        }
        return showTime
      },
    },
    layout: {
      attributionLogo: false,
      textColor: '#8d92a1',
      fontSize: 11,
    },
    grid: {
      horzLines: {
        color: '#303030',
        visible: false,
      },
      vertLines: {
        color: '#303030',
        visible: false,
      },
    },
    crosshair: {
      mode: 2,
    },
    handleScale: {
      mouseWheel: false,
      pinch: false,
      axisPressedMouseMove: false,
    },
    ...chartConfig,
  })

  const areaSeries = chart.addAreaSeries({
    lastPriceAnimation: LastPriceAnimationMode.OnDataUpdate,
    topColor: 'rgba(244, 196, 62, 0.55)',
    bottomColor: 'rgba(244, 196, 62, 0)',
    lineColor: '#ffd15c',
    lineWidth: 2,
    lineType: 2,
    priceLineSource: 1,
    priceLineColor: '#9bDebb',
    priceLineStyle: 3,
    priceLineVisible: true,
    lastValueVisible: true,
    // shiftVisibleRangeOnNewBar: false,
    ...seriesConfig,
  })

  // 右滑 图表可视范围最小宽度为26%
  function onVisibleLogicalRangeChanged(newVisibleLogicalRange: any) {
    if (!newVisibleLogicalRange) return
    const { from, to } = newVisibleLogicalRange
    const barsInfo = areaSeries.barsInLogicalRange(newVisibleLogicalRange)
    const position = (to - from) * 0.74
    if (barsInfo !== null && barsInfo.barsAfter < -position) {
      chart.timeScale()?.scrollToPosition(position, false)
    }
  }

  chart.timeScale().subscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChanged)
  return { areaSeries, chart }
}
export default initAreaSeries
