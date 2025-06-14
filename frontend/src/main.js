import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.directive('motion-slide-visible', {
  mounted(el) {
    el.style.opacity = '0'
    el.style.transform = 'translateY(20px)'
    setTimeout(() => {
      el.style.transition = 'opacity 0.5s, transform 0.5s'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    }, 50)
  }
})

app.use(router)
app.mount('#app') 