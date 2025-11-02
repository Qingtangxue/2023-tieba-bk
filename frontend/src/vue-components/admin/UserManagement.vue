<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showCreateModal = true">
          <i>➕</i> 新建用户
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <input 
          type="text" 
          placeholder="搜索用户名或邮箱..." 
          class="filter-input"
          v-model="searchKeyword"
        />
        <select v-model="filterRole" class="filter-select">
          <option value="">全部角色</option>
          <option value="admin">管理员</option>
          <option value="moderator">版主</option>
          <option value="user">普通用户</option>
        </select>
        <select v-model="filterStatus" class="filter-select">
          <option value="">全部状态</option>
          <option value="active">活跃</option>
          <option value="inactive">不活跃</option>
          <option value="banned">封禁</option>
        </select>
        <button class="btn btn-secondary" @click="resetFilters">重置</button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ totalUsers }}</div>
        <div class="stat-label">总用户数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ activeUsers }}</div>
        <div class="stat-label">活跃用户</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ adminUsers }}</div>
        <div class="stat-label">管理员</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ moderatorUsers }}</div>
        <div class="stat-label">版主</div>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户信息</th>
            <th>角色</th>
            <th>注册时间</th>
            <th>最后登录</th>
            <th>帖子数</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td class="user-info">
              <div class="user-avatar">
                <img :src="user.avatar || '/default-avatar.png'" alt="用户头像" />
              </div>
              <div class="user-details">
                <div class="user-name">{{ user.username }}</div>
                <div class="user-email">{{ user.email }}</div>
              </div>
            </td>
            <td>
              <span :class="`role role-${user.role}`">
                {{ getRoleText(user.role) }}
              </span>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>{{ formatDate(user.lastLogin) }}</td>
            <td>{{ user.postCount }}</td>
            <td>
              <span :class="`status status-${user.status}`">
                {{ getStatusText(user.status) }}
              </span>
            </td>
            <td class="actions">
              <button class="btn btn-sm btn-info" @click="viewUser(user.id)">查看</button>
              <button class="btn btn-sm btn-warning" @click="editUser(user)">编辑</button>
              <button 
                v-if="user.status !== 'banned'" 
                class="btn btn-sm btn-danger" 
                @click="banUser(user.id)"
              >
                封禁
              </button>
              <button 
                v-if="user.status === 'banned'" 
                class="btn btn-sm btn-success" 
                @click="unbanUser(user.id)"
              >
                解封
              </button>
              <button 
                v-if="user.role !== 'admin'" 
                class="btn btn-sm btn-primary" 
                @click="promoteUser(user.id)"
              >
                提升权限
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button 
        :disabled="currentPage === 1" 
        @click="currentPage--"
        class="pagination-btn"
      >
        上一页
      </button>
      <span class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      <button 
        :disabled="currentPage === totalPages" 
        @click="currentPage++"
        class="pagination-btn"
      >
        下一页
      </button>
    </div>

    <!-- 创建用户模态框 -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>创建新用户</h3>
          <button class="close-btn" @click="showCreateModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createUser">
            <div class="form-group">
              <label>用户名</label>
              <input type="text" v-model="newUser.username" required />
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input type="email" v-model="newUser.email" required />
            </div>
            <div class="form-group">
              <label>密码</label>
              <input type="password" v-model="newUser.password" required />
            </div>
            <div class="form-group">
              <label>角色</label>
              <select v-model="newUser.role" required>
                <option value="user">普通用户</option>
                <option value="moderator">版主</option>
                <option value="admin">管理员</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" @click="showCreateModal = false" class="btn btn-secondary">取消</button>
              <button type="submit" class="btn btn-primary">创建</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'

