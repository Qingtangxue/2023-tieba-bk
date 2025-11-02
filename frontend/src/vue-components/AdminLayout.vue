<template>
  <div class="admin-layout">
    <!-- 顶部导航栏 -->
    <div class="admin-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="logo">百度贴吧管理后台</h1>
        </div>
        <div class="header-center">
          <div class="search-box">
            <input 
              type="text" 
              placeholder="搜索帖子、用户、贴吧..." 
              class="search-input"
              v-model="searchKeyword"
            />
            <button class="search-btn">
              <i class="search-icon">🔍</i>
            </button>
          </div>
        </div>
        <div class="header-right">
          <div class="user-info">
            <div class="message-icon">
              <span class="badge">3</span>
              💬
            </div>
            <div class="user-avatar">
              <img :src="userStore.user?.avatar || '/default-avatar.png'" alt="用户头像" />
            </div>
            <div class="user-name">{{ userStore.user?.username || '管理员' }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="admin-container">
      <!-- 侧边栏 -->
      <div class="admin-sidebar">
        <nav class="sidebar-nav">
          <ul>
            <li 
              v-for="item in menuItems" 
              :key="item.key"
              :class="{ active: activeMenu === item.key }"
              @click="activeMenu = item.key"
            >
              <i class="menu-icon">{{ item.icon }}</i>
              <span class="menu-text">{{ item.text }}</span>
            </li>
          </ul>
        </nav>
      </div>

      <!-- 主内容区 -->
      <div class="admin-main">
        <div class="main-content">
          <!-- 动态加载对应模块 -->
          <component :is="currentComponent" />
        </div>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="admin-footer">
      <div class="footer-content">
        <div class="copyright">
          © 2023 百度贴吧 - 毕业设计项目
        </div>
        <div class="help-links">
          <a href="#" class="help-link">帮助中心</a>
          <a href="#" class="help-link">关于我们</a>
          <a href="#" class="help-link">联系我们</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import { useUserStore } from '../stores/userStore'
import PostManagement from './admin/PostManagement.vue'
import TiebaManagement from './admin/TiebaManagement.vue'
import UserManagement from './admin/UserManagement.vue'

export default defineComponent({
  name: 'AdminLayout',
  components: {
    PostManagement,
    TiebaManagement,
    UserManagement
  },
  setup() {
    const userStore = useUserStore()
    const activeMenu = ref('posts')
    const searchKeyword = ref('')

    const menuItems = [
      { key: 'posts', text: '帖子管理', icon: '📝' },
      { key: 'tiebas', text: '贴吧管理', icon: '🏷️' },
      { key: 'users', text: '用户管理', icon: '👥' }
    ]

    const currentComponent = computed(() => {
      switch (activeMenu.value) {
        case 'posts': return 'PostManagement'
        case 'tiebas': return 'TiebaManagement'
        case 'users': return 'UserManagement'
        default: return 'PostManagement'
      }
    })

    return {
      userStore,
      activeMenu,
      searchKeyword,
      menuItems,
      currentComponent
    }
  }
})
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

/* 顶部导航栏样式 */
.admin-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left .logo {
  font-size: 20px;
  font-weight: 600;
  color: #1890ff;
  margin: 0;
}

.header-center {
  flex: 1;
  max-width: 400px;
  margin: 0 40px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 6px;
  padding: 4px 8px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px;
  outline: none;
  font-size: 14px;
}

.search-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #666;
}

.header-right .user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-icon {
  position: relative;
  cursor: pointer;
  font-size: 18px;
}

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ff4d4f;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #e8e8e8;
}

.user-name {
  font-weight: 500;
  color: #333;
}

/* 主容器 */
.admin-container {
  display: flex;
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* 侧边栏 */
.admin-sidebar {
  width: 200px;
  background: white;
  border-right: 1px solid #e8e8e8;
  min-height: calc(100vh - 64px - 60px);
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.sidebar-nav li:hover {
  background: #f0f7ff;
  color: #1890ff;
}

.sidebar-nav li.active {
  background: #e6f7ff;
  color: #1890ff;
  border-left-color: #1890ff;
}

.menu-icon {
  margin-right: 12px;
  font-size: 16px;
}

.menu-text {
  font-size: 14px;
  font-weight: 500;
}

/* 主内容区 */
.admin-main {
  flex: 1;
  padding: 24px;
  min-height: calc(100vh - 64px - 60px);
}

.main-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 100%;
}

/* 底部信息 */
.admin-footer {
  background: white;
  border-top: 1px solid #e8e8e8;
  padding: 16px 0;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.copyright {
  color: #666;
  font-size: 14px;
}

.help-links {
  display: flex;
  gap: 20px;
}

.help-link {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.help-link:hover {
  color: #1890ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .header-center {
    margin: 0 20px;
    max-width: 200px;
  }
  
  .admin-container {
    flex-direction: column;
  }
  
  .admin-sidebar {
    width: 100%;
    min-height: auto;
  }
  
  .sidebar-nav ul {
    display: flex;
    overflow-x: auto;
  }
  
  .sidebar-nav li {
    flex-shrink: 0;
    border-left: none;
    border-bottom: 3px solid transparent;
  }
  
  .sidebar-nav li.active {
    border-left-color: transparent;
    border-bottom-color: #1890ff;
  }
  
  .admin-main {
    padding: 16px;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>