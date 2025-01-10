import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import Vue3ColorPicker from 'vue3-colorpicker'

const app = createApp(App)
app.use(Antd);
app.use(createPinia())
app.use(router)
app.use(Vue3ColorPicker)

app.mount('#app')
