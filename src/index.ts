import kLineChart from './components/kLineChart.vue'

import type { App } from 'vue'

const components = [kLineChart]

export function install(app: App) {
  components.forEach((component) => {
    app.component(component.name as string, component)
  })
}

export default {
  install,
}

export { kLineChart }