export default defineComponent({
  name: 'UserManagement',
  setup() {
    const users = ref([
      {
        id: 1,
        username: '管理员',
        email: 'admin@tieba.com',
        avatar: '/admin-avatar.png',
        role: 'admin',
        status: 'active',
        postCount: 156,
        createdAt: '2023-01-01T00:00:00Z',
        lastLogin: '2023-10-15T14:30:00Z'
      },
      {
        id: 2,
        username: '前端开发者',
        email: 'frontend@example.com',
        avatar: '/user-avatar.png',
        role: 'moderator',
        status: 'active',
        postCount: 89,
        createdAt: '2023-02-15T10:00:00Z',
        lastLogin: '2023-10-14T20:15:00Z'
      },
      {
        id: 3,
        username: '游戏爱好者',
        email: 'gamer@example.com',
        avatar: '/user-avatar.png',
        role: 'user',
        status: 'active',
        postCount: 45,
        createdAt: '2023-03-20T14:30:00Z',
        lastLogin: '2023-10-13T09:45:00Z'
      },
      {
        id: 4,
        username: '违规用户',
        email: 'banned@example.com',
        avatar: '/user-avatar.png',
        role: 'user',
        status: 'banned',
        postCount: 12,
        createdAt: '2023-04-05T16:45:00Z',
        lastLogin: '2023-09-01T11:20:00Z'
      }
    ])

    const searchKeyword = ref('')
    const filterRole = ref('')
    const filterStatus = ref('')
    const currentPage = ref(1)
    const pageSize = 10
    const showCreateModal = ref(false)
    const newUser = ref({
      username: '',
      email: '',
      password: '',
      role: 'user'
    })

    const filteredUsers = computed(() => {
      return users.value.filter(user => {
        const matchesKeyword = 
          user.username.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
          user.email.toLowerCase().includes(searchKeyword.value.toLowerCase())
        const matchesRole = !filterRole.value || user.role === filterRole.value
        const matchesStatus = !filterStatus.value || user.status === filterStatus.value
        
        return matchesKeyword && matchesRole && matchesStatus
      })
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredUsers.value.length / pageSize)
    })

    const totalUsers = computed(() => users.value.length)
    const activeUsers = computed(() => users.value.filter(u => u.status === 'active').length)
    const adminUsers = computed(() => users.value.filter(u => u.role === 'admin').length)
    const moderatorUsers = computed(() => users.value.filter(u => u.role === 'moderator').length)

    const getRoleText = (role) => {
      const roleMap = {
        admin: '管理员',
        moderator: '版主',
        user: '普通用户'
      }
      return roleMap[role] || role
    }

    const getStatusText = (status) => {
      const statusMap = {
        active: '活跃',
        inactive: '不活跃',
        banned: '封禁'
      }
      return statusMap[status] || status
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('zh-CN')
    }

    const resetFilters = () => {
      searchKeyword.value = ''
      filterRole.value = ''
      filterStatus.value = ''
      currentPage.value = 1
    }

    const viewUser = (userId) => {
      alert(`查看用户 ${userId}`)
    }

    const editUser = (user) => {
      alert(`编辑用户 ${user.id}`)
    }

    const banUser = (userId) => {
      if (confirm('确定要封禁这个用户吗？')) {
        const user = users.value.find(u => u.id === userId)
        if (user) {
          user.status = 'banned'
        }
      }
    }

    const unbanUser = (userId) => {
      const user = users.value.find(u => u.id === userId)
      if (user) {
        user.status = 'active'
      }
    }

    const promoteUser = (userId) => {
      if (confirm('确定要提升这个用户的权限吗？')) {
        const user = users.value.find(u => u.id === userId)
        if (user) {
          if (user.role === 'user') {
            user.role = 'moderator'
          } else if (user.role === 'moderator') {
            user.role = 'admin'
          }
        }
      }
    }

    const createUser = () => {
      users.value.unshift({
        id: Date.now(),
        username: newUser.value.username,
        email: newUser.value.email,
        avatar: '/user-avatar.png',
        role: newUser.value.role,
        status: 'active',
        postCount: 0,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      })
      
      showCreateModal.value = false
      newUser.value = { username: '', email: '', password: '', role: 'user' }
    }

    onMounted(() => {
      console.log('用户管理组件已加载')
    })

    return {
      users,
      searchKeyword,
      filterRole,
      filterStatus,
      currentPage,
      pageSize,
      showCreateModal,
      newUser,
      filteredUsers,
      totalPages,
      totalUsers,
      activeUsers,
      adminUsers,
      moderatorUsers,
      getRoleText,
      getStatusText,
      formatDate,
      resetFilters,
      viewUser,
      editUser,
      banUser,
      unbanUser,
      promoteUser,
      createUser
    }
  }
})
</script>

<style scoped>
.user-management {
  padding: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #e8e8e8;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.user-email {
  color: #666;
  font-size: 12px;
}

.role {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-admin {
  background: #f6ffed;
  color: #52c41a;
}

.role-moderator {
  background: #e6f7ff;
  color: #1890ff;
}

.role-user {
  background: #f5f5f5;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-management {
    padding: 16px;
  }
  
  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .user-avatar img {
    width: 32px;
    height: 32px;
  }
  
  .actions {
    flex-direction: column;
    gap: 4px;
  }
}
</style>