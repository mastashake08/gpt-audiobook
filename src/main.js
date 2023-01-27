import Vue from 'vue'
import App from './App.vue'
import Ads from 'vue-google-adsense'
import './registerServiceWorker'
Vue.config.productionTip = false
Vue.use(require('vue-script2'))
Vue.use(Ads.Adsense)
new Vue({
  render: h => h(App),
}).$mount('#app')
