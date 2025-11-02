<template>
  <div id="app">
    <Navbar />
    <div class="container">
      <RouterView />
    </div>
  </div>
</template>

<script>
import { defineComponent, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from './vue-components/Navbar.vue'
import router from './router'
import { useUserStore } from './stores/userStore'

export default defineComponent({
  name: 'App',
  components: {
    RouterView,
    Navbar
  },
  setup() {
    const userStore = useUserStore()
    
    onMounted(async () => {
      await userStore.checkAuth()
    })
    
    return {
      userStore
    }
  }
})
</script>

<style>
#app {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>