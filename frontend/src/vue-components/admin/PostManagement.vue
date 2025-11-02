<template>
  <div class="post-management">
    <div class="page-header">
      <h2>帖子管理</h2>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showCreateModal = true">
          <i>➕</i> 新建帖子
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <input 
          type="text" 
          placeholder="搜索帖子标题..." 
          class="filter-input"
          v-model="searchTitle"
        />
        <select v-model="filterStatus" class="filter-select">
          <option value="">全部状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
          <option value="deleted">已删除</option>
        </select>
        <select v-model="filterTieba" class="filter-select">
          <option value="">全部贴吧</option>
          <option v-for="tieba in tiebas" :key="tieba.id" :value="tieba.id">
            {{ tieba.name }}
          </option>
        </select>
        <button class="btn btn-secondary" @click="resetFilters">重置</button>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>标题</th>
            <th>作者</th>
            <th>贴吧</th>
            <th>状态</th>
            <th>发布时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in filteredPosts" :key="post.id">
            <td>{{ post.id }}</td>
            <td class="post-title">{{ post.title }}</td>
            <td>{{ post.author }}</td>
            <td>{{ post.tiebaName }}</td>
            <td>
              <span :class="`status status-${post.status}`">
                {{ getStatusText(post.status) }}
              </span>
            </td>
            <td>{{ formatDate(post.createdAt) }}</td>
            <td class="actions">
              <button class="btn btn-sm btn-info" @click="viewPost(post.id)">查看</button>
              <button class="btn btn-sm btn-warning" @click="editPost(post)">编辑</button>
              <button 
                v-if="post.status !== 'deleted'" 
                class="btn btn-sm btn-danger" 
                @click="deletePost(post.id)"
              >
                删除
              </button>
              <button 
                v-if="post.status === 'deleted'" 
                class="btn btn-sm btn-success" 
                @click="restorePost(post.id)"
              >
                恢复
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

    <!-- 创建帖子模态框 -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>创建新帖子</h3>
          <button class="close-btn" @click="showCreateModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createPost">
            <div class="form-group">
              <label>标题</label>
              <input type="text" v-model="newPost.title" required />
            </div>
            <div class="form-group">
              <label>内容</label>
              <textarea v-model="newPost.content" rows="6" required></textarea>
            </div>
            <div class="form-group">
              <label>贴吧</label>
              <select v-model="newPost.tiebaId" required>
                <option value="">选择贴吧</option>
                <option v-for="tieba in tiebas" :key="tieba.id" :value="tieba.id">
                  {{ tieba.name }}
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
  name: 'PostManagement',
  setup() {
    const posts = ref([
      {
        id: 1,
        title: 'Vue和React哪个更适合大型项目？',
        author: '前端开发者',
        tiebaName: '前端技术',
        status: 'published',
        createdAt: '2023-10-15T14:30:00Z',
        content: '最近在考虑技术选型，想听听大家的意见...'
      },
      {
        id: 2,
        title: '原神新版本体验分享',
        author: '游戏爱好者',
        tiebaName: '原神',
        status: 'published',
        createdAt: '2023-10-14T20:15:00Z',
        content: '新版本更新了很多内容，大家觉得怎么样？'
      },
      {
        id: 3,
        title: 'Python数据分析实战经验',
        author: '数据科学家',
        tiebaName: 'Python编程',
        status: 'draft',
        createdAt: '2023-10-13T09:45:00Z',
        content: '分享一些数据分析的实用技巧和工具...'
      }
    ])

    const tiebas = ref([
      { id: 1, name: '前端技术' },
      { id: 2, name: '原神' },
      { id: 3, name: 'Python编程' },
      { id: 4, name: '游戏开发' },
      { id: 5, name: '人工智能' }
    ])

    const searchTitle = ref('')
    const filterStatus = ref('')
    const filterTieba = ref('')
    const currentPage = ref(1)
    const pageSize = 10
    const showCreateModal = ref(false)
    const newPost = ref({
      title: '',
      content: '',
      tiebaId: ''
    })

    const filteredPosts = computed(() => {
      return posts.value.filter(post => {
        const matchesTitle = post.title.toLowerCase().includes(searchTitle.value.toLowerCase())
        const matchesStatus = !filterStatus.value || post.status === filterStatus.value
        const matchesTieba = !filterTieba.value || post.tiebaName === 
          tiebas.value.find(t => t.id == filterTieba.value)?.name
        
        return matchesTitle && matchesStatus && matchesTieba
      })
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredPosts.value.length / pageSize)
    })

    const getStatusText = (status) => {
      const statusMap = {
        published: '已发布',
        draft: '草稿',
        deleted: '已删除'
      }
      return statusMap[status] || status
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('zh-CN')
    }

    const resetFilters = () => {
      searchTitle.value = ''
      filterStatus.value = ''
      filterTieba.value = ''
      currentPage.value = 1
    }

    const viewPost = (postId) => {
      alert(`查看帖子 ${postId}`)
    }

    const editPost = (post) => {
      alert(`编辑帖子 ${post.id}`)
    }

    const deletePost = (postId) => {
      if (confirm('确定要删除这个帖子吗？')) {
        const post = posts.value.find(p => p.id === postId)
        if (post) {
          post.status = 'deleted'
        }
      }
    }

    const restorePost = (postId) => {
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.status = 'published'
      }
    }

    const createPost = () => {
      const tieba = tiebas.value.find(t => t.id == newPost.value.tiebaId)
      if (tieba) {
        posts.value.unshift({
          id: Date.now(),
          title: newPost.value.title,
          author: '当前用户',
          tiebaName: tieba.name,
          status: 'published',
          createdAt: new Date().toISOString(),
          content: newPost.value.content
        })
        
        showCreateModal.value = false
        newPost.value = { title: '', content: '', tiebaId: '' }
      }
    }

    onMounted(() => {
      // 模拟数据加载
      console.log('帖子管理组件已加载')
    })

    return {
      posts,
      tiebas,
      searchTitle,
      filterStatus,
      filterTieba,
      currentPage,
      pageSize,
      showCreateModal,
      newPost,
      filteredPosts,
      totalPages,
      getStatusText,
      formatDate,
      resetFilters,
      viewPost,
      editPost,
      deletePost,
      restorePost,
      createPost
    }
  }
})
</script>

<style scoped>
.post-management {
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

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-bar {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.filter-group {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-input, .filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-input {
  min-width: 200px;
}

.filter-select {
  min-width: 120px;
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.post-title {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-published {
  background: #e6f7ff;
  color: #1890ff;
}

.status-draft {
  background: #fff7e6;
  color: #fa8c16;
}

.status-deleted {
  background: #fff2f0;
  color: #ff4d4f;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 11px;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-info {
  background: #13c2c2;
  color: white;
}

.btn-warning {
  background: #fa8c16;
  color: white;
}

.btn-danger {
  background: #ff4d4f;
  color: white;
}

.btn-success {
  background: #52c41a;
  color: white;
}

.btn:hover {
  opacity: 0.8;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 14px;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .post-management {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-input, .filter-select {
    min-width: auto;
    width: 100%;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .data-table {
    min-width: 600px;
  }
  
  .actions {
    flex-direction: column;
    gap: 4px;
  }
}
</style>