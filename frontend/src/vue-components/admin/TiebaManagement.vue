<template>
  <div class="tieba-management">
    <div class="page-header">
      <h2>贴吧管理</h2>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showCreateModal = true">
          <i>➕</i> 新建贴吧
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <input 
          type="text" 
          placeholder="搜索贴吧名称..." 
          class="filter-input"
          v-model="searchName"
        />
        <select v-model="filterStatus" class="filter-select">
          <option value="">全部状态</option>
          <option value="active">活跃</option>
          <option value="inactive">不活跃</option>
          <option value="banned">封禁</option>
        </select>
        <select v-model="filterCategory" class="filter-select">
          <option value="">全部分类</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <button class="btn btn-secondary" @click="resetFilters">重置</button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ totalTiebas }}</div>
        <div class="stat-label">总贴吧数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ activeTiebas }}</div>
        <div class="stat-label">活跃贴吧</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalMembers }}</div>
        <div class="stat-label">总成员数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalPosts }}</div>
        <div class="stat-label">总帖子数</div>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>贴吧名称</th>
            <th>分类</th>
            <th>成员数</th>
            <th>帖子数</th>
            <th>创建时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tieba in filteredTiebas" :key="tieba.id">
            <td>{{ tieba.id }}</td>
            <td class="tieba-name">
              <div class="tieba-info">
                <div class="tieba-avatar">{{ tieba.name.charAt(0) }}</div>
                <div>
                  <div class="tieba-title">{{ tieba.name }}</div>
                  <div class="tieba-desc">{{ tieba.description }}</div>
                </div>
              </div>
            </td>
            <td>{{ tieba.category }}</td>
            <td>{{ tieba.memberCount }}</td>
            <td>{{ tieba.postCount }}</td>
            <td>{{ formatDate(tieba.createdAt) }}</td>
            <td>
              <span :class="`status status-${tieba.status}`">
                {{ getStatusText(tieba.status) }}
              </span>
            </td>
            <td class="actions">
              <button class="btn btn-sm btn-info" @click="viewTieba(tieba.id)">查看</button>
              <button class="btn btn-sm btn-warning" @click="editTieba(tieba)">编辑</button>
              <button 
                v-if="tieba.status !== 'banned'" 
                class="btn btn-sm btn-danger" 
                @click="banTieba(tieba.id)"
              >
                封禁
              </button>
              <button 
                v-if="tieba.status === 'banned'" 
                class="btn btn-sm btn-success" 
                @click="unbanTieba(tieba.id)"
              >
                解封
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

    <!-- 创建贴吧模态框 -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>创建新贴吧</h3>
          <button class="close-btn" @click="showCreateModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createTieba">
            <div class="form-group">
              <label>贴吧名称</label>
              <input type="text" v-model="newTieba.name" required />
            </div>
            <div class="form-group">
              <label>描述</label>
              <textarea v-model="newTieba.description" rows="4" required></textarea>
            </div>
            <div class="form-group">
              <label>分类</label>
              <select v-model="newTieba.category" required>
                <option value="">选择分类</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
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
  name: 'TiebaManagement',
  setup() {
    const tiebas = ref([
      {
        id: 1,
        name: '前端技术',
        description: '前端开发技术交流社区',
        category: '技术',
        memberCount: 152000,
        postCount: 28450,
        status: 'active',
        createdAt: '2023-01-15T10:00:00Z'
      },
      {
        id: 2,
        name: '原神',
        description: '原神游戏讨论区',
        category: '游戏',
        memberCount: 287000,
        postCount: 56780,
        status: 'active',
        createdAt: '2023-02-20T14:30:00Z'
      },
      {
        id: 3,
        name: 'Python编程',
        description: 'Python学习与交流',
        category: '技术',
        memberCount: 124000,
        postCount: 19870,
        status: 'active',
        createdAt: '2023-03-10T09:15:00Z'
      },
      {
        id: 4,
        name: '违规贴吧',
        description: '因违规内容被封禁',
        category: '其他',
        memberCount: 500,
        postCount: 120,
        status: 'banned',
        createdAt: '2023-04-05T16:45:00Z'
      }
    ])

    const categories = ref(['技术', '游戏', '生活', '学习', '娱乐', '其他'])

    const searchName = ref('')
    const filterStatus = ref('')
    const filterCategory = ref('')
    const currentPage = ref(1)
    const pageSize = 10
    const showCreateModal = ref(false)
    const newTieba = ref({
      name: '',
      description: '',
      category: ''
    })

    const filteredTiebas = computed(() => {
      return tiebas.value.filter(tieba => {
        const matchesName = tieba.name.toLowerCase().includes(searchName.value.toLowerCase())
        const matchesStatus = !filterStatus.value || tieba.status === filterStatus.value
        const matchesCategory = !filterCategory.value || tieba.category === filterCategory.value
        
        return matchesName && matchesStatus && matchesCategory
      })
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredTiebas.value.length / pageSize)
    })

    const totalTiebas = computed(() => tiebas.value.length)
    const activeTiebas = computed(() => tiebas.value.filter(t => t.status === 'active').length)
    const totalMembers = computed(() => tiebas.value.reduce((sum, t) => sum + t.memberCount, 0))
    const totalPosts = computed(() => tiebas.value.reduce((sum, t) => sum + t.postCount, 0))

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
      searchName.value = ''
      filterStatus.value = ''
      filterCategory.value = ''
      currentPage.value = 1
    }

    const viewTieba = (tiebaId) => {
      alert(`查看贴吧 ${tiebaId}`)
    }

    const editTieba = (tieba) => {
      alert(`编辑贴吧 ${tieba.id}`)
    }

    const banTieba = (tiebaId) => {
      if (confirm('确定要封禁这个贴吧吗？')) {
        const tieba = tiebas.value.find(t => t.id === tiebaId)
        if (tieba) {
          tieba.status = 'banned'
        }
      }
    }

    const unbanTieba = (tiebaId) => {
      const tieba = tiebas.value.find(t => t.id === tiebaId)
      if (tieba) {
        tieba.status = 'active'
      }
    }

    const createTieba = () => {
      tiebas.value.unshift({
        id: Date.now(),
        name: newTieba.value.name,
        description: newTieba.value.description,
        category: newTieba.value.category,
        memberCount: 0,
        postCount: 0,
        status: 'active',
        createdAt: new Date().toISOString()
      })
      
      showCreateModal.value = false
      newTieba.value = { name: '', description: '', category: '' }
    }

    onMounted(() => {
      console.log('贴吧管理组件已加载')
    })

    return {
      tiebas,
      categories,
      searchName,
      filterStatus,
      filterCategory,
      currentPage,
      pageSize,
      showCreateModal,
      newTieba,
      filteredTiebas,
      totalPages,
      totalTiebas,
      activeTiebas,
      totalMembers,
      totalPosts,
      getStatusText,
      formatDate,
      resetFilters,
      viewTieba,
      editTieba,
      banTieba,
      unbanTieba,
      createTieba
    }
  }
})
</script>

<style scoped>
.tieba-management {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.tieba-name {
  max-width: 300px;
}

.tieba-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tieba-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.tieba-title {
  font-weight: 500;
  color: #333;
}

.tieba-desc {
  color: #666;
  font-size: 12px;
  margin-top: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tieba-management {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .tieba-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .tieba-avatar {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>