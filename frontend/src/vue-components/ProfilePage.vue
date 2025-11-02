<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="container">
        <div class="user-info-card">
          <div class="avatar-section">
            <div class="avatar">
              <img :src="user.avatar || '/default-avatar.png'" alt="用户头像" />
              <button class="edit-avatar-btn" @click="showAvatarEdit = true">更换头像</button>
            </div>
          </div>
          <div class="user-details">
            <h1 class="username">{{ user.username }}</h1>
            <p class="nickname">{{ user.nickname || user.username }}</p>
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-value">{{ user.postCount || 0 }}</span>
                <span class="stat-label">帖子</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ user.followers || 0 }}</span>
                <span class="stat-label">粉丝</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ user.following || 0 }}</span>
                <span class="stat-label">关注</span>
              </div>
            </div>
            <div class="user-actions">
              <button class="btn btn-primary" @click="showEditModal = true">编辑资料</button>
              <button class="btn btn-secondary" @click="handleLogout">退出登录</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <div class="container">
        <div class="profile-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.key"
            :class="['tab-btn', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <!-- 我的帖子 -->
          <div v-if="activeTab === 'posts'" class="tab-panel">
            <h3>我的帖子</h3>
            <div v-if="userPosts.length === 0" class="empty-state">
              <p>您还没有发布过帖子</p>
              <router-link to="/tiebas" class="btn btn-primary">去发帖</router-link>
            </div>
            <div v-else class="posts-list">
              <div v-for="post in userPosts" :key="post.id" class="post-item">
                <h4 class="post-title">{{ post.title }}</h4>
                <div class="post-meta">
                  <span class="tieba-name">{{ post.tiebaName }}</span>
                  <span class="post-time">{{ formatTime(post.createdAt) }}</span>
                  <span class="post-views">{{ post.views }} 浏览</span>
                  <span class="post-likes">{{ post.likes }} 赞</span>
                </div>
                <div class="post-actions">
                  <button class="btn btn-sm btn-info" @click="viewPost(post.id)">查看</button>
                  <button class="btn btn-sm btn-warning" @click="editPost(post)">编辑</button>
                  <button class="btn btn-sm btn-danger" @click="deletePost(post.id)">删除</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 我的贴吧 -->
          <div v-if="activeTab === 'tiebas'" class="tab-panel">
            <h3>我关注的贴吧</h3>
            <div v-if="userTiebas.length === 0" class="empty-state">
              <p>您还没有关注任何贴吧</p>
              <router-link to="/tiebas" class="btn btn-primary">去发现贴吧</router-link>
            </div>
            <div v-else class="tiebas-grid">
              <div v-for="tieba in userTiebas" :key="tieba.id" class="tieba-card">
                <div class="tieba-avatar">{{ tieba.name.charAt(0) }}</div>
                <h4 class="tieba-name">{{ tieba.name }}</h4>
                <p class="tieba-desc">{{ tieba.description }}</p>
                <div class="tieba-stats">
                  <span>{{ tieba.memberCount }} 成员</span>
                  <span>{{ tieba.postCount }} 帖子</span>
                </div>
                <button class="btn btn-secondary" @click="unfollowTieba(tieba.id)">取消关注</button>
              </div>
            </div>
          </div>

          <!-- 账号设置 -->
          <div v-if="activeTab === 'settings'" class="tab-panel">
            <h3>账号设置</h3>
            <div class="settings-form">
              <div class="setting-group">
                <label>邮箱地址</label>
                <div class="setting-value">{{ user.email }}</div>
                <button class="btn btn-sm btn-outline">修改邮箱</button>
              </div>
              <div class="setting-group">
                <label>密码</label>
                <div class="setting-value">********</div>
                <button class="btn btn-sm btn-outline" @click="showPasswordModal = true">修改密码</button>
              </div>
              <div class="setting-group">
                <label>隐私设置</label>
                <div class="privacy-options">
                  <label>
                    <input type="checkbox" v-model="privacySettings.profilePublic" />
                    公开个人资料
                  </label>
                  <label>
                    <input type="checkbox" v-model="privacySettings.postsPublic" />
                    公开我的帖子
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑资料模态框 -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑个人资料</h3>
          <button class="close-btn" @click="showEditModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateProfile">
            <div class="form-group">
              <label>昵称</label>
              <input type="text" v-model="editForm.nickname" />
            </div>
            <div class="form-group">
              <label>个人简介</label>
              <textarea v-model="editForm.bio" rows="3" placeholder="介绍一下自己..."></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="showEditModal = false" class="btn btn-secondary">取消</button>
              <button type="submit" class="btn btn-primary">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 修改密码模态框 -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="showPasswordModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>修改密码</h3>
          <button class="close-btn" @click="showPasswordModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updatePassword">
            <div class="form-group">
              <label>当前密码</label>
              <input type="password" v-model="passwordForm.currentPassword" required />
            </div>
            <div class="form-group">
              <label>新密码</label>
              <input type="password" v-model="passwordForm.newPassword" required />
            </div>
            <div class="form-group">
              <label>确认新密码</label>
              <input type="password" v-model="passwordForm.confirmPassword" required />
            </div>
            <div class="form-actions">
              <button type="button" @click="showPasswordModal = false" class="btn btn-secondary">取消</button>
              <button type="submit" class="btn btn-primary">确认修改</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

