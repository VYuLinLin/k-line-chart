export type SNode = {
  value: number
  time: number
}
export interface ISparams {
  chart: any
  series: any
  priceScale?: number
  data: SNode[]
}
