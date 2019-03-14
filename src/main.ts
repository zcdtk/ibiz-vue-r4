import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

import iView from 'iview';
import 'iview/dist/styles/iview.css';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(iView);
Vue.use(ElementUI);

import IBizAppMenu from './ibizsys/components/ibiz-app-menu/ibiz-app-menu.vue';
Vue.component('ibiz-app-menu', IBizAppMenu);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
