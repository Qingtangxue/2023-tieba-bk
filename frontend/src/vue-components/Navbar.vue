<template>
  <nav class="navbar">
    <div class="container">
      <router-link to="/" class="logo">百度贴吧</router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/tiebas" class="nav-link">贴吧</router-link>
        <router-link to="/search" class="nav-link">搜索</router-link>
        <div v-if="userStore.user" class="user-info">
          <router-link to="/profile" class="nav-link">{{ userStore.user.username }}</router-link>
          <button @click="handleLogout" class="btn btn-secondary">退出</button>
        </div>
        <div v-else class="auth-buttons">
          <router-link to="/login" class="btn btn-secondary">登录</router-link>
          <router-link to="/register" class="btn btn-primary">注册</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

export default defineComponent({
  name: 'Navbar',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    const handleLogout = () => {
      userStore.logout()
      router.push('/')
    }

    return {
      userStore,
      handleLogout
    }
  }
})
</script>

<style scoped>
.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FF6B35;
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  text-decoration: none;
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.nav-link:hover {
  background-color: #f5f5f5;
}

.nav-link.router-link-active {
  background-color: #FF6B35;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.auth-buttons {
  display: flex;
  gap: 0.5rem;
}
</style>