export default defineComponent({
  name: 'ProfilePage',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    const activeTab = ref('posts')
    const showEditModal = ref(false)
    const showPasswordModal = ref(false)
    const showAvatarEdit = ref(false)
    
    const tabs = [
      { key: 'posts', label: '我的帖子' },
      { key: 'tiebas', label: '我的贴吧' },
      { key: 'settings', label: '账号设置' }
    ]
    
    const user = computed(() => userStore.user || {
      username: '用户',
      email: 'user@example.com',
      postCount: 0,
      followers: 0,
      following: 0
    })
    
    const editForm = reactive({
      nickname: '',
      bio: ''
    })
    
    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    const privacySettings = reactive({
      profilePublic: true,
      postsPublic: true
    })
    
    // 模拟数据
    const userPosts = ref([
      {
        id: 1,
        title: 'Vue3 开发经验分享',
        tiebaName: '前端开发',
        createdAt: '2023-10-15T10:30:00Z',
        views: 156,
        likes: 23
      },
      {
        id: 2,
        title: 'JavaScript 最佳实践',
        tiebaName: '编程技术',
        createdAt: '2023-10-10T14:20:00Z',
        views: 89,
        likes: 15
      }
    ])
    
    const userTiebas = ref([
      {
        id: 1,
        name: '前端开发',
        description: '前端技术交流社区',
        memberCount: 1250,
        postCount: 5600
      },
      {
        id: 2,
        name: '编程技术',
        description: '编程技术讨论区',
        memberCount: 890,
        postCount: 3200
      }
    ])
    
    const formatTime = (timeString) => {
      return new Date(timeString).toLocaleDateString('zh-CN')
    }
    
    const viewPost = (postId) => {
      router.push(`/post/${postId}`)
    }
    
    const editPost = (post) => {
      alert(`编辑帖子: ${post.title}`)
    }
    
    const deletePost = (postId) => {
      if (confirm('确定要删除这个帖子吗？')) {
        userPosts.value = userPosts.value.filter(post => post.id !== postId)
      }
    }
    
    const unfollowTieba = (tiebaId) => {
      if (confirm('确定要取消关注这个贴吧吗？')) {
        userTiebas.value = userTiebas.value.filter(tieba => tieba.id !== tiebaId)
      }
    }
    
    const updateProfile = () => {
      alert('个人资料已更新')
      showEditModal.value = false
    }
    
    const updatePassword = () => {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }
      alert('密码修改成功')
      showPasswordModal.value = false
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    }
    
    const handleLogout = () => {
      userStore.logout()
      router.push('/')
    }
    
    onMounted(() => {
      editForm.nickname = user.value.nickname || user.value.username
    })
    
    return {
      activeTab,
      tabs,
      user,
      userPosts,
      userTiebas,
      showEditModal,
      showPasswordModal,
      showAvatarEdit,
      editForm,
      passwordForm,
      privacySettings,
      formatTime,
      viewPost,
      editPost,
      deletePost,
      unfollowTieba,
      updateProfile,
      updatePassword,
      handleLogout
    }
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 0;
}

.user-info-card {
  display: flex;
  align-items: center;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar {
  position: relative;
  text-align: center;
}

.avatar img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
}

.edit-avatar-btn {
  margin-top: 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-avatar-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.user-details {
  flex: 1;
}

.username {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.nickname {
  font-size: 1.2rem;
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
}

.user-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.user-actions {
  display: flex;
  gap: 1rem;
}

.profile-content {
  padding: 2rem 0;
}

.profile-tabs {
  display: flex;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 1rem 2rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 1rem;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  color: #007AFF;
  border-bottom-color: #007AFF;
}

.tab-btn:hover {
  color: #007AFF;
}

.tab-panel h3 {
  margin-bottom: 1.5rem;
  color: #333;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-item {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.post-title {
  margin: 0 0 1rem 0;
  color: #333;
}

.post-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.post-actions {
  display: flex;
  gap: 0.5rem;
}

.tiebas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.tieba-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.tieba-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #007AFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 auto 1rem;
}

.tieba-name {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.tieba-desc {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.tieba-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #999;
}

.settings-form {
  max-width: 500px;
}

.setting-group {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.setting-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.setting-value {
  color: #666;
  margin-bottom: 1rem;
}

.privacy-options label {
  display: flex;
  align-items: center;
  font-weight: normal;
  margin-bottom: 0.5rem;
}

.privacy-options input {
  margin-right: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-info-card {
    flex-direction: column;
    text-align: center;
  }
  
  .user-stats {
    justify-content: center;
  }
  
  .user-actions {
    justify-content: center;
  }
  
  .profile-tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    text-align: center;
  }
  
  .tiebas-grid {
    grid-template-columns: 1fr;
  }
}
</style